import pytest

@pytest.fixture(autouse=True)
def reset_activities():
    """Reset the activities data before each test."""
    from src.app import activities
    
    # Save original activities
    original = activities.copy()
    
    # Let the test run
    yield
    
    # Restore original activities after test
    activities.clear()
    activities.update(original)