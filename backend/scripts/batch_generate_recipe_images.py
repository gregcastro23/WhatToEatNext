#!/usr/bin/env python3
"""
Batch Recipe Image Generator
Generates images for all recipes in the database without an image_url.
"""
import asyncio
import httpx
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.models import Recipe

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5434/alchm_kitchen")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def generate_images():
    print("Starting batch image generation...")
    db = SessionLocal()
    
    try:
        # Fetch recipes that don't have an image_url
        recipes = db.query(Recipe).filter(Recipe.image_url.is_(None)).all()
        print(f"Found {len(recipes)} recipes without images.")
        
        if len(recipes) == 0:
            print("All recipes already have images!")
            return
            
        print("Disclaimer: This script hits the OpenAI API (DALL-E 3) and will incur costs (approx $0.04/image).")
        proceed = input(f"Proceed generating {len(recipes)} images? (y/n): ")
        if proceed.lower() != 'y':
            print("Aborting.")
            return

        async with httpx.AsyncClient(timeout=30.0) as client:
            for index, recipe in enumerate(recipes):
                print(f"[{index + 1}/{len(recipes)}] Generating image for '{recipe.name}'...")
                
                try:
                    response = await client.post(
                        "http://localhost:8001/api/generate-alchemical-image",
                        json={
                            "recipe_id": str(recipe.id),
                            "title": recipe.name,
                            "description": recipe.description
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(f"  -> Success! URL: {data['url']}")
                    else:
                        print(f"  -> Error {response.status_code}: {response.text}")
                        
                except Exception as e:
                    print(f"  -> Exception occurred: {str(e)}")
                    
                # Add a small delay to respect OpenAI rate limits
                await asyncio.sleep(2)
                
    finally:
        db.close()
        print("Finished.")

if __name__ == "__main__":
    asyncio.run(generate_images())
