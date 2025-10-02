#!/usr/bin/env python3
"""
Simple test script for alchm.kitchen backend
Tests basic functionality without complex dependencies
"""

import asyncio
import httpx
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

ALCHEMIZE_API_URL = "https://alchmize.onrender.com/api/alchemize"
ALCHEMIZE_API_URL_FALLBACK = "https://alchmize.onrender.com"

async def test_render_api():
    """Test direct connection to Render alchemize API"""
    print("🔮 Testing Render Alchemize API...")

    urls_to_try = [ALCHEMIZE_API_URL, ALCHEMIZE_API_URL_FALLBACK]

    async with httpx.AsyncClient(timeout=10.0) as client:
        for url in urls_to_try:
            try:
                response = await client.post(url, json={})
                response.raise_for_status()
                result = response.json()

                print(f"✅ Render API responding at {url}")
                print(f"   Kalchm: {result.get('kalchm', 'N/A')}")
                print(f"   Has elementalProperties: {'elementalProperties' in result}")
                return True

            except Exception as e:
                print(f"❌ {url} error: {e}")
                continue

        print("❌ All Render API URLs failed")
        return False

async def test_backend_health():
    """Test local backend health"""
    print("\n🏺 Testing alchm.kitchen backend...")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:8000/health")
            response.raise_for_status()
            result = response.json()

            print("✅ Backend responding")
            print(f"   Status: {result.get('status', 'unknown')}")
            return True

    except Exception as e:
        print(f"❌ Backend not responding: {e}")
        print("   (Make sure backend is running: cd alchm_kitchen && python3 main.py)")
        return False

async def test_backend_alchemize():
    """Test backend alchemize endpoint"""
    print("\n📡 Testing backend alchemize endpoint...")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post("http://localhost:8000/alchemize",
                                       json={},
                                       headers={"Content-Type": "application/json"})
            response.raise_for_status()
            result = response.json()

            print("✅ Backend alchemize responding")
            print(f"   Kalchm: {result.get('kalchm', 'N/A')}")
            print(f"   Has elementalProperties: {'elementalProperties' in result}")
            return True

    except Exception as e:
        print(f"❌ Backend alchemize error: {e}")
        return False

async def main():
    """Run all tests"""
    print("🧪 alchm.kitchen Integration Tests")
    print("=" * 40)

    # Test Render API
    render_ok = await test_render_api()

    # Test backend
    backend_ok = await test_backend_health()

    if backend_ok:
        alchemize_ok = await test_backend_alchemize()
    else:
        alchemize_ok = False
        print("\n⚠️  Skipping backend alchemize test (backend not running)")

    print("\n" + "=" * 40)
    print("📊 Test Results:")
    print(f"   Render API: {'✅' if render_ok else '❌'}")
    print(f"   Backend Health: {'✅' if backend_ok else '❌'}")
    print(f"   Backend Alchemize: {'✅' if alchemize_ok else '❌'}")

    if render_ok:
        print("\n🎉 Core functionality working!")
        print("   Your alchmize API on Render is responding correctly.")
        if backend_ok and alchemize_ok:
            print("   Unified backend is working and forwarding requests properly.")
        elif backend_ok:
            print("   Backend is running but alchemize endpoint needs work.")
        else:
            print("   Start backend: cd alchm_kitchen && PYTHONPATH=.. python3 main.py")
    else:
        print("\n❌ Render API is not responding. Check your deployment.")

    return render_ok

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
