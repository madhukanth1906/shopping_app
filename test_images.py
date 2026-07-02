import urllib.request

urls = [
    'https://images.unsplash.com/photo-1610030469983-98e550d61dc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583391733958-d15f00e96ce0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617267156947-f316bf802118?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1621315271772-28b1e3eb8cd5?auto=format&fit=crop&w=800&q=80',
    # Some other known good unsplash images of people
    'https://images.unsplash.com/photo-1583391733958-d15f00e96ce0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        print(f"OK: {url}")
    except Exception as e:
        print(f"FAIL: {url} - {e}")
