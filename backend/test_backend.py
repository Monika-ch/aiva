import requests
import json

# Base URL
BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test health endpoint"""
    print("\n🧪 Testing Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Health check passed!")
    else:
        print("❌ Health check failed!")
    
    return response.status_code == 200

def test_root():
    """Test root endpoint"""
    print("\n🧪 Testing Root Endpoint...")
    response = requests.get(f"{BASE_URL}/")
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    # Verify response structure
    assert "message" in data
    assert "version" in data
    assert data["status"] == "healthy"
    
    print("✅ Root endpoint test passed!")
    return True

if __name__ == "__main__":
    print("🚀 Starting Backend Tests...\n")
    
    # Run tests
    test_root()
    test_health()
    
    print("\n✅ All tests completed!")
