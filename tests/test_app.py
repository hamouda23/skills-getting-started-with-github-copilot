from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_read_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    activities = response.json()
    assert isinstance(activities, dict)
    assert "Chess Club" in activities
    assert "Programming Class" in activities
    assert "Gym Class" in activities

def test_signup_for_activity():
    activity_name = "Chess Club"
    email = "test@mergington.edu"
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity_name}"

def test_unregister_from_activity():
    # First, sign up a test user
    activity_name = "Chess Club"
    email = "test@mergington.edu"
    client.post(f"/activities/{activity_name}/signup?email={email}")
    
    # Then try to unregister them
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 200
    assert response.json()["message"] == f"Unregistered {email} from {activity_name}"

def test_signup_duplicate():
    activity_name = "Chess Club"
    email = "test@mergington.edu"
    # First signup
    client.post(f"/activities/{activity_name}/signup?email={email}")
    # Try to signup again
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_unregister_not_registered():
    activity_name = "Chess Club"
    email = "notregistered@mergington.edu"
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 400
    assert "not registered" in response.json()["detail"]

def test_signup_nonexistent_activity():
    response = client.post("/activities/NonexistentClub/signup?email=test@mergington.edu")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]