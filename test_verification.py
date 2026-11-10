import os
import re
import json

print("=== NEFİS MANTI — WEB SİTESİ DOĞRULAMA TESTİ ===")

root_dir = r"C:\nefis_manti"
index_html_path = os.path.join(root_dir, "index.html")

with open(index_html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# 1. Check anchor link targets
anchor_links = set(re.findall(r'href="(#[a-zA-Z0-9\-_]+)"', html_content))
ids_in_doc = set(re.findall(r'id="([a-zA-Z0-9\-_]+)"', html_content))

missing_anchors = []
for a in anchor_links:
    target_id = a[1:]
    if target_id not in ids_in_doc:
        missing_anchors.append(a)

if missing_anchors:
    print(f"[FAIL] Missing anchor IDs: {missing_anchors}")
else:
    print(f"[PASS] All {len(anchor_links)} anchor links match existing section IDs: {sorted(list(anchor_links))}")

# 2. Check JSON-LD validity
json_ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html_content, re.DOTALL)
print(f"Found {len(json_ld_matches)} JSON-LD blocks")
for i, block in enumerate(json_ld_matches):
    try:
        data = json.loads(block.strip())
        print(f"[PASS] JSON-LD block {i+1} is valid JSON. Context: {data.get('@context')}")
    except Exception as e:
        print(f"[FAIL] JSON-LD block {i+1} parse error: {e}")

# 3. Check referenced files in index.html (src and href)
src_matches = re.findall(r'src="([^"]+)"', html_content)
css_matches = re.findall(r'<link rel="stylesheet" href="([^"]+)"', html_content)

all_assets = src_matches + css_matches
missing_assets = []
for asset in all_assets:
    if asset.startswith("http"):
        continue
    full_p = os.path.join(root_dir, asset.replace("/", "\\"))
    if not os.path.exists(full_p):
        missing_assets.append((asset, full_p))

if missing_assets:
    print(f"[FAIL] Missing local assets: {missing_assets}")
else:
    print(f"[PASS] All {len(all_assets)} referenced local CSS, JS and Image assets exist on disk!")

# 4. Check products.js images
products_js_path = os.path.join(root_dir, "js", "products.js")
with open(products_js_path, "r", encoding="utf-8") as f:
    products_js = f.read()

prod_images = re.findall(r'image:\s*"([^"]+)"', products_js)
missing_prod_img = []
for img in prod_images:
    p = os.path.join(root_dir, img.replace("/", "\\"))
    if not os.path.exists(p):
        missing_prod_img.append((img, p))

if missing_prod_img:
    print(f"[FAIL] Missing product images: {missing_prod_img}")
else:
    print(f"[PASS] All {len(prod_images)} product images exist on disk!")

# 5. Check alt tags on img elements in index.html
imgs = re.findall(r'<img\s+([^>]+)>', html_content)
missing_alts = 0
for tag in imgs:
    if 'alt="' not in tag:
        missing_alts += 1

if missing_alts == 0:
    print(f"[PASS] All {len(imgs)} <img> tags have descriptive alt attributes!")
else:
    print(f"[WARN] {missing_alts} images missing alt tags")

print("=== DOĞRULAMA TAMAMLANDI ===")

