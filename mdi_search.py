import json
import urllib.request
import os
from datetime import datetime, timedelta
import base64

def load_icon_data():
    cache_file = 'mdi_icons_cache.json'
    cache_age = timedelta(days=7)  # Update cache weekly

    if os.path.exists(cache_file) and datetime.now() - datetime.fromtimestamp(os.path.getmtime(cache_file)) < cache_age:
        with open(cache_file, 'r') as f:
            return json.load(f)
    else:
        url = "https://pictogrammers.com/data/mdi-7.4.47.json"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())
        
        with open(cache_file, 'w') as f:
            json.dump(data, f)
        
        return data

def create_svg(path):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="{path}" fill="black"/></svg>'
    return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"

def search_icons(query, icons):
    results = []
    for icon in icons['i']:
        if query.lower() in icon['n'].lower() or any(query.lower() in alias.lower() for alias in icon['al']):
            results.append({
                "title": icon['n'],
                "subtitle": f"Aliases: {', '.join(icon['al'])}",
                "arg": icon['p'],
                "icon": {
                    "path": create_svg(icon['p'])
                }
            })
    return results

def generate_alfred_output(results):
    return json.dumps({"items": results})

query = "{query}"
icon_data = load_icon_data()
search_results = search_icons(query, icon_data)
print(generate_alfred_output(search_results))
