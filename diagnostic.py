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
BACKEND  = "https://DASHOP.up.railway.app"
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

    # Health check
    try:
        r = requests.get(f"{BACKEND}/health", timeout=5)
        check("GET /health — backend is responding", r.status_code == 200, f"status {r.status_code}")
    except Exception as e:
        check("GET /health — backend is responding", False, str(e))
        print("  ⚠️  Backend is offline. Skipping remaining backend checks.")
        return

    # Vendor inquiry endpoint — valid payload
    try:
        payload = {
            "business_name":   "Diagnostic Test Co",
            "contact_name":    "Test Runner",
            "email":           "test@diagnostic.com",
            "instagram_handle": "@diag",
            "product_category": "Art + Ink",
        }
        r = requests.post(f"{BACKEND}/vendor-inquiry", json=payload, timeout=8)
        check("POST /vendor-inquiry — valid payload accepted", r.status_code in (200, 201),
              f"status {r.status_code}")
    except Exception as e:
        check("POST /vendor-inquiry — valid payload accepted", False, str(e))

    # Vendor inquiry endpoint — CORS headers present
    try:
        r = requests.options(
            f"{BACKEND}/vendor-inquiry",
            headers={"Origin": FRONTEND, "Access-Control-Request-Method": "POST"},
            timeout=5,
        )
        allowed = r.headers.get("access-control-allow-origin", "")
        check("OPTIONS /vendor-inquiry — CORS headers present",
              allowed in ("*", FRONTEND), f"Access-Control-Allow-Origin: {allowed!r}")
    except Exception as e:
        check("OPTIONS /vendor-inquiry — CORS headers present", False, str(e))


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
        return  # can't continue if home is broken

    try:
        page.wait_for_selector("text=Explore Da Shop", timeout=5000)
        check("/ — hero CTA 'Explore Da Shop' visible", True)
    except PlaywrightTimeout:
        check("/ — hero CTA 'Explore Da Shop' visible", False)

    try:
        page.wait_for_selector("text=Become a Vendor", timeout=5000)
        check("/ — hero CTA 'Become a Vendor' visible", True)
    except PlaywrightTimeout:
        check("/ — hero CTA 'Become a Vendor' visible", False)

    try:
        page.wait_for_selector("text=Featured Stores", timeout=5000)
        check("/ — vendor strip section visible", True)
    except PlaywrightTimeout:
        check("/ — vendor strip section visible", False)

    try:
        page.wait_for_selector("text=Shop by Category", timeout=5000)
        check("/ — category grid section visible", True)
    except PlaywrightTimeout:
        check("/ — category grid section visible", False)

    try:
        page.wait_for_selector("text=Featured Products", timeout=5000)
        check("/ — products grid section visible", True)
    except PlaywrightTimeout:
        check("/ — products grid section visible", False)

    try:
        page.wait_for_selector("text=Sell on Da Shop", timeout=5000)
        check("/ — vendor CTA banner visible", True)
    except PlaywrightTimeout:
        check("/ — vendor CTA banner visible", False)

    # ── CATEGORY FILTERING ────────────────────────────────────────────────────
    print("\n[ CATEGORY FILTERING ]")

    for cat in ["Art", "Food", "Clothing", "Accessories"]:
        try:
            page.goto(f"{FRONTEND}/?category={cat}")
            page.wait_for_selector(f"text={cat} Products", timeout=6000)
            cards = page.locator(".grid a").count()
            check(f"/?category={cat} — filters to {cat} products", True,
                  f"{cards} product card(s) visible")
        except PlaywrightTimeout:
            check(f"/?category={cat} — filters to {cat} products", False, "heading not found")
        except Exception as e:
            check(f"/?category={cat} — filters to {cat} products", False, str(e))

    # Empty category (no products should show empty state)
    try:
        page.goto(f"{FRONTEND}/?category=Jewelry")
        page.wait_for_selector("text=No products found", timeout=6000)
        check("/?category=Jewelry — empty state shown for no matches", True)
    except PlaywrightTimeout:
        check("/?category=Jewelry — empty state shown for no matches", False)

    # "All Products" clear filter link
    try:
        page.goto(f"{FRONTEND}/?category=Art")
        page.wait_for_selector("text=All Products", timeout=6000)
        page.click("text=← All Products")
        page.wait_for_selector("text=Featured Products", timeout=6000)
        check("/?category=Art — '← All Products' clears filter", True)
    except PlaywrightTimeout:
        check("/?category=Art — '← All Products' clears filter", False)
    except Exception as e:
        check("/?category=Art — '← All Products' clears filter", False, str(e))

    # ── VENDOR STOREFRONTS ────────────────────────────────────────────────────
    print("\n[ VENDOR STOREFRONTS ]")

    vendors = [
        (1, "Frost City Tatau"),
        (2, "D's Fale"),
        (3, "ffiliku"),
    ]
    for vid, vname in vendors:
        try:
            page.goto(f"{FRONTEND}/vendor/{vid}")
            page.wait_for_selector("h1", timeout=8000)
            check(f"/vendor/{vid} — {vname} storefront loads", True)
        except PlaywrightTimeout:
            check(f"/vendor/{vid} — {vname} storefront loads", False, "h1 not found")
        except Exception as e:
            check(f"/vendor/{vid} — {vname} storefront loads", False, str(e))

        # Products grid on storefront
        try:
            page.goto(f"{FRONTEND}/vendor/{vid}")
            page.wait_for_selector("text=Products", timeout=8000)
            check(f"/vendor/{vid} — products section visible", True)
        except PlaywrightTimeout:
            check(f"/vendor/{vid} — products section visible", False)
        except Exception as e:
            check(f"/vendor/{vid} — products section visible", False, str(e))

    # 404 for unknown vendor
    try:
        page.goto(f"{FRONTEND}/vendor/999")
        page.wait_for_selector("text=Vendor Not Found", timeout=6000)
        check("/vendor/999 — 404 state shows for unknown vendor", True)
    except PlaywrightTimeout:
        check("/vendor/999 — 404 state shows for unknown vendor", False)

    # ── PRODUCT DETAIL PAGES ──────────────────────────────────────────────────
    print("\n[ PRODUCT DETAIL PAGES ]")

    products = [
        (1, "Custom Tatau Flash Sheet"),
        (2, "Sāmoan Pe'a Art Print"),
        (3, "Taro & Coconut Cream Bread"),
        (4, "Oka Ika Seasoning Pack"),
        (5, "Island Linen Tapa Shirt"),
        (6, "Vā Collection Tote"),
    ]
    for pid, pname in products:
        try:
            page.goto(f"{FRONTEND}/product/{pid}")
            page.wait_for_selector("text=Add to Cart", timeout=8000)
            check(f"/product/{pid} — {pname} loads", True)
        except PlaywrightTimeout:
            check(f"/product/{pid} — {pname} loads", False, "Add to Cart button not found")
        except Exception as e:
            check(f"/product/{pid} — {pname} loads", False, str(e))

    # 404 for unknown product
    try:
        page.goto(f"{FRONTEND}/product/999")
        page.wait_for_selector("text=Product Not Found", timeout=6000)
        check("/product/999 — 404 state shows for unknown product", True)
    except PlaywrightTimeout:
        check("/product/999 — 404 state shows for unknown product", False)

    # ── ADD TO CART INTERACTION ───────────────────────────────────────────────
    print("\n[ ADD TO CART ]")
    try:
        page.goto(f"{FRONTEND}/product/1")
        page.wait_for_selector("text=Add to Cart", timeout=8000)
        page.click("text=Add to Cart")
        page.wait_for_selector("text=Added to Cart", timeout=5000)
        check("/product/1 — Add to Cart shows confirmation", True)
    except PlaywrightTimeout:
        check("/product/1 — Add to Cart shows confirmation", False, "confirmation text not shown")
    except Exception as e:
        check("/product/1 — Add to Cart shows confirmation", False, str(e))

    try:
        # Button should reset back after ~2 seconds
        page.wait_for_selector("text=Add to Cart", timeout=5000)
        check("/product/1 — Add to Cart resets after 2s", True)
    except PlaywrightTimeout:
        check("/product/1 — Add to Cart resets after 2s", False, "button did not reset")

    # ── BREADCRUMB NAVIGATION ─────────────────────────────────────────────────
    print("\n[ BREADCRUMB NAVIGATION ]")
    try:
        page.goto(f"{FRONTEND}/product/1")
        page.wait_for_selector("text=Home", timeout=5000)
        page.click("text=Home")
        page.wait_for_url(lambda url: url.rstrip("/") == FRONTEND or url == f"{FRONTEND}/", timeout=5000)
        check("/product/1 breadcrumb → Home navigates correctly", True)
    except Exception as e:
        check("/product/1 breadcrumb → Home navigates correctly", False, str(e))

    try:
        page.goto(f"{FRONTEND}/product/1")
        page.wait_for_selector("text=Frost City Tatau", timeout=5000)
        page.locator("text=Frost City Tatau").first.click()
        page.wait_for_url(f"{FRONTEND}/vendor/1", timeout=5000)
        check("/product/1 breadcrumb → Vendor navigates correctly", True)
    except Exception as e:
        check("/product/1 breadcrumb → Vendor navigates correctly", False, str(e))

    # ── VENDORS LISTING PAGE ──────────────────────────────────────────────────
    print("\n[ VENDORS LISTING PAGE ]")
    try:
        page.goto(f"{FRONTEND}/vendors")
        page.wait_for_selector("h1", timeout=8000)
        check("/vendors — page loads", True)
    except PlaywrightTimeout:
        check("/vendors — page loads", False)
    except Exception as e:
        check("/vendors — page loads", False, str(e))

    try:
        page.goto(f"{FRONTEND}/vendors")
        page.wait_for_selector("text=Frost City Tatau", timeout=8000)
        page.locator("text=Frost City Tatau").first.click()
        page.wait_for_url(f"{FRONTEND}/vendor/1", timeout=5000)
        check("/vendors — clicking vendor navigates to storefront", True)
    except Exception as e:
        check("/vendors — clicking vendor navigates to storefront", False, str(e))

    # ── BECOME A VENDOR PAGE ──────────────────────────────────────────────────
    print("\n[ BECOME A VENDOR — PAGE ]")
    try:
        page.goto(f"{FRONTEND}/become-a-vendor")
        page.wait_for_selector("text=Apply Now", timeout=8000)
        check("/become-a-vendor — page loads", True)
    except PlaywrightTimeout:
        check("/become-a-vendor — page loads", False)
    except Exception as e:
        check("/become-a-vendor — page loads", False, str(e))

    # ── BECOME A VENDOR — FORM VALIDATION ────────────────────────────────────
    print("\n[ BECOME A VENDOR — FORM VALIDATION ]")

    # Submit empty form
    try:
        page.goto(f"{FRONTEND}/become-a-vendor")
        page.wait_for_selector("text=Submit Application", timeout=8000)
        page.click("text=Submit Application")
        page.wait_for_selector("text=Please fill in all required fields", timeout=4000)
        check("/become-a-vendor — empty submit shows required fields error", True)
    except PlaywrightTimeout:
        check("/become-a-vendor — empty submit shows required fields error", False)
    except Exception as e:
        check("/become-a-vendor — empty submit shows required fields error", False, str(e))

    # Invalid email
    try:
        page.goto(f"{FRONTEND}/become-a-vendor")
        page.wait_for_selector("input[name='business_name']", timeout=8000)
        page.fill("input[name='business_name']", "Test Biz")
        page.fill("input[name='contact_name']", "Test Name")
        page.fill("input[name='email']", "notanemail")
        page.select_option("select[name='product_category']", "Art + Ink")
        page.click("text=Submit Application")
        page.wait_for_selector("text=valid email", timeout=4000)
        check("/become-a-vendor — invalid email shows format error", True)
    except PlaywrightTimeout:
        check("/become-a-vendor — invalid email shows format error", False)
    except Exception as e:
        check("/become-a-vendor — invalid email shows format error", False, str(e))

    # ── BECOME A VENDOR — FULL FORM SUBMISSION ────────────────────────────────
    print("\n[ BECOME A VENDOR — FORM SUBMISSION ]")
    try:
        page.goto(f"{FRONTEND}/become-a-vendor")
        page.wait_for_selector("input[name='business_name']", timeout=8000)
        page.fill("input[name='business_name']", "Diagnostic Vendor Co")
        page.fill("input[name='contact_name']", "Test Runner")
        page.fill("input[name='email']", f"diag+{int(time.time())}@test.com")
        page.fill("input[name='instagram_handle']", "@diagnostic")
        page.select_option("select[name='product_category']", "Art + Ink")
        page.click("text=Submit Application")
        page.wait_for_selector("text=Application Received", timeout=10000)
        check("/become-a-vendor — form submits and shows success screen", True)
    except PlaywrightTimeout:
        check("/become-a-vendor — form submits and shows success screen", False,
              "success screen not shown — check backend connection")
    except Exception as e:
        check("/become-a-vendor — form submits and shows success screen", False, str(e))

    # Back to Home from success screen
    try:
        page.wait_for_selector("text=Back to Home", timeout=5000)
        page.click("text=Back to Home")
        page.wait_for_url(lambda url: url.rstrip("/") == FRONTEND or url == f"{FRONTEND}/", timeout=5000)
        check("/become-a-vendor — success screen 'Back to Home' works", True)
    except Exception as e:
        check("/become-a-vendor — success screen 'Back to Home' works", False, str(e))

    # ── NAVBAR NAVIGATION ─────────────────────────────────────────────────────
    print("\n[ NAVBAR NAVIGATION ]")

    nav_checks = [
        ("Vendors", f"{FRONTEND}/vendors"),
    ]
    for label, expected_url in nav_checks:
        try:
            page.goto(FRONTEND)
            page.wait_for_selector(f"text={label}", timeout=8000)
            page.locator(f"nav >> text={label}").first.click()
            page.wait_for_url(expected_url, timeout=5000)
            check(f"Navbar → {label} navigates to {expected_url}", True)
        except Exception as e:
            check(f"Navbar → {label} navigates to {expected_url}", False, str(e))

    # ── FOOTER NAVIGATION ─────────────────────────────────────────────────────
    print("\n[ FOOTER NAVIGATION ]")

    # Footer category links
    for cat in ["Clothing", "Food", "Art"]:
        try:
            page.goto(FRONTEND)
            page.wait_for_selector("footer", timeout=5000)
            page.locator(f"footer >> text={cat}").click()
            page.wait_for_selector(f"text={cat} Products", timeout=6000)
            check(f"Footer → {cat} category link works", True)
        except Exception as e:
            check(f"Footer → {cat} category link works", False, str(e))

    # Footer vendor links
    for vid, vname in [(1, "Frost City Tatau"), (2, "D's Fale"), (3, "ffiliku")]:
        try:
            page.goto(FRONTEND)
            page.wait_for_selector("footer", timeout=5000)
            page.locator(f"footer >> text={vname}").first.click()
            page.wait_for_url(f"{FRONTEND}/vendor/{vid}", timeout=5000)
            check(f"Footer → {vname} link navigates to /vendor/{vid}", True)
        except Exception as e:
            check(f"Footer → {vname} link navigates to /vendor/{vid}", False, str(e))

    # Footer Become a Vendor button
    try:
        page.goto(FRONTEND)
        page.wait_for_selector("footer", timeout=5000)
        page.locator("footer >> text=Become a Vendor").click()
        page.wait_for_url(f"{FRONTEND}/become-a-vendor", timeout=5000)
        check("Footer → 'Become a Vendor' button navigates correctly", True)
    except Exception as e:
        check("Footer → 'Become a Vendor' button navigates correctly", False, str(e))

    # ── 404 PAGE ──────────────────────────────────────────────────────────────
    print("\n[ 404 PAGE ]")
    try:
        page.goto(f"{FRONTEND}/this-page-does-not-exist")
        # Wait for our React NotFound component specifically — not a server 404 page
        page.wait_for_selector("text=Page Not Found", timeout=8000)
        check("/nonexistent — 404 page renders (React NotFound component)", True)
    except PlaywrightTimeout:
        check("/nonexistent — 404 page renders (React NotFound component)", False,
              "React app may not be loading on unknown routes — check serve.json SPA config")
    except Exception as e:
        check("/nonexistent — 404 page renders (React NotFound component)", False, str(e))

    try:
        page.wait_for_selector("text=Back to Home", timeout=5000)
        page.click("text=Back to Home")
        page.wait_for_url(lambda url: url.rstrip("/") == FRONTEND or url == f"{FRONTEND}/", timeout=5000)
        check("/404 — 'Back to Home' button works", True)
    except Exception as e:
        check("/404 — 'Back to Home' button works", False, str(e))

    # ── PRODUCT → VENDOR CROSS-LINKS ─────────────────────────────────────────
    print("\n[ CROSS-LINKS — PRODUCT ↔ VENDOR ]")

    try:
        page.goto(f"{FRONTEND}/product/1")
        page.wait_for_selector("text=Visit Store", timeout=8000)
        page.click("text=Visit Store")
        page.wait_for_url(f"{FRONTEND}/vendor/1", timeout=5000)
        check("/product/1 — 'Visit Store' button goes to vendor storefront", True)
    except Exception as e:
        check("/product/1 — 'Visit Store' button goes to vendor storefront", False, str(e))

    try:
        page.goto(f"{FRONTEND}/vendor/1")
        page.wait_for_selector("text=Custom Tatau Flash Sheet", timeout=8000)
        page.locator("text=Custom Tatau Flash Sheet").first.click()
        page.wait_for_url(f"{FRONTEND}/product/1", timeout=5000)
        check("/vendor/1 — product card links to /product/1", True)
    except Exception as e:
        check("/vendor/1 — product card links to /product/1", False, str(e))

    # ── HOME PAGE — VENDOR CARDS ──────────────────────────────────────────────
    print("\n[ HOME PAGE — VENDOR + PRODUCT CARDS ]")

    try:
        page.goto(FRONTEND)
        page.wait_for_selector("text=Featured Stores", timeout=8000)
        page.locator("text=Frost City Tatau").first.click()
        page.wait_for_url(f"{FRONTEND}/vendor/1", timeout=5000)
        check("/ — home vendor card links to /vendor/1", True)
    except Exception as e:
        check("/ — home vendor card links to /vendor/1", False, str(e))

    try:
        page.goto(FRONTEND)
        page.wait_for_selector("text=Featured Products", timeout=8000)
        page.locator("text=Custom Tatau Flash Sheet").first.click()
        page.wait_for_url(f"{FRONTEND}/product/1", timeout=5000)
        check("/ — home product card links to /product/1", True)
    except Exception as e:
        check("/ — home product card links to /product/1", False, str(e))

    # ── SCROLL TO TOP ON ROUTE CHANGE ─────────────────────────────────────────
    print("\n[ SCROLL BEHAVIOR ]")

    try:
        page.goto(FRONTEND)
        page.evaluate("window.scrollTo(0, 9999)")
        time.sleep(0.3)
        scroll_before = page.evaluate("window.scrollY")
        page.goto(f"{FRONTEND}/vendors")
        page.wait_for_selector("h1", timeout=6000)
        scroll_after = page.evaluate("window.scrollY")
        check("Route change — page scrolls to top", scroll_after < 50,
              f"scrollY was {scroll_before}px, now {scroll_after}px")
    except Exception as e:
        check("Route change — page scrolls to top", False, str(e))


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def run_diagnostic():
    print("\n" + "=" * 60)
    print("  DA SHOP — Full Site Diagnostic")
    print("=" * 60)

    # Backend checks first (no browser needed)
    run_backend_checks()

    # Frontend checks with real browser
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        try:
            run_frontend_checks(page)
        finally:
            browser.close()

    # ── SUMMARY ───────────────────────────────────────────────────────────────
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
