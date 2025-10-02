#!/usr/bin/env python3
"""
Quick test for alchm.kitchen backend
"""

import asyncio
import httpx
import json

async def test_health():
    """Test backend health"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:8000/health")
            response.raise_for_status()
            result = response.json()
            print("✅ Backend health OK")
            return True
    except Exception as e:
        print(f"❌ Backend health failed: {e}")
        return False

async def test_alchemize():
    """Test alchemize endpoint"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post("http://localhost:8000/alchemize",
                                       json={},
                                       headers={"Content-Type": "application/json"})
            if response.status_code == 200:
                result = response.json()
                print("✅ Alchemize endpoint OK")
                return True
            else:
                print(f"❌ Alchemize failed with status {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Alchemize request failed: {e}")
        return False

async def main():
    print("🧪 Quick alchm.kitchen test")

    health_ok = await test_health()
    if health_ok:
        alchemize_ok = await test_alchemize()
        if alchemize_ok:
            print("🎉 Backend is working!")
        else:
            print("⚠️ Health OK but alchemize has issues")
    else:
        print("❌ Backend not responding - start with: cd alchm_kitchen && PYTHONPATH=.. python3 main.py")

if __name__ == "__main__":
    asyncio.run(main())
