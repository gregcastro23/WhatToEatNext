#!/usr/bin/env python3
"""
Test script for alchm.kitchen alchemize API integration
Tests the integration with Render alchemize API
"""

import asyncio
import httpx
import json
from datetime import datetime

ALCHEMIZE_API_URL = "https://alchmize.onrender.com/api/alchemize"

async def test_alchemize_api():
    """Test the alchemize API integration."""
    print("🧪 Testing alchm.kitchen alchemize API integration")
    print("=" * 50)

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Test 1: Current moment (empty request)
            print("📡 Test 1: Current moment alchemical calculation")
            response = await client.post(ALCHEMIZE_API_URL, json={})
            response.raise_for_status()
            result = response.json()

            print("✅ API call successful")
            print(f"   Kalchm: {result.get('kalchm', 'N/A')}")
            print(f"   Monica: {result.get('monica', 'N/A')}")
            print(f"   Score: {result.get('score', 'N/A')}")

            # Check for expected fields
            required_fields = ['elementalProperties', 'thermodynamicProperties', 'esms']
            for field in required_fields:
                if field in result:
                    print(f"✅ {field}: present")
                else:
                    print(f"❌ {field}: missing")

            # Test 2: Specific date/time
            print("\n📅 Test 2: Specific date/time calculation")
            test_request = {
                "year": 2024,
                "month": 9,
                "date": 29,
                "hour": 12,
                "latitude": 40.7498,
                "longitude": -73.7976
            }

            response2 = await client.post(ALCHEMIZE_API_URL, json=test_request)
            response2.raise_for_status()
            result2 = response2.json()

            print("✅ Date-specific API call successful"            print(f"   Kalchm: {result2.get('kalchm', 'N/A')}")
            print(f"   Monica: {result2.get('monica', 'N/A')}")

            # Test 3: Test our unified backend endpoint (if running)
            print("\n🏺 Test 3: Unified backend endpoint")
            try:
                response3 = await client.post("http://localhost:8000/alchemize", json={})
                response3.raise_for_status()
                result3 = response3.json()
                print("✅ Unified backend responding"                print(f"   Kalchm: {result3.get('kalchm', 'N/A')}")
            except Exception as e:
                print(f"⚠️  Unified backend not responding: {e}")
                print("   (This is expected if backend service isn't running)")

        except httpx.RequestError as e:
            print(f"❌ Network error: {e}")
            return False
        except httpx.HTTPStatusError as e:
            print(f"❌ HTTP error {e.response.status_code}: {e.response.text}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False

    print("\n" + "=" * 50)
    print("🎉 Alchemize API integration test completed!")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_alchemize_api())
    exit(0 if success else 1)
