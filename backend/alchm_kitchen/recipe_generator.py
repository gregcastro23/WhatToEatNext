"""
Creative Recipe Generator based on Astrological Profiles.
This module provides functions to generate personalized meal recommendations
(breakfast, lunch, dinner) based on a user's Sun, Moon, and Ascendant signs.
"""
import random
from typing import Dict, Any

def get_astrological_recipes(sun_sign: str, moon_sign: str, ascendant_sign: str) -> Dict[str, Any]:
    """
    Generates a full day of astrologically-inspired recipes.

    Args:
        sun_sign: The user's Sun sign.
        moon_sign: The user's Moon sign.
        ascendant_sign: The user's Ascendant sign.

    Returns:
        A dictionary containing breakfast, lunch, and dinner recommendations.
    """
    sun_sign = sun_sign.lower()
    moon_sign = moon_sign.lower()
    ascendant_sign = ascendant_sign.lower()

    return {
        "breakfast": get_breakfast_recipe(sun_sign, ascendant_sign),
        "lunch": get_lunch_recipe(moon_sign, sun_sign),
        "dinner": get_dinner_recipe(ascendant_sign, sun_sign, moon_sign),
    }

def get_breakfast_recipe(sun_sign: str, ascendant_sign: str) -> Dict[str, str]:
    """Generates a breakfast recipe based on Sun and Ascendant signs."""
    recipes = {
        "aries": {
            "name": "Fiery Aries Breakfast Scramble",
            "description": "A spicy chorizo and red pepper scramble to kickstart the day with energy and passion.",
            "explanation": f"Your {sun_sign.title()} Sun provides your core energy. This fiery, protein-packed breakfast with a little spice from the chorizo resonates with Aries' cardinal fire energy, getting your day started quickly and decisively. The vibrant red colors also align with Mars-ruled Aries."
        },
        "taurus": {
            "name": "Decadent Taurus Toast",
            "description": "Thick-cut brioche French toast with high-quality maple syrup and a dusting of cinnamon.",
            "explanation": f"As a {sun_sign.title()}, you appreciate comfort and quality. This luxurious but simple breakfast appeals to your Venusian side. It's a sensual, grounding meal that provides steady, delicious energy, satisfying your earthy nature."
        },
        "gemini": {
            "name": "Gemini Breakfast Tapas",
            "description": "A plate with a variety of small bites: a mini-quiche, some fruit, a slice of cheese, and a small pastry.",
            "explanation": f"Your {sun_sign.title()} Sun loves variety and information. Instead of one big meal, this tapas-style plate lets you sample many different flavors and textures, keeping your curious, air-sign nature engaged and preventing boredom."
        },
        "cancer": {
            "name": "Comforting Cancer Oatmeal",
            "description": "A warm bowl of creamy oatmeal with milk, honey, and a swirl of berry jam.",
            "explanation": f"Your {sun_sign.title()} is ruled by the Moon, which seeks comfort and emotional nourishment. This classic, nurturing breakfast is like a warm hug in a bowl, providing the gentle, comforting start to the day that your Cancerian nature craves."
        },
        "leo": {
            "name": "Golden Leo Sunshine Porridge",
            "description": "A vibrant porridge with turmeric, apricot compote, and a sunburst pattern of sunflower seeds.",
            "explanation": f"Your {sun_sign.title()} Sun shines brightly. This visually stunning, golden-hued breakfast directly resonates with your ruling planet, the Sun. It's a dramatic, creative, and heart-healthy meal that appeals to your flair for the theatrical."
        },
        "virgo": {
            "name": "Virgo Vitality Green Smoothie",
            "description": "A meticulously balanced green smoothie with spinach, banana, almond milk, and a scoop of protein powder.",
            "explanation": f"As a health-conscious, earth-sign {sun_sign.title()}, you appreciate efficiency and purity. This smoothie is a quick, nutrient-dense, and perfectly balanced meal that provides clean energy, aligning with your desire for physical and digestive well-being."
        },
        "libra": {
            "name": "Balanced Libra Breakfast Bowl",
            "description": "A beautiful yogurt bowl with perfectly arranged berries, granola, and a drizzle of honey.",
            "explanation": f"Your {sun_sign.title()} seeks harmony and beauty. This aesthetically pleasing breakfast bowl is all about balance—of flavor, texture, and nutrition. Its artful presentation appeals to your Venus-ruled eye for elegance."
        },
        "scorpio": {
            "name": "Intense Scorpio Shakshuka",
            "description": "Eggs poached in a rich, spicy tomato and pepper sauce with a hint of smoked paprika.",
            "explanation": f"Your {sun_sign.title()} craves depth and intensity. Shakshuka's deep, complex flavors and rich, dark red color resonate with Scorpio's mysterious and powerful nature. It's a passionate and satisfying dish."
        },
        "sagittarius": {
            "name": "Sagittarius Global Breakfast Burrito",
            "description": "A breakfast burrito filled with eggs, black beans, avocado, and a dash of exotic hot sauce.",
            "explanation": f"Your {sun_sign.title()} loves adventure and exploring different cultures. This breakfast burrito is a portable meal that incorporates international flavors, satisfying your Jupiter-ruled desire for expansion and worldly experiences."
        },
        "capricorn": {
            "name": "Classic Capricorn Breakfast",
            "description": "A traditional breakfast of eggs, high-quality toast, and a side of smoked salmon or bacon.",
            "explanation": f"As a {sun_sign.title()}, you value tradition, structure, and quality. This no-fuss, classic breakfast is built on high-quality staple ingredients. It's a reliable, respectable, and grounding meal that provides the fuel for a productive day."
        },
        "aquarius": {
            "name": "Aquarian Future-Toast",
            "description": "Avocado toast on artisan sourdough, topped with nutritional yeast and hemp seeds.",
            "explanation": f"Your {sun_sign.title()} is innovative and forward-thinking. This modern classic takes a familiar concept and updates it with nutritious, slightly unconventional ingredients like nutritional yeast and hemp seeds, appealing to your intellectual and progressive nature."
        },
        "pisces": {
            "name": "Dreamy Pisces Smoothie Bowl",
            "description": "A beautiful, swirled smoothie bowl with blue spirulina, banana, and topped with coconut flakes and berries.",
            "explanation": f"Your {sun_sign.title()} is imaginative and connected to the ethereal. The dreamy, watercolor-like appearance of this smoothie bowl with blue spirulina appeals to your artistic side. It's a light, hydrating, and magical-looking meal to ease you into your day."
        }
    }
    # Use ascendant as a tie-breaker, but default to sun sign
    return recipes.get(sun_sign, recipes.get(ascendant_sign, recipes["leo"]))

def get_lunch_recipe(moon_sign: str, sun_sign: str) -> Dict[str, str]:
    """Generates a lunch recipe based on Moon and Sun signs."""
    recipes = {
        "aries": {
            "name": "Aries Quick-Fire Quesadilla",
            "description": "A quickly made quesadilla with spicy chicken and pepper jack cheese.",
            "explanation": f"Your {moon_sign.title()} Moon needs quick emotional satisfaction. A quesadilla is fast, hot, and satisfying, reflecting the impulsive and fiery nature of Aries. It provides an immediate comfort fix."
        },
        "taurus": {
            "name": "Grounding Taurus Lunch Bowl",
            "description": "A hearty bowl with root vegetables, whole grains, and a creamy tahini dressing.",
            "explanation": f"Your {moon_sign.title()} Moon finds security in sensory comfort and stability. This earthy, substantial bowl with grounding root vegetables helps you feel nurtured and connected to the earth, satisfying your need for tangible comfort."
        },
        "gemini": {
            "name": "Gemini 'Chatterbox' Salad",
            "description": "A salad with a multitude of ingredients: various greens, nuts, seeds, veggies, and a light vinaigrette.",
            "explanation": f"Your {moon_sign.title()} Moon is intellectually and emotionally restless. This salad, with its wide variety of ingredients, gives your mind plenty to process and keeps your palate from getting bored, satisfying your need for mental stimulation."
        },
        "cancer": {
            "name": "Nostalgic Cancer Tomato Soup",
            "description": "A classic, creamy tomato soup, perhaps served with a grilled cheese for dipping.",
            "explanation": f"Your {moon_sign.title()} Moon is in its home sign of Cancer, craving nostalgia and emotional safety. Tomato soup is a universally comforting, childhood-favorite food that provides a deep sense of warmth, security, and care."
        },
        "leo": {
            "name": "Leo's 'Center Stage' Salad",
            "description": "A vibrant salad with grilled chicken or salmon, colorful bell peppers, and a bold, sunny lemon vinaigrette.",
            "explanation": f"Your {moon_sign.title()} Moon needs to feel special and recognized. This is not a boring side salad; it's a main-event salad, full of vibrant, high-quality ingredients. Its 'star power' provides the emotional boost of feeling celebrated."
        },
        "virgo": {
            "name": "The Virgo 'Clean Slate' Bowl",
            "description": "A clean, simple quinoa bowl with steamed vegetables, chickpeas, and a light lemon-herb dressing.",
            "explanation": f"Your {moon_sign.title()} Moon feels emotionally secure when your body feels clean and in order. This simple, healthy, and easily digestible meal helps reset your system, providing the emotional comfort of feeling pure and efficient."
        },
        "libra": {
            "name": "Harmonious Libra Bento Box",
            "description": "An elegant bento box with balanced portions of rice, a small piece of fish, a seaweed salad, and pickled ginger.",
            "explanation": f"Your {moon_sign.title()} Moon seeks emotional equilibrium and peace. The bento box is the epitome of balance and harmony, with each component separate yet complementary. It's a visually pleasing and peaceful meal."
        },
        "scorpio": {
            "name": "Scorpio Detox Broth",
            "description": "A flavorful, dark mushroom and miso broth with slices of tofu and scallions.",
            "explanation": f"Your {moon_sign.title()} Moon needs to feel emotionally cleansed and powerful. This intense, flavorful, and deeply savory broth has a purifying quality. It helps you reset emotionally, satisfying Scorpio's need for transformation."
        },
        "sagittarius": {
            "name": "Adventurous Sagittarius Buddha Bowl",
            "description": "A colorful Buddha bowl with ingredients from different cuisines, like edamame, corn salsa, and spiced chickpeas.",
            "explanation": f"Your {moon_sign.title()} Moon is optimistic and freedom-seeking. This bowl is a mini-adventure, combining different flavors and cultures in one dish. It satisfies your emotional need for exploration and wide-open spaces."
        },
        "capricorn": {
            "name": "The Architect's Earth Bowl",
            "description": "A structured bowl with a base of brown rice, topped with roasted broccoli, lentils, and a sprinkle of goat cheese.",
            "explanation": f"Your {moon_sign.title()} Moon in Capricorn finds comfort in structure and discipline. This is a well-built, reliable, and nourishing meal. Its earthy and traditional ingredients provide a sense of being grounded and capable."
        },
        "aquarius": {
            "name": "Aquarian Community Bowl",
            "description": "A grain bowl with unusual ingredients like spirulina-dusted chickpeas or seaweed flakes.",
            "explanation": f"Your {moon_sign.title()} Moon feels connected through intellectual and group ideals. This bowl, with its slightly unconventional and 'good-for-humanity' ingredients, helps you feel emotionally aligned with your progressive values."
        },
        "pisces": {
            "name": "Soothing Pisces Miso Soup",
            "description": "A simple, light, and hydrating miso soup with soft tofu and seaweed.",
            "explanation": f"Your {moon_sign.title()} Moon is sensitive and needs to feel connected to the flow of the universe. This light, watery soup is spiritually and physically hydrating. It's a gentle meal that soothes the soul and calms the emotional tides."
        }
    }
    # Use sun sign as a tie-breaker, but default to moon sign
    return recipes.get(moon_sign, recipes.get(sun_sign, recipes["taurus"]))

def get_dinner_recipe(ascendant_sign: str, sun_sign: str, moon_sign: str) -> Dict[str, str]:
    """Generates a dinner recipe based on Ascendant, Sun, and Moon signs."""
    recipes = {
        "aries": {
            "name": "Pioneering Aries Steak",
            "description": "A perfectly grilled steak with a fiery peppercorn sauce, served with bold asparagus spears.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant is how you project yourself to the world. This is a bold, confident, no-fuss meal that says 'I'm here.' It's a primal, energetic dish that showcases your direct and pioneering spirit."
        },
        "taurus": {
            "name": "Taurus 'Slow and Low' Pot Roast",
            "description": "A slow-cooked pot roast with root vegetables, rich in flavor and fork-tender.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant projects an aura of calm, stability, and sensuality. This slow-cooked, classic meal is the essence of earthy abundance. It's a dish that takes its time, promising deep satisfaction and comfort."
        },
        "gemini": {
            "name": "Communicative Gemini Dinner Party Pasta",
            "description": "A light, versatile pasta with a variety of fresh herbs, cherry tomatoes, and a choice of protein.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant is sociable and adaptable. This is a perfect dish for sharing and conversation. It’s light, not too heavy, and offers variety, allowing for easy interaction and a lively dinner atmosphere."
        },
        "cancer": {
            "name": "Nurturing Cancer Roast Chicken",
            "description": "A whole roasted chicken with lemon and herbs, served with creamy mashed potatoes.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant gives you a caring, protective demeanor. A roast chicken is the ultimate meal of home and family. It presents an image of someone who is a nurturer and a provider of comfort and security."
        },
        "leo": {
            "name": "Leo's Royal Feast Salmon",
            "description": "A large, impressive side of baked salmon, beautifully garnished with herbs and lemon slices.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant is charismatic and loves to be the host. This dish is a dramatic centerpiece, a 'royal' offering for your guests (or yourself!). It's generous, impressive, and puts you in the role of the magnanimous host."
        },
        "virgo": {
            "name": "Refined Virgo Lemon Herb Fish",
            "description": "A delicate white fish, pan-seared with a precise lemon, butter, and herb sauce, served on a bed of wilted spinach.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant projects an image of refinement, intelligence, and purity. This is a clean, elegant, and perfectly executed dish. It showcases attention to detail and a mastery of simple, high-quality ingredients."
        },
        "libra": {
            "name": "Elegant Libra Scallops",
            "description": "Pan-seared scallops served over a bed of risotto, with a balanced and delicate sauce.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant is charming, graceful, and has a refined aesthetic. Scallops are an elegant and sophisticated choice. This dish is all about balance—the creamy risotto and the delicate scallops creating a harmonious and beautiful plate."
        },
        "scorpio": {
            "name": "Mysterious Scorpio Black Pasta",
            "description": "Squid ink pasta with seafood in a rich, spicy tomato sauce.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant has a magnetic and mysterious allure. The dark, dramatic color of the squid ink pasta is visually striking and intriguing. The deep, intense flavors hint at hidden depths, perfectly matching your persona."
        },
        "sagittarius": {
            "name": "Worldly Sagittarius Curry",
            "description": "An aromatic and flavorful Thai or Indian curry with coconut milk, exotic spices, and plenty of vegetables.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant is adventurous, philosophical, and open-minded. A curry, with its complex blend of spices from a faraway land, presents you as a world traveler with a broad perspective and a taste for the exotic."
        },
        "capricorn": {
            "name": "Timeless Capricorn Lamb Chops",
            "description": "Perfectly cooked lamb chops with a classic rosemary and garlic crust, served with roasted potatoes.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant projects an aura of authority, competence, and timeless class. Lamb chops are a classic, sophisticated, and respected dish. It shows you as someone with discerning taste and an appreciation for enduring quality."
        },
        "aquarius": {
            "name": "Innovative Aquarius Deconstructed Dish",
            "description": "A 'deconstructed' shepherd's pie, with a base of lentils and mushrooms, topped with a swirl of potato puree and a separate herb oil.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant is unique, intellectual, and a bit quirky. A deconstructed dish is a playful, cerebral take on a classic. It shows you as an innovator who sees the world differently and isn't afraid to break the rules."
        },
        "pisces": {
            "name": "Poetic Pisces Cioppino",
            "description": "A dreamy, savory seafood stew with a variety of fish and shellfish in a tomato-wine broth.",
            "explanation": f"Your {ascendant_sign.title()} Ascendant is gentle, artistic, and compassionate. A cioppino is a 'soup of the sea,' a beautiful melding of different elements into one harmonious, soulful dish. It reflects your fluid, go-with-the-flow, and deeply empathetic nature."
        }
    }
    # Use other signs as tie-breakers, but default to ascendant
    return recipes.get(ascendant_sign, recipes.get(sun_sign, recipes.get(moon_sign, recipes["gemini"])))