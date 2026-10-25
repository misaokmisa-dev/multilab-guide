# 300x250 advertising configuration

Current layout:
- Header: existing Adsterra 728x90 (mobile 320x50)
- Below hero: center approved Adsterra 300x250; optional left/right Ninja AdMax 300x250.
- Footer: one Adsterra 468x60.
- Right edge: existing Adsterra 160x600.

Add two new unique Ninja units:
1. Open https://admax.shinobi.jp/app/tags and select 広告枠の新規登録.
2. Register a PC 300x250 unit for MULTI LAB GUIDE. Suggest MULTILAB_SQUARE_LEFT and MULTILAB_SQUARE_RIGHT.
3. Copy each complete publisher script from its 広告タグ page.
4. In content page HTML, find data-ninja-square="left" and data-ninja-square="right". Remove the hidden attribute and as-square-pending class on those asides and insert the corresponding Ninja publisher script within as-ad-content. Keep left/right unit IDs distinct.
5. Verify delivery in browser and Ninja reporting. Unfilled slots should stay hidden. Do not claim an empty slot is a monetized ad.

Do not repeat an existing publisher tag three times on a page. Third-party iframes cannot reliably be inspected for ad fill by page scripts.
