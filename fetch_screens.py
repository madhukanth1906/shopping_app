import urllib.request
import os

screens = {
    'index.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk0OTVmZjlhNTBmODQ2MjQ4Y2QzY2RkOWVhYjgwMThlEgsSBxDOna-s_BIYAZIBIwoKcHJvamVjdF9pZBIVQhM1MjQzMTEzMjUzNjU2Nzg4NjQ1&filename=&opi=89354086',
    'shop.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E1MDMwZTcwY2VhNTQ2MGI5OGQwMDJhNjYwMjVkYWNmEgsSBxDOna-s_BIYAZIBIwoKcHJvamVjdF9pZBIVQhM1MjQzMTEzMjUzNjU2Nzg4NjQ1&filename=&opi=89354086',
    'product.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc0Mzg4NTk4YWMwMTQwZDJiMDFkZDJhMDA1ZGNkMjBhEgsSBxDOna-s_BIYAZIBIwoKcHJvamVjdF9pZBIVQhM1MjQzMTEzMjUzNjU2Nzg4NjQ1&filename=&opi=89354086',
    'cart.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzJkOWNhYmU4OWMzYTQyY2NiMDUxOTNmNTEyZTE3YTdmEgsSBxDOna-s_BIYAZIBIwoKcHJvamVjdF9pZBIVQhM1MjQzMTEzMjUzNjU2Nzg4NjQ1&filename=&opi=89354086',
    'account.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZjYzFjNjFiN2M1MTRmMGZhOGJiN2ZkMzczZGFmODhlEgsSBxDOna-s_BIYAZIBIwoKcHJvamVjdF9pZBIVQhM1MjQzMTEzMjUzNjU2Nzg4NjQ1&filename=&opi=89354086',
    'admin.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2IzMWQxNmE2NmY4MTQ1ZjliNjRmNzZjZTk3ZGY0ZTUyEgsSBxDOna-s_BIYAZIBIwoKcHJvamVjdF9pZBIVQhM1MjQzMTEzMjUzNjU2Nzg4NjQ1&filename=&opi=89354086'
}

for filename, url in screens.items():
    print(f"Downloading {filename}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        content = response.read()
        with open(filename, 'wb') as f:
            f.write(content)
    print(f"Saved {filename}")
