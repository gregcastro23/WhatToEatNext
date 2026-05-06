import os
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, joinedload
import sys
from pathlib import Path

# Add backend to path to import models
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from database.models import Base, Ingredient, Recipe, RecipeIngredient, RecipeContext, ElementalProperties, PlanetaryInfluence, ZodiacAffinity, SeasonalAssociation

NEON_URL = "postgresql://neondb_owner:npg_kHLuO2D3wZEg@ep-patient-bread-amcjoqiw-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
RAILWAY_URL = "postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway"

source_engine = create_engine(NEON_URL)
dest_engine = create_engine(RAILWAY_URL)
DestSession = sessionmaker(bind=dest_engine)

def migrate():
    print("🚀 Starting SQL-Based Migration from Neon to Railway...")
    
    # 1. Initialize Schema
    print("🛠 Initializing schema on Railway...")
    with dest_engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"))
        try:
            conn.execute(text("CREATE TYPE user_role AS ENUM ('ALCHEMIST', 'ADMIN', 'USER');"))
        except Exception: conn.execute(text("ROLLBACK;"))
        try:
            conn.execute(text("CREATE TYPE cuisine_type_enum AS ENUM ('African', 'American', 'Chinese', 'French', 'Greek', 'Indian', 'Italian', 'Japanese', 'Korean', 'Mexican', 'Middle Eastern', 'Russian', 'Thai', 'Vietnamese', 'General');"))
        except Exception: conn.execute(text("ROLLBACK;"))
        try:
            conn.execute(text("CREATE TYPE dietary_restriction_enum AS ENUM ('Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Low Carb', 'Paleo', 'Keto', 'Halal', 'Kosher', 'None');"))
        except Exception: conn.execute(text("ROLLBACK;"))
        conn.commit()

    Base.metadata.create_all(dest_engine)

    # 2. Table-by-Table Data Copy (Raw SQL)
    tables = [
        'ingredients', 'elemental_properties', 'planetary_influences', 
        'zodiac_affinities', 'seasonal_associations', 'recipes', 
        'recipe_ingredients', 'recipe_contexts'
    ]

    with source_engine.connect() as src_conn, dest_engine.connect() as dest_conn:
        for table in tables:
            print(f"📦 Copying table: {table}...")
            # Fetch all rows from source
            rows = src_conn.execute(text(f"SELECT * FROM {table}")).fetchall()
            if not rows:
                print(f"  (Table {table} is empty, skipping)")
                continue

            # Get column names
            columns = rows[0]._fields
            placeholders = ", ".join([f":{col}" for col in columns])
            col_str = ", ".join(columns)
            
            # Insert into destination
            insert_stmt = text(f"INSERT INTO {table} ({col_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING")
            
            # Get column types to distinguish JSONB from ARRAY
            # This is a bit tricky with raw SQL, so we'll use a heuristic or 
            # better yet, check the model definition if we have a table name
            from sqlalchemy import inspect
            inspector = inspect(dest_engine)
            columns_info = {c['name']: c['type'] for c in inspector.get_columns(table)}

            # Execute in batches
            batch_size = 100
            for i in range(0, len(rows), batch_size):
                batch = []
                for row in rows[i:i+batch_size]:
                    row_dict = dict(row._mapping)
                    for key, val in row_dict.items():
                        if val is None:
                            continue
                        
                        col_type = str(columns_info.get(key, "")).upper()
                        if "JSON" in col_type and isinstance(val, (dict, list)):
                            row_dict[key] = json.dumps(val)
                        elif "ARRAY" in col_type and isinstance(val, str) and val.startswith("[") and val.endswith("]"):
                            # If it was already a string representation of a list, keep it as a list
                            try:
                                row_dict[key] = json.loads(val)
                            except:
                                pass
                        # For ARRAY columns, psycopg2 expects a list, which 'val' already is if from src_conn
                    batch.append(row_dict)
                
                dest_conn.execute(insert_stmt, batch)
                dest_conn.commit()
            
            print(f"  Successfully copied {len(rows)} rows to {table}.")

    # 3. Build Read Models on Railway
    print("🔄 Building Read Models on Railway...")
    with DestSession() as session:
        railway_recipes = session.query(Recipe).options(
            joinedload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient),
            joinedload(Recipe.contexts)
        ).all()
        
        for i, rec in enumerate(railway_recipes):
            elem = session.query(ElementalProperties).filter(
                ElementalProperties.entity_type == 'recipe',
                ElementalProperties.entity_id == str(rec.id)
            ).first()

            read_model = {
                "id": str(rec.id),
                "name": rec.name,
                "description": rec.description,
                "cuisine": str(rec.cuisine.value) if hasattr(rec.cuisine, 'value') else str(rec.cuisine),
                "category": rec.category,
                "instructions": rec.instructions,
                "prep_time_minutes": rec.prep_time_minutes,
                "cook_time_minutes": rec.cook_time_minutes,
                "servings": rec.servings,
                "dietary_tags": [str(t.value) if hasattr(t, 'value') else str(t) for t in rec.dietary_tags],
                "allergens": rec.allergens,
                "nutritional_profile": rec.nutritional_profile,
                "ingredients": [
                    {
                        "name": ri.ingredient.name if ri.ingredient else "Unknown",
                        "quantity": ri.quantity,
                        "unit": ri.unit,
                        "preparation": ri.preparation_notes
                    } for ri in rec.ingredients
                ],
                "contexts": [
                    {
                        "lunar": ctx.recommended_moon_phases,
                        "seasonal": ctx.recommended_seasons,
                        "timeOfDay": ctx.time_of_day
                    } for ctx in rec.contexts
                ],
                "elemental_properties": {
                    "fire": elem.fire if elem else 0.25,
                    "water": elem.water if elem else 0.25,
                    "earth": elem.earth if elem else 0.25,
                    "air": elem.air if elem else 0.25,
                }
            }
            rec.read_model = read_model
            
            if i % 50 == 0:
                session.commit()
                print(f"  Finalized {i} read models...")
        
        session.commit()
        print(f"✅ Migration Complete! Railway is now the primary, optimized database.")

if __name__ == "__main__":
    migrate()
