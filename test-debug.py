import requests
import json

# Test the backend with a simple request to see debug output
def test_backend():
    try:
        # Create a simple test image data
        test_data = {
            "test": "debug_logging_check"
        }
        
        # Test the stats endpoint first
        response = requests.get("http://localhost:5000/stats")
        print("Stats endpoint response:")
        print(json.dumps(response.json(), indent=2))
        
        # Test with a dummy image file (this will show debug logs)
        print("\n" + "="*50)
        print("Testing prediction endpoint to see debug logs...")
        print("="*50)
        
    except Exception as e:
        print(f"Error testing backend: {e}")

if __name__ == "__main__":
    test_backend()
