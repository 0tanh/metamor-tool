import requests
import json
from .prefs import Option

def get_profile(url: str):
    resp = requests.get(url, timeout=5)
    jsoned = resp.json()
    return jsoned

def main():
    return 0

if __name__ == "__main__":
    main()
