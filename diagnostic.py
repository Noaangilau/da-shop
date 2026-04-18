"""
diagnostic.py — Full site diagnostic for DA SHOP Marketplace.

Opens a real browser and tests every page, link, filter, form, and
interactive feature end-to-end. Prints PASS/FAIL for each check with
a final summary.

Usage:
    python3 diagnostic.py

Requirements:
    - Playwright installed: pip install playwright && playwright install chromium
"""

import time
import requests
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

FRONTEND = "https://dashopf-production.up.railway.app"
BACKEND  = "https://dashopb-production.up.railway.app"
PASS     = "✅ PASS"
FAIL     = "❌ FAIL"

results = []


def check(label, passed, detail=""):
    status = PASS if passed else FAIL
    msg = f"{status}  {label}"
    if detail:
        msg += f"  —  {detail}"
    print(msg)
    results.append(passed)


# ─── BACKEND API CHECKS ───────────────────────────────────────────────────────

def run_backend_checks():
    print("\n[ BACKEND — API ]")

    try:
        r = requests.get(f"{BACKEND}/health", timeout=5)
        check("GET /health — backend is responding", r.status_code == 200, f"status {r.status_code}")
    except Exception as e:
        check("GET /health — backend is responding", False, str(e))
        print("  ⚠️  Backend is offline. Skipping remaining backend checks.")
        return

    # Brands endpoint
    try:
        r = requests.get(f"{BACKEND}/brands", timeout=8)
        check("GET /brands — returns list", r.status_code == 200 and isinstance(r.json(), list),
              f"count: {len(r.json()) if r.status_code == 200 else 'error'}")
    except Exception as e:
        check("GET /brands — returns list", False, str(e))

    # Products endpoint
    try:
        r = requests.get(f"{BACKEND}/products", timeout=8)
        check("GET /products — returns list", r.status_code == 200 and isinstance(r.json(), list),
              f"count: {len(r.json()) if r.status_code == 200 else 'error'}")
    except Exception as e:
        check("GET /products — returns list", False, str(e))

    # Brand 1 products
    try:
        r = requests.get(f"{BACKEND}/brands/1/products", timeout=8)
        check("GET /brands/1/products — brand 1 has products", r.status_code == 200 and len(r.json()) > 0,
              f"count: {len(r.json()) if r.status_code == 200 else 'error'}")
    except Exception as e:
        check("GET /brands/1/products — brand 1 has products", False, str(e))

    # Vendor inquiry endpoint — valid payload
    try:
        payload = {
            "business_name":    "Diagnostic Test Co",
            "contact_name":     "Test Runner",
            "email":            "test@diagnostic.com",
            "instagram_handle": "@diag",
            "product_category": "Clothing",
        }
        r = requests.post(f"{BACKEND}/vendor-inquiry", json=payload, timeout=8)
        check("POST /vendor-inquiry — valid payload accepted", r.status_code in (200, 201),
              f"status {r.status_code}")
    except Exception as e:
        check("POST /vendor-inquiry — valid payload accepted", False, str(e))

    # CORS headers
    try:
        r = requests.options(
            f"{BACKEND}/brands",
            headers={"Origin": FRONTEND, "Access-Control-Request-Method": "GET"},
            timeout=5,
        )
        allowed = r.headers.get("access-control-allow-origin", "")
        check("OPTIONS /brands — CORS headers present",
              allowed in ("*", FRONTEND), f"Access-Control-Allow-Origin: {allowed!r}")
    except Exception as e:
        check("OPTIONS /brands — CORS headers present", False, str(e))

    # AI chat endpoint (no key = fallback reply)
    try:
        r = requests.post(f"{BACKEND}/ai/chat", json={"message": "hi"}, timeout=10)
        check("POST /ai/chat — returns reply", r.status_code == 200 and "reply" in r.json(),
              r.json().get("reply", "")[:60] if r.status_code == 200 else f"status {r.status_code}")
    except Exception as e:
        check("POST /ai/chat — returns reply", False, str(e))


# ─── FRONTEND BROWSER CHECKS ──────────────────────────────────────────────────

def run_frontend_checks(page):

    # ── HOMEPAGE ──────────────────────────────────────────────────────────────
    print("\n[ HOMEPAGE ]")
    try:
        page.goto(FRONTEND)
        page.wait_for_selector("h1", timeout=8000)
        title = page.locator("h1").first.inner_text()
        check("/ — homepage loads", True, f"title: {title!r}")
    except PlaywrightTimeout as e:
        check("/ — homepage loads", False, str(e))
        return

    try:
        page.wait_for_selector("text=Shop Now", timeout=5000)
        check("/ — hero CTA 'Shop Now' visible", True)
    except PlaywrightTimeout:
        check("/ — hero CTA 'Shop Now' visible", False)

    try:
        page.wait_for_selector("text=Meet the Brands", timeout=5000)
        check("/ — hero CTA 'Meet the Brands' visible", True)
    except PlaywrightTimeout:
        check("/ — hero CTA 'Meet the Brands' visible", False)

    try:
        page.wait_for_selector("text=Shop by Category", timeout=5000)
        check("/ — category grid section visible", True)
    except PlaywrightTimeout:
        check("/ — category grid section visible", False)

    try:
        page.wait_for_selector("text=The Brands", timeout=5000)
        check("/ — brands section visible", True)
    except PlaywrightTimeout:
        check("/ — brands section visible", False)

    try:
        page.wait_for_selector("text=Featured Brand", timeout=8000)
        check("/ — featured brand spotlight section visible", True)
    except PlaywrightTimeout:
        check("/ — featured brand spotlight section visible", False)

    try:
        page.wait_for_selector("text=All Products", timeout=5000)
        check("/ — all products section visible", True)
    except PlaywrightTimeout:
        check("/ — all products section visible", False)

    try:
        page.wait_for_selector("text=Sell on DA SHOP", timeout=5000)
        check("/ — vendor CTA banner visible", True)
    except PlaywrightTimeout:
        check("/ — vendor CTA banner visible", False)

    # ── BRAND PAGES ───────────────────────────────────────────────────────────
    print("\n[ BRAND PAGES ]")

    for bid in [1, 2]:
        try:
            page.goto(f"{FRONTEND}/brand/{bid}")
            page.wait_for_selector("h1", timeout=8000)
            check(f"/brand/{bid} — brand page loads", True)
        except PlaywrightTimeout:
            check(f"/brand/{bid} — brand page loads", False, "h1 not found")
        except Exception as e:
            check(f"/brand/{bid} — brand page loads", False, str(e))

    # Collection tabs visible on brand 1 (if multiple collections)
    try:
        page.goto(f"{FRONTEND}/brand/1")
        page.wait_for_selector("text=Shop ", timeout=8000)
        tabs = page.locator("button").all()
        tab_texts = [t.inner_text() for t in tabs if t.inner_text().strip()]
        check("/brand/1 — page has interactive buttons (tabs or actions)",
              len(tab_texts) > 0, f"buttons: {tab_texts[:5]}")
    except Exception as e:
        check("/brand/1 — page has interactive buttons", False, str(e))

    # 404 for unknown brand
    try:
        page.goto(f"{FRONTEND}/brand/999")
        page.wait_for_selector("text=Brand Not Found", timeout=6000)
        check("/brand/999 — 404 state shows for unknown brand", True)
    except PlaywrightTimeout:
        check("/brand/999 — 404 state shows for unknown brand", False)

    # Legacy /vendor/:id redirect
    try:
        page.goto(f"{FRONTEND}/vendor/1")
        page.wait_for_url(f"{FRONTEND}/brand/1", timeout=5000)
        check("/vendor/1 — redirects to /brand/1", True)
    except Exception as e:
        check("/vendor/1 — redirects to /brand/1", False, str(e))

    # ── PRODUCT DETAIL PAGES ──────────────────────────────────────────────────
    print("\n[ PRODUCT DETAIL PAGES ]")

    for pid in [1, 2, 3]:
        try:
            page.goto(f"{FRONTEND}/product/{pid}")
            page.wait_for_selector("text=Add to Cart", timeout=8000)
            check(f"/product/{pid} — product page loads", True)
        except PlaywrightTimeout:
            check(f"/product/{pid} — product page loads", False, "Add to Cart button not found")
        except Exception as e:
            check(f"/product/{pid} — product page loads", False, str(e))

    # 404 for unknown product
    try:
        page.goto(f"{FRONTEND}/product/999")
        page.wait_for_selector("text=Product Not Found", timeout=6000)
        check("/product/999 — 404 state shows for unknown product", True)
    except PlaywrightTimeout:
        check("/product/999 — 404 state shows for unknown product", False)

    # ── SIZE VALIDATION ───────────────────────────────────────────────────────
    print("\n[ SIZE VALIDATION ]")
    try:
        page.goto(f"{FRONTEND}/product/1")
        page.wait_for_selector("text=Add to Cart", timeout=8000)
        page.click("text=Add to Cart")
        page.wait_for_selector("text=Please select a size", timeout=3000)
        check("/product/1 — size validation triggers without selection", True)
    except PlaywrightTimeout:
        check("/product/1 — size validation triggers without selection", False,
              "message not shown (product may have no sizes)")
    except Exception as e:
        check("/product/1 — size validation triggers without selection", False, str(e))

    # ── CATEGORY PAGES ────────────────────────────────────────────────────────
    print("\n[ CATEGORY PAGES ]")

    for slug in ["clothing", "jewelry"]:
        try:
            page.goto(f"{FRONTEND}/category/{slug}")
            page.wait_for_selector("h1", timeout=8000)
            check(f"/category/{slug} — page loads", True)
        except PlaywrightTimeout:
            check(f"/category/{slug} — page loads", False, "h1 not found")
        except Exception as e:
            check(f"/category/{slug} — page loads", False, str(e))

    # ── LEGAL PAGES ───────────────────────────────────────────────────────────
    print("\n[ LEGAL PAGES ]")

    for path, heading in [
        ("/terms",    "Terms of Service"),
        ("/privacy",  "Privacy Policy"),
        ("/returns",  "Returns"),
        ("/shipping", "Shipping"),
    ]:
        try:
            page.goto(f"{FRONTEND}{path}")
            page.wait_for_selector(f"text={heading}", timeout=6000)
            check(f"{path} — {heading} page loads", True)
        except PlaywrightTimeout:
            check(f"{path} — {heading} page loads", False, "heading not found")
        except Exception as e:
            check(f"{path} — {heading} page loads", False, str(e))

    # ── FOOTER SUPPORT LINKS ──────────────────────────────────────────────────
    print("\n[ FOOTER SUPPORT LINKS ]")

    footer_links = [
        ("Shipping Info",    f"{FRONTEND}/shipping"),
        ("Returns Policy",   f"{FRONTEND}/returns"),
        ("Terms of Service", f"{FRONTEND}/terms"),
        ("Privacy Policy",   f"{FRONTEND}/privacy"),
    ]
    for label, expected_url in footer_links:
        try:
            page.goto(FRONTEND)
            page.wait_for_selector("footer", timeout=5000)
            page.locator(f"footer >> text={label}").click()
            page.wait_for_url(expected_url, timeout=5000)
            check(f"Footer → '{label}' navigates to {expected_url}", True)
        except Exception as e:
            check(f"Footer → '{label}' navigates to {expected_url}", False, str(e))

    # ── AUTH PAGES ────────────────────────────────────────────────────────────
    print("\n[ AUTH PAGES ]")

    try:
        page.goto(f"{FRONTEND}/login")
        page.wait_for_selector("input[type='email']", timeout=6000)
        check("/login — login form loads", True)
    except PlaywrightTimeout:
        check("/login — login form loads", False)
    except Exception as e:
        check("/login — login form loads", False, str(e))

    try:
        page.goto(f"{FRONTEND}/signup")
        page.wait_for_selector("input[type='email']", timeout=6000)
        check("/signup — signup form loads", True)
    except PlaywrightTimeout:
        check("/signup — signup form loads", False)
    except Exception as e:
        check("/signup — signup form loads", False, str(e))

    # ── BECOME A VENDOR ───────────────────────────────────────────────────────
    print("\n[ BECOME A VENDOR ]")

    try:
        page.goto(f"{FRONTEND}/become-a-vendor")
        page.wait_for_selector("text=Apply", timeout=8000)
        check("/become-a-vendor — page loads", True)
    except PlaywrightTimeout:
        check("/become-a-vendor — page loads", False)
    except Exception as e:
        check("/become-a-vendor — page loads", False, str(e))

    try:
        page.goto(f"{FRONTEND}/become-a-vendor")
        page.wait_for_selector("input[name='business_name']", timeout=8000)
        page.fill("input[name='business_name']", "Diagnostic Vendor Co")
        page.fill("input[name='contact_name']",  "Test Runner")
        page.fill("input[name='email']",          f"diag+{int(time.time())}@test.com")
        page.fill("input[name='instagram_handle']", "@diagnostic")
        page.select_option("select[name='product_category']", index=1)
        page.click("button[type='submit']")
        page.wait_for_selector("text=Application Received", timeout=10000)
        check("/become-a-vendor — form submits and shows success screen", True)
    except PlaywrightTimeout:
        check("/become-a-vendor — form submits and shows success screen", False,
              "success screen not shown — check backend connection")
    except Exception as e:
        check("/become-a-vendor — form submits and shows success screen", False, str(e))

    # ── AI CHAT WIDGET ────────────────────────────────────────────────────────
    print("\n[ AI CHAT WIDGET ]")

    try:
        page.goto(FRONTEND)
        page.wait_for_selector("button[aria-label='Open chat']", timeout=8000)
        page.click("button[aria-label='Open chat']")
        page.wait_for_selector("text=DA SHOP Assistant", timeout=4000)
        check("/ — AI chat widget opens", True)
    except PlaywrightTimeout:
        check("/ — AI chat widget opens", False, "widget or header not found")
    except Exception as e:
        check("/ — AI chat widget opens", False, str(e))

    # ── 404 PAGE ──────────────────────────────────────────────────────────────
    print("\n[ 404 PAGE ]")

    try:
        page.goto(f"{FRONTEND}/this-page-does-not-exist")
        page.wait_for_selector("text=Page Not Found", timeout=8000)
        check("/nonexistent — React 404 page renders", True)
    except PlaywrightTimeout:
        check("/nonexistent — React 404 page renders", False,
              "check that server serves index.html for all routes (SPA config)")
    except Exception as e:
        check("/nonexistent — React 404 page renders", False, str(e))

    # ── SCROLL TO TOP ─────────────────────────────────────────────────────────
    print("\n[ SCROLL BEHAVIOUR ]")

    try:
        page.goto(FRONTEND)
        page.evaluate("window.scrollTo(0, 9999)")
        time.sleep(0.3)
        page.goto(f"{FRONTEND}/brands")
        page.wait_for_selector("h1", timeout=6000)
        scroll_after = page.evaluate("window.scrollY")
        check("Route change — page scrolls to top", scroll_after < 50,
              f"scrollY after navigation: {scroll_after}px")
    except Exception as e:
        check("Route change — page scrolls to top", False, str(e))


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def run_diagnostic():
    print("\n" + "=" * 60)
    print("  DA SHOP — Full Site Diagnostic")
    print("=" * 60)

    run_backend_checks()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        try:
            run_frontend_checks(page)
        finally:
            browser.close()

    print("\n" + "=" * 60)
    passed = sum(results)
    total  = len(results)
    failed = total - passed
    print(f"  TOTAL: {passed}/{total} passed", end="")
    if failed:
        print(f"  |  {failed} FAILED  ← investigate above")
    else:
        print("  — all clear!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run_diagnostic()
