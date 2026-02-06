# backend/utils/security.py

import os
from typing import Dict, Any

# Placeholder for a secret key. In a real application, this should be loaded
# securely from environment variables or a key management service, NOT hardcoded.
SECRET_KEY = os.getenv("ENCRYPTION_SECRET_KEY", "a_super_secret_and_long_key_for_demonstration_purposes_only_12345")

def encrypt_data(data: str) -> str:
    """
    Placeholder function to encrypt data.
    In a real implementation, use a strong encryption library like `cryptography`.
    For demonstration, this simply base64 encodes the data.
    """
    import base64
    return base64.b64encode(data.encode('utf-8')).decode('utf-8')

def decrypt_data(encrypted_data: str) -> str:
    """
    Placeholder function to decrypt data.
    In a real implementation, use a strong encryption library like `cryptography`.
    For demonstration, this simply base64 decodes the data.
    """
    import base64
    return base64.b64decode(encrypted_data.encode('utf-8')).decode('utf-8')

def encrypt_chart_data(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Encrypts sensitive birth chart data (birth_time, latitude, longitude).
    """
    encrypted_data = chart_data.copy()
    if 'birth_time' in encrypted_data and encrypted_data['birth_time'] is not None:
        encrypted_data['birth_time'] = encrypt_data(encrypted_data['birth_time'])
    if 'birth_latitude' in encrypted_data and encrypted_data['birth_latitude'] is not None:
        encrypted_data['birth_latitude'] = encrypt_data(str(encrypted_data['birth_latitude']))
    if 'birth_longitude' in encrypted_data and encrypted_data['birth_longitude'] is not None:
        encrypted_data['birth_longitude'] = encrypt_data(str(encrypted_data['birth_longitude']))
    return encrypted_data

def decrypt_chart_data(encrypted_chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Decrypts sensitive birth chart data (birth_time, latitude, longitude).
    """
    decrypted_data = encrypted_chart_data.copy()
    if 'birth_time' in decrypted_data and decrypted_data['birth_time'] is not None:
        decrypted_data['birth_time'] = decrypt_data(decrypted_data['birth_time'])
    if 'birth_latitude' in decrypted_data and decrypted_data['birth_latitude'] is not None:
        decrypted_data['birth_latitude'] = float(decrypt_data(decrypted_data['birth_latitude']))
    if 'birth_longitude' in decrypted_data and decrypted_data['birth_longitude'] is not None:
        decrypted_data['birth_longitude'] = float(decrypt_data(decrypted_data['birth_longitude']))
    return decrypted_data

if __name__ == "__main__":
    # Example Usage
    test_chart = {
        "chart_name": "My First Chart",
        "birth_date": "1990-10-15T12:30:00",
        "birth_time": "12:30",
        "birth_latitude": 40.7181,
        "birth_longitude": -73.8448,
        "timezone_str": "America/New_York",
    }

    print("Original Chart:", test_chart)

    encrypted = encrypt_chart_data(test_chart)
    print("Encrypted Chart:", encrypted)

    decrypted = decrypt_chart_data(encrypted)
    print("Decrypted Chart:", decrypted)

    # Demonstrate encryption for a single field
    plain_text_time = "08:45 AM"
    encrypted_time = encrypt_data(plain_text_time)
    decrypted_time = decrypt_data(encrypted_time)
    print(f"
Single field encryption: '{plain_text_time}' -> '{encrypted_time}' -> '{decrypted_time}'")
