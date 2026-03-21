import os
import random

def generate_visual_prompt(recipe_data):
    """
    Synthesizes a 150-word visual prompt for food photography based on alchemical and astrological data.
    """
    # Extract data from RecipeData object
    name = recipe_data.get('name', 'Artisanal Dish')
    description = recipe_data.get('description', 'A carefully prepared alchemical creation.')
    cuisine = recipe_data.get('cuisine', 'Global Fusion')
    
    # Elemental Properties (Fire, Water, Earth, Air)
    elemental_props = recipe_data.get('elementalProperties', {})
    # Support both 'Fire' and 'fire' keys
    fire = elemental_props.get('Fire', elemental_props.get('fire', 0.25))
    water = elemental_props.get('Water', elemental_props.get('water', 0.25))
    earth = elemental_props.get('Earth', elemental_props.get('earth', 0.25))
    air = elemental_props.get('Air', elemental_props.get('air', 0.25))
    
    # Monica Score (0-100)
    monica_score = recipe_data.get('monicaScore', recipe_data.get('alchemical_harmony_score', 0.75))
    # If monica_score is 0-1, scale to 0-100
    if isinstance(monica_score, (int, float)) and monica_score <= 1.0:
        monica_score *= 100
    elif not isinstance(monica_score, (int, float)):
        monica_score = 75
        
    # Energy Profile (Zodiac, Lunar Phase, Season)
    # Support both 'energyProfile' and 'astrologicalAffinities'
    energy_profile = recipe_data.get('energyProfile', recipe_data.get('astrologicalAffinities', {}))
    
    # Handle both list and string for Zodiac
    zodiac_data = energy_profile.get('Zodiac', energy_profile.get('signs', ['Aries']))
    zodiac = zodiac_data[0] if isinstance(zodiac_data, list) and zodiac_data else (zodiac_data if isinstance(zodiac_data, str) else 'Aries')
    
    # Handle both list and string for Lunar Phase
    lunar_data = energy_profile.get('Lunar Phase', energy_profile.get('lunarPhases', ['Full Moon']))
    lunar_phase = lunar_data[0] if isinstance(lunar_data, list) and lunar_data else (lunar_data if isinstance(lunar_data, str) else 'Full Moon')
    
    # Handle Season
    season_data = energy_profile.get('Season', recipe_data.get('details', {}).get('season', ['Summer']))
    season = season_data[0] if isinstance(season_data, list) and season_data else (season_data if isinstance(season_data, str) else 'Summer')
    
    # Cooking Methods
    cooking_methods = recipe_data.get('cookingMethods', recipe_data.get('classifications', {}).get('cookingMethods', []))

    # --- 1. Elemental Balance Descriptors ---
    elemental_cues = []
    if fire > 0.4:
        elemental_cues.append("The scene is bathed in warm golden lighting with visible tendrils of steam rising from the plate. Charred, caramelized textures are prominent, highlighted by vibrant reds and deep oranges that evoke metabolic heat.")
    if water > 0.4:
        elemental_cues.append("Lighting is soft and diffused, reflecting off glistening surfaces and fresh dew-like droplets. Cool blue and emerald green accents create a refreshing, aqueous atmosphere that suggests emotional depth and fluidity.")
    if earth > 0.4:
        elemental_cues.append("The presentation features rustic ceramic plating with matte, tactile textures. Deep browns, ochres, and forest greens dominate the palette, arranged in a grounded, stable composition that emphasizes substance and matter.")
    if air > 0.4:
        elemental_cues.append("A bright, high-key lighting setup illuminates a light and airy plating style. The focus is on delicate garnishes and an ethereal, suspended atmosphere that feels expansive and intellectually stimulating.")

    # --- 2. Monica Scoring Descriptors ---
    monica_cues = ""
    if monica_score >= 90:
        monica_cues = "This is an Alchemical Gold masterpiece. The composition is flawlessly balanced with intricate garnishes, glowing highlights, and an ultra-premium commercial quality that radiates harmony."
    elif monica_score < 45:
        monica_cues = "The presentation is volatile and entropic, featuring raw, visceral energy. Experimental plating with high-contrast shadows and jagged textures creates a sense of primal transformation."
    else:
        monica_cues = "The dish exhibits a steady alchemical resonance, with a clean and professional presentation that balances traditional form with modern culinary aesthetics."

    # --- 3. Energy Profile (Zodiac) Descriptors ---
    zodiac_aesthetics = {
        "Aries": "A bold and dynamic high-energy composition with sharp lighting and fiery accents.",
        "Taurus": "Lush natural textures and deep earthy greens, set in a rich, indulgent, and grounded environment.",
        "Gemini": "A multifaceted and airy composition with varied light-and-shadow play and whimsical, light-hearted details.",
        "Cancer": "Soft pearlescent lighting with silver accents, creating a gentle, comforting, and moonlit atmosphere.",
        "Leo": "Royal and opulent with gold accents, sun-drenched lighting, and a majestic, centered masterpiece composition.",
        "Virgo": "Clean, precise plating with meticulous organic details and a palette of natural, soft earthy tones.",
        "Libra": "An artistic and perfectly balanced composition featuring elegant pastel accents and a light, airy grace.",
        "Scorpio": "Deep, intense shadows and mysterious dark red accents with high-contrast, moody lighting.",
        "Sagittarius": "An expansive, adventurous composition with deep purple accents and wild, rustic elements from afar.",
        "Capricorn": "Classic, structured, and minimalist plating with dark architectural shadows and a timeless, stoic quality.",
        "Aquarius": "Futuristic cool blue lighting and unconventional electric accents with an innovative, forward-thinking presentation.",
        "Pisces": "A dreamlike, nebulous soft-focus effect with ethereal oceanic blues and a mystical, shimmering atmosphere."
    }
    zodiac_cue = zodiac_aesthetics.get(zodiac, zodiac_aesthetics.get(zodiac.capitalize(), zodiac_aesthetics["Aries"]))

    # --- 4. Lunar and Seasonal Descriptors ---
    lunar_aesthetics = {
        "New Moon": "The backdrop is dark and mysterious, with minimalist lighting that emphasizes the hidden essence of the ingredients.",
        "Waxing Crescent": "Delicate silver highlights trace the edges of the dish, suggesting a fresh promise and emerging vitality.",
        "First Quarter": "Balanced contrast between light and shadow reveals the emerging structure and growth of the alchemical components.",
        "Full Moon": "A luminous, silver glow bathes the entire scene, creating a majestic and highly visible celebration of form.",
        "Waning Gibbous": "The lighting is maturing and mellow, highlighting deep, satisfying colors and rich, well-developed textures.",
        "Last Quarter": "Reflective and quiet, the atmosphere uses soft shadows to emphasize the refined wisdom of the preparation.",
        "Waning Crescent": "Minimalist and focused, the lighting distills the dish down to its final, most potent essence."
    }
    lunar_cue = lunar_aesthetics.get(lunar_phase, lunar_aesthetics["Full Moon"])
    
    season_aesthetics = {
        "Spring": "The palette is filled with fresh vibrant greens and soft pastels, evoking morning light and dew-kissed textures.",
        "Summer": "Saturated colors and high-noon intensity create a scene of golden heat and vibrant, peak-ripeness energy.",
        "Autumn": "Warm earthy tones of deep red and copper are illuminated by low, golden-hour lighting and rustic textures.",
        "Winter": "Cool blue and crisp white tones define a stark, minimalist presentation warmed by cozy, flickering highlights."
    }
    season_cue = season_aesthetics.get(season, season_aesthetics["Summer"])

    # --- 5. Synthesis ---
    prompt_parts = [
        f"Professional food photography of {name}: {description}.",
        f"The dish, rooted in {cuisine} traditions, is captured in exquisite detail.",
        " ".join(elemental_cues),
        monica_cues,
        zodiac_cue,
        lunar_cue,
        season_cue,
        f"The visual narrative highlights {', '.join(cooking_methods)} techniques, emphasizing the {zodiac} energy of the moment.",
        "Commercial lighting, 8k resolution, macro lens, shallow depth of field, sharp focus on the main subject, blurred artistic background, hyper-realistic textures, vibrant colors."
    ]

    full_prompt = " ".join(prompt_parts)
    
    # Word count check and expansion if necessary
    words = full_prompt.split()
    if len(words) < 150:
        fillers = [
            "The composition uses the rule of thirds to draw the eye toward the intricate textures of the primary ingredients.",
            "Subtle steam rises in elegant spirals, catching the light to suggest the dish has just been plated.",
            "Each garnish is placed with surgical precision, contributing to the overall alchemical harmony of the visual field.",
            "The background features soft bokeh, suggesting a high-end restaurant or a sacred alchemical laboratory.",
            "Colors are rich and deep, with micro-details visible in the moisture and char of the surfaces."
        ]
        while len(full_prompt.split()) < 150 and fillers:
            full_prompt += " " + fillers.pop(0)
            
    return full_prompt

class NanoBananaPro:
    """
    Bridge to the Nano Banana Pro image generation engine.
    """
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("NANOBANANA_API_KEY")

    async def generate(self, prompt, output_path="generated_image.png"):
        # Placeholder for real API call (e.g. Google Imagen/Gemini)
        # In production, this would return a real URL or save to a bucket
        return f"https://placehold.co/1024x1024/1e293b/ffffff?text=Alchemical+Image+Generated"
