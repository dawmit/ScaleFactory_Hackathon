import sys
from pathlib import Path

# Add Backend folder to path so Python can find your app modules
sys.path.append(str(Path(__file__).parent.parent))

# Import your Flask app instance (change 'main' to your server file if needed)
from main import app 

def test_homepage():
    # 1. Create temporary test client in memory
    client = app.test_client()
    
    # 2. Simulate GET request to an endpoint
    response = client.get('/api/users')
    
    # 3. Assert the response status code is 200 OK
    assert response.status_code == 200