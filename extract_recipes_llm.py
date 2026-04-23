import os
import json
import time
import argparse
import base64
import io
import fitz  # PyMuPDF
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv
from tqdm import tqdm

# Load .env variables
load_dotenv('.env.local')
load_dotenv()

# Initialize OpenAI Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Recipe(BaseModel):
    title: str = Field(description="The exact title of the recipe")
    description: Optional[str] = Field(description="A brief description or subtitle of the recipe, if present")
    yield_amount: Optional[str] = Field(description="The yield or quantity produced (e.g., '1/2 cup', '4 servings')")
    ingredients: List[str] = Field(description="List of ingredients, properly formatted with fractions and units (e.g., '1/2 cup sugar', '2 tbsp salt')")
    instructions: List[str] = Field(description="Step-by-step instructions or procedures")
    categories: List[str] = Field(description="1 to 3 relevant categories for this recipe (e.g., 'Sauce', 'Vegetarian', 'Dessert')")

class RecipeExtractionResult(BaseModel):
    recipes: List[Recipe] = Field(description="List of recipes extracted from the provided pages")

def pdf_to_images(pdf_path, dpi=150):
    """Yields PIL Images for each page in the PDF."""
    try:
        from PIL import Image
    except ImportError:
        print("Please install Pillow: pip install Pillow")
        return []
        
    doc = fitz.open(pdf_path)
    print(f"Loaded PDF: {pdf_path} with {len(doc)} pages.")
    
    images = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=dpi)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        images.append(img)
        
    return images

def encode_image(image):
    """Encodes a PIL image to base64 string."""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def process_chunk_with_openai(images_chunk, chunk_index, retries=3):
    """Sends a chunk of images to OpenAI to extract structured recipes."""
    
    system_instruction = """You are an expert culinary data extraction AI. You are provided with images of consecutive pages from a culinary workbook.
Your goal is to extract every recipe present into a strict JSON structure.
CRITICAL RULES FOR MULTI-PAGE RECIPES:
1. Extract all recipes that begin on any of the provided pages EXCEPT the very last page. 
2. If a recipe's title and start are located on the VERY LAST image provided, DO NOT extract it. It will be processed in the next batch.
3. If a recipe starts on an earlier image and continues onto the final image, use the final image to COMPLETE the recipe.
4. Clean up any OCR/formatting noise (e.g., turn '¥' into '1/2' or '' into '°' if obvious from context).
5. Ignore headers/footers, page numbers, and unrelated lesson text ("Institute of Culinary", "Lesson...").
6. Output MUST strictly follow the requested JSON schema."""

    prompt_content = [
        {
            "type": "text",
            "text": f"Please extract the recipes from these {len(images_chunk)} pages according to the system instructions. Remember: Do not extract a recipe if it starts on image {len(images_chunk)} (the final image)."
        }
    ]
    
    for img in images_chunk:
        base64_image = encode_image(img)
        prompt_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
        })
    
    for attempt in range(retries):
        try:
            print(f"Sending chunk {chunk_index} ({len(images_chunk)} pages) to OpenAI... (Attempt {attempt + 1})")
            
            completion = client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt_content}
                ],
                response_format=RecipeExtractionResult,
                temperature=0.1,
            )
            
            recipes = completion.choices[0].message.parsed.recipes
            print(f"✅ Chunk {chunk_index} success: Extracted {len(recipes)} recipes.")
            return [recipe.dict() for recipe in recipes]
            
        except Exception as e:
            print(f"❌ Error on chunk {chunk_index} attempt {attempt + 1}: {e}")
            if attempt < retries - 1:
                time.sleep(10 * (attempt + 1))
            else:
                print(f"Failed chunk {chunk_index} after {retries} retries.")
                return []

def generate_markdown(recipe_data, output_dir="HSCArecipes"):
    """Generates beautifully formatted Markdown files for each recipe."""
    base_path = Path(output_dir)
    base_path.mkdir(parents=True, exist_ok=True)
    
    for recipe in recipe_data:
        # Determine primary category for folder structure
        primary_category = "Uncategorized"
        if recipe.get("categories") and len(recipe["categories"]) > 0:
            primary_category = recipe["categories"][0].replace("/", "-").strip()
            
        cat_path = base_path / primary_category
        cat_path.mkdir(exist_ok=True)
        
        # Clean title for filename
        safe_title = "".join([c for c in recipe["title"] if c.isalnum() or c in " -_"]).strip()
        file_path = cat_path / f"{safe_title}.md"
        
        md_content = f"# {recipe['title']}\n\n"
        if recipe.get("description"):
            md_content += f"*{recipe['description']}*\n\n"
            
        if recipe.get("yield_amount"):
            md_content += f"**Yield:** {recipe['yield_amount']}\n\n"
            
        md_content += "## Ingredients\n\n"
        for ing in recipe.get("ingredients", []):
            md_content += f"- {ing}\n"
            
        md_content += "\n## Instructions\n\n"
        for i, step in enumerate(recipe.get("instructions", []), 1):
            md_content += f"{i}. {step}\n"
            
        if recipe.get("categories"):
            md_content += f"\n---\n*Categories: {', '.join(recipe['categories'])}*\n"
            
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(md_content)

def main():
    parser = argparse.ArgumentParser(description="Extract recipes from PDF using GPT-4o Vision")
    parser.add_argument("--pdf", required=True, help="Path to the PDF file")
    parser.add_argument("--start", type=int, default=0, help="Start page index (0-based)")
    parser.add_argument("--end", type=int, default=None, help="End page index (exclusive)")
    args = parser.parse_args()
    
    pdf_path = args.pdf
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return
        
    all_images = pdf_to_images(pdf_path)
    if not all_images:
        return
        
    start_page = args.start
    end_page = args.end if args.end else len(all_images)
    images_to_process = all_images[start_page:end_page]
    
    print(f"Total pages to process: {len(images_to_process)} (from index {start_page} to {end_page-1})")
    
    # Process in chunks of 5 pages, with 1 page overlap
    CHUNK_SIZE = 5
    OVERLAP = 1
    STEP = CHUNK_SIZE - OVERLAP
    
    all_extracted_recipes = []
    
    # Load existing progress if available
    db_file = "recipes_database.json"
    if os.path.exists(db_file):
        with open(db_file, "r", encoding="utf-8") as f:
            try:
                all_extracted_recipes = json.load(f)
                print(f"Loaded {len(all_extracted_recipes)} existing recipes from {db_file}")
            except json.JSONDecodeError:
                print(f"Error loading {db_file}, starting fresh.")
            
    # Calculate chunks
    chunks = []
    for i in range(0, len(images_to_process), STEP):
        chunk = images_to_process[i:i+CHUNK_SIZE]
        if len(chunk) >= 1:
            chunks.append((i, chunk))
            
    print(f"Divided into {len(chunks)} chunks.")
    
    for chunk_idx, (start_idx, chunk_images) in enumerate(chunks):
        print(f"\n--- Processing chunk {chunk_idx + 1}/{len(chunks)} (Pages {start_idx + start_page} to {start_idx + start_page + len(chunk_images) - 1}) ---")
        recipes = process_chunk_with_openai(chunk_images, chunk_idx + 1)
        
        # Add to master list and save intermediate progress
        all_extracted_recipes.extend(recipes)
        with open(db_file, "w", encoding="utf-8") as f:
            json.dump(all_extracted_recipes, f, indent=2)
            
        print(f"Saved intermediate progress. Total recipes so far: {len(all_extracted_recipes)}")
        time.sleep(2) # Brief pause to avoid rate limits
        
    print("\n🎉 Extraction Complete! Generating Markdown files...")
    generate_markdown(all_extracted_recipes, output_dir="HSCArecipes")
    print(f"Successfully generated Markdown files in the 'HSCArecipes' directory.")

if __name__ == "__main__":
    main()
