import sys
from pathlib import Path

# Add Backend root directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

# Import your resource fetcher functions
# Line 8
from services.External_Learning import fetch_all_learning_resources, get_youtube_videos, get_stackoverflow_threads

# Line 10 (MUST be on a new line!)
def test_fetch_all_learning_resources_returns_list():
    """Verify that the main aggregator function returns a list of resource dicts."""
    skill = "Python"
    results = fetch_all_learning_resources(skill)
    
    assert isinstance(results, list)
    assert len(results) > 0

def test_resource_structure():
    """Ensure every returned resource object contains required UI fields."""
    skill = "AWS"
    results = fetch_all_learning_resources(skill)
    
    for resource in results:
        assert "provider" in resource
        assert "type" in resource
        assert "title" in resource
        assert "url" in resource
        assert "is_free" in resource
        assert resource["is_free"] is True

def test_fallback_urls_work_without_api_keys():
    """Ensure YouTube gracefully returns a fallback search link when no key is present."""
    results = get_youtube_videos("Docker")
    assert len(results) > 0
    assert "https://www.youtube.com/results?search_query=" in results[0]["url"]

