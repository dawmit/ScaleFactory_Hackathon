import os
import requests
from urllib.parse import quote_plus

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "your_youtube_api_key_here")

def get_youtube_videos(skill_name, max_results=3):
    """
    Fetches top educational videos for a skill using YouTube API.
    Falls back to a search URL if no API key is provided.
    """
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "your_youtube_api_key_here":
        safe_query = quote_plus(f"{skill_name} course tutorial")
        return [{
            "provider": "YouTube",
            "type": "Video Tutorial",
            "title": f"Search YouTube for {skill_name} tutorials",
            "url": f"https://www.youtube.com/results?search_query={safe_query}",
            "is_free": True
        }]

    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": f"{skill_name} full course tutorial",
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY
    }

    try:
        response = requests.get(search_url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get("items", []):
            results.append({
                "provider": "YouTube",
                "type": "Video Tutorial",
                "title": item["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                "is_free": True
            })
        return results
    except Exception as e:
        print(f"YouTube API Error: {e}")
        return []


def get_stackoverflow_threads(skill_name, max_results=3):
    """
    Fetches top relevant questions/threads from Stack Overflow using the public API.
    Does not require an API key for basic usage.
    """
    api_url = "https://api.stackexchange.com/2.3/search/advanced"
    params = {
        "order": "desc",
        "sort": "relevance",
        "q": skill_name,
        "site": "stackoverflow",
        "pagesize": max_results,
        "accepted": "true" # Only return threads that have an accepted answer
    }

    try:
        response = requests.get(api_url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()

        results = []
        for item in data.get("items", []):
            results.append({
                "provider": "Stack Overflow",
                "type": "Q&A / Discussion",
                "title": item["title"],
                "url": item["link"],
                "is_free": True
            })
        
        # Fallback search URL if no relevant threads were found
        if not results:
            safe_query = quote_plus(skill_name)
            return [{
                "provider": "Stack Overflow",
                "type": "Q&A / Discussion",
                "title": f"Browse top Stack Overflow discussions on {skill_name}",
                "url": f"https://stackoverflow.com/questions/tagged/{safe_query}",
                "is_free": True
            }]
            
        return results
    except Exception as e:
        print(f"Stack Overflow API Error: {e}")
        safe_query = quote_plus(skill_name)
        return [{
            "provider": "Stack Overflow",
            "type": "Q&A / Discussion",
            "title": f"Browse top Stack Overflow discussions on {skill_name}",
            "url": f"https://stackoverflow.com/search?q={safe_query}",
            "is_free": True
        }]


def fetch_all_learning_resources(skill_name):
    """
    Combines YouTube videos and Stack Overflow threads for a given skill.
    """
    resources = []
    
    # 1. Fetch YouTube videos
    resources.extend(get_youtube_videos(skill_name))
    
    # 2. Fetch Stack Overflow discussions
    resources.extend(get_stackoverflow_threads(skill_name))
    
    return resources