import sys
from pathlib import Path

# Add Backend folder to path so Python can find your app modules
sys.path.append(str(Path(__file__).parent.parent))

from main import app

def test_get_all_users():
    """Tests fetching all users via the Admin route."""
    client = app.test_client()
    response = client.get('/api/admin/users')
    
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

def test_get_admin_stats():
    """Tests fetching administrative dashboard stats."""
    client = app.test_client()
    response = client.get('/api/admin/stats')
    
    assert response.status_code == 200
    data = response.get_json()
    assert "totalUsers" in data
    assert "totalSkills" in data

def test_login_user_not_found():
    """Tests authenticating an unseeded user."""
    client = app.test_client()
    response = client.post('/api/login', json={"name": "FakeUser123"})
    
    assert response.status_code == 404