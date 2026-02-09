import datetime

def get_zodiac_sign(date):
    day = date.day
    month = date.month

    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return 'Aries'
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return 'Taurus'
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return 'Gemini'
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return 'Cancer'
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return 'Leo'
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return 'Virgo'
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return 'Libra'
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return 'Scorpio'
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return 'Sagittarius'
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return 'Capricorn'
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return 'Aquarius'
    elif (month == 2 and day >= 19) or (month == 3 and day <= 20):
        return 'Pisces'
    return 'Unknown' # Should not happen with valid dates

def get_elemental_boosts(zodiac_sign):
    fire_boost = []
    earth_boost = []
    air_boost = []
    water_boost = []

    if zodiac_sign in ['Aries', 'Leo', 'Sagittarius']:
        fire_boost = ['chili', 'pepper', 'garlic']
    elif zodiac_sign in ['Taurus', 'Virgo', 'Capricorn']:
        earth_boost = ['grains', 'potatoes', 'squash']
    elif zodiac_sign in ['Gemini', 'Libra', 'Aquarius']:
        air_boost = ['microgreens', 'sprouts']
    elif zodiac_sign in ['Cancer', 'Scorpio', 'Pisces']:
        water_boost = ['soups', 'broths', 'melons']

    return {
        'fire': fire_boost,
        'earth': earth_boost,
        'air': air_boost,
        'water': water_boost,
        'current_zodiac': zodiac_sign
    }

def get_seasonal_modifiers(date=None):
    if date is None:
        date = datetime.date.today()
    
    zodiac_sign = get_zodiac_sign(date)
    return get_elemental_boosts(zodiac_sign)

if __name__ == '__main__':
    # Example usage:
    today = datetime.date.today()
    modifiers = get_seasonal_modifiers(today)
    print(f"Seasonal modifiers for today ({today}): {modifiers}")

    # Test for a specific date (e.g., Leo season)
    leo_date = datetime.date(2024, 8, 10)
    leo_modifiers = get_seasonal_modifiers(leo_date)
    print(f"Seasonal modifiers for Leo season ({leo_date}): {leo_modifiers}")

    # Test for a specific date (e.g., Taurus season)
    taurus_date = datetime.date(2024, 5, 5)
    taurus_modifiers = get_seasonal_modifiers(taurus_date)
    print(f"Seasonal modifiers for Taurus season ({taurus_date}): {taurus_modifiers}")