"""
diagnostic_benchmark.py — DA SHOP vs Shaka Wear Feature Benchmark

Compares DA SHOP's live site against the feature set of shakawear.com.
Each check tests whether DA SHOP has a capability that Shaka Wear offers.
PASS = DA SHOP matches. FAIL = DA SHOP falls short (gap identified).

Reference site: https://www.shakawear.com/
DA SHOP live:   https://dashopf-production.up.railway.app

Usage:
    python3 diagnostic_benchmark.py

Requirements:
    pip install playwright && playwright install chromium
"""

import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

FRONTEND = "https://dashopf-production.up.railway.app"

PASS = "✅ PASS"
FAIL = "❌ FAIL"
WARN = "⚠️  MISS"   # Feature absent — not broken, just not built yet

results  = []
gaps     = []


def check(label, passed, detail="", gap_description=""):
    status = PASS if passed else WARN
    msg = f"{status}  {label}"
    if detail:
        msg += f"  —  {detail}"
    print(msg)
    results.append(passed)
    if not passed and gap_description:
        gaps.append((label, gap_description))


# ─── 1. HEADER & GLOBAL NAVIGATION ───────────────────────────────────────────

def check_header(page):
    print("\n[ HEADER & GLOBAL NAVIGATION ]")
    print("  Shaka Wear: search bar, cart icon with count, promo banner, account link\n")

    page.goto(FRONTEND)
    page.wait_for_selector("nav", timeout=8000)

    # Promo / free shipping banner
    try:
        page.wait_for_selector("text=free shipping", timeout=3000)
        check("Promotional banner (free shipping threshold)", True)
    except PlaywrightTimeout:
        check(
            "Promotional banner (free shipping threshold)",
            False,
            "not found",
            "Shaka Wear shows 'FREE SHIPPING FOR U.S ORDERS OVER $75' at the top of every page. "
            "A promo banner increases AOV and sets buyer expectations before they shop.",
        )

    # Search bar in header
    try:
        page.wait_for_selector("input[type='search'], [placeholder*='Search'], [aria-label*='search'], button[aria-label*='search']", timeout=3000)
        check("Search bar accessible in header", True)
    except PlaywrightTimeout:
        check(
            "Search bar accessible in header",
            False,
            "no search input or search button found",
            "Shaka Wear has a persistent search bar in the header. Without search, "
            "buyers can't find specific products — especially critical as the catalog grows.",
        )

    # Cart icon with count
    try:
        page.wait_for_selector("[aria-label*='cart'], text=Cart, .cart-count, [href*='cart']", timeout=3000)
        check("Cart icon with item count visible in header", True)
    except PlaywrightTimeout:
        check(
            "Cart icon with item count visible in header",
            False,
            "no persistent cart UI found in header",
            "Shaka Wear shows a cart icon with a live item count in the header. "
            "DA SHOP has 'Add to Cart' on product pages but no persistent cart or count badge — "
            "buyers have no way to view or manage their cart.",
        )

    # Account / login link
    try:
        page.wait_for_selector("text=Login, text=Account, text=Sign In, [href*='login'], [href*='account']", timeout=3000)
        check("Account / login link in header", True)
    except PlaywrightTimeout:
        check(
            "Account / login link in header",
            False,
            "no login or account link found",
            "Shaka Wear has account creation and login. DA SHOP has no buyer accounts — "
            "no order history, saved items, or repeat-purchase flow.",
        )


# ─── 2. PRODUCT CARDS ─────────────────────────────────────────────────────────

def check_product_cards(page):
    print("\n[ PRODUCT CARDS ]")
    print("  Shaka Wear: price on card, product badges (New/Trending/Best Seller),")
    print("  color variant thumbnails, sort controls, load more pagination\n")

    page.goto(FRONTEND)
    page.wait_for_selector("text=Featured Products", timeout=8000)

    # Price visible on product cards
    try:
        # Look for a dollar amount on a product card
        page.wait_for_selector(".grid >> text=/$\\d+/", timeout=3000)
        check("Product cards show price", True)
    except PlaywrightTimeout:
        # Try a different approach
        cards_with_price = page.locator("text=/\\$[0-9]+/").count()
        check(
            "Product cards show price",
            cards_with_price > 0,
            f"{cards_with_price} price(s) visible on homepage",
            "Shaka Wear shows price on every product card. If DA SHOP cards don't show price, "
            "buyers must click into every product to compare costs.",
        )

    # Product badges (New, Trending, Best Seller, Sale)
    try:
        page.wait_for_selector("text=New, text=Sale, text=Trending, text=Best Seller", timeout=3000)
        check("Product badges visible on cards (New / Sale / Trending / Best Seller)", True)
    except PlaywrightTimeout:
        check(
            "Product badges visible on cards (New / Sale / Trending / Best Seller)",
            False,
            "no product badges found",
            "Shaka Wear marks products with 'New', 'Trending', and 'Best Seller' badges. "
            "Badges drive clicks — buyers gravitate toward social-proof signals.",
        )

    # Sorting controls (price, newest, best selling)
    try:
        page.wait_for_selector("select[name*='sort'], text=Sort by, text=Price: Low, text=Newest", timeout=3000)
        check("Sort controls visible on product listings (price / newest / best selling)", True)
    except PlaywrightTimeout:
        check(
            "Sort controls visible on product listings (price / newest / best selling)",
            False,
            "no sort dropdown or sort controls found",
            "Shaka Wear offers 6 sort options: Best Selling, Newest, Price Low→High, "
            "Price High→Low, A-Z, Z-A. Without sorting, buyers can't browse efficiently.",
        )

    # Load more / pagination
    try:
        page.wait_for_selector("text=Load more, text=Load More, text=Show more, button:has-text('more')", timeout=3000)
        check("Load more / pagination for large product sets", True)
    except PlaywrightTimeout:
        check(
            "Load more / pagination for large product sets",
            False,
            "no pagination found — all products load at once or there are too few to paginate",
            "Shaka Wear uses a 'Load More' button to paginate collections. "
            "As DA SHOP's catalog grows, loading everything at once will hurt performance.",
        )

    # Color / variant thumbnails on card
    try:
        page.wait_for_selector(".color-swatch, [data-color], [aria-label*='color']", timeout=3000)
        check("Color/variant swatches on product cards", True)
    except PlaywrightTimeout:
        check(
            "Color/variant swatches on product cards",
            False,
            "no color swatches on product cards",
            "Shaka Wear shows multiple color thumbnails on each product card so buyers "
            "can see variants without opening the product. DA SHOP has no variant system.",
        )


# ─── 3. PRODUCT DETAIL PAGES ─────────────────────────────────────────────────

def check_product_detail(page):
    print("\n[ PRODUCT DETAIL PAGES ]")
    print("  Shaka Wear: size selector, color selector, quantity selector, multi-image")
    print("  gallery, description, shipping info, returns info, related products,")
    print("  customer reviews, social share\n")

    page.goto(f"{FRONTEND}/product/1")
    page.wait_for_selector("text=Add to Cart", timeout=8000)

    # Price displayed on product page
    try:
        price_count = page.locator("text=/\\$[0-9]+/").count()
        check("Price displayed on product detail page", price_count > 0, f"{price_count} price element(s) found")
    except Exception as e:
        check("Price displayed on product detail page", False, str(e),
              "Shaka Wear shows price prominently before the add-to-cart button.")

    # Size selector
    try:
        page.wait_for_selector("select[name*='size'], button:has-text('S'), button:has-text('M'), button:has-text('L'), text=Select Size", timeout=3000)
        check("Size selector on product page", True)
    except PlaywrightTimeout:
        check(
            "Size selector on product page",
            False,
            "no size selector found",
            "Shaka Wear has a size selector on every apparel product. DA SHOP has no size/variant "
            "system — buyers can't select a size before adding to cart.",
        )

    # Color selector
    try:
        page.wait_for_selector("[aria-label*='color'], .color-swatch, select[name*='color'], text=Select Color", timeout=3000)
        check("Color / variant selector on product page", True)
    except PlaywrightTimeout:
        check(
            "Color / variant selector on product page",
            False,
            "no color selector found",
            "Shaka Wear offers multiple colorways per product with a color selector. "
            "DA SHOP has no variant system — each product is a single fixed item.",
        )

    # Quantity selector
    try:
        page.wait_for_selector("input[type='number'][name*='quantity'], input[min='1'], button:has-text('+'), text=Qty", timeout=3000)
        check("Quantity selector on product page", True)
    except PlaywrightTimeout:
        check(
            "Quantity selector on product page",
            False,
            "no quantity input found",
            "Shaka Wear has a quantity stepper on every product page. "
            "DA SHOP's Add to Cart always adds exactly 1 — buyers can't order multiples.",
        )

    # Multiple product images / gallery
    try:
        img_count = page.locator("img").count()
        # Check for thumbnail strip or multiple images
        page.wait_for_selector(".gallery, [data-index], img + img", timeout=3000)
        check("Product image gallery (multiple images / thumbnails)", True, f"{img_count} images on page")
    except PlaywrightTimeout:
        img_count = page.locator("img").count()
        check(
            "Product image gallery (multiple images / thumbnails)",
            img_count >= 3,
            f"{img_count} image(s) found",
            "Shaka Wear shows multiple product photos with thumbnail navigation. "
            "DA SHOP appears to have a single product image per item.",
        )

    # Product description
    try:
        page.wait_for_selector("text=Description, p:has-text('This'), .product-description", timeout=3000)
        check("Product description section", True)
    except PlaywrightTimeout:
        check(
            "Product description section",
            False,
            "no description block found",
            "Shaka Wear has detailed product descriptions covering materials, fit, and features. "
            "A description helps buyers commit — missing it increases bounce rate.",
        )

    # Shipping info on product page
    try:
        page.wait_for_selector("text=Shipping, text=shipping, text=Delivery, text=delivery", timeout=3000)
        check("Shipping info on product page", True)
    except PlaywrightTimeout:
        check(
            "Shipping info on product page",
            False,
            "no shipping info found on product page",
            "Shaka Wear shows shipping timeframes and free shipping threshold on product pages. "
            "Buyers expect to know delivery cost before committing.",
        )

    # Returns / policy info
    try:
        page.wait_for_selector("text=Return, text=return, text=Exchange, text=Refund, text=Policy", timeout=3000)
        check("Returns / exchange policy visible on product page", True)
    except PlaywrightTimeout:
        check(
            "Returns / exchange policy visible on product page",
            False,
            "no returns info found on product page",
            "Shaka Wear displays return policy on product pages. "
            "Missing returns info is one of the top reasons buyers abandon carts.",
        )

    # Customer reviews section
    try:
        page.wait_for_selector("text=Reviews, text=Review, text=stars, [aria-label*='star'], text=★", timeout=3000)
        check("Customer reviews / ratings section on product page", True)
    except PlaywrightTimeout:
        check(
            "Customer reviews / ratings section on product page",
            False,
            "no reviews section found",
            "Shaka Wear has customer reviews on product pages. Reviews are the #1 trust signal "
            "for online purchases — their absence increases buyer hesitation significantly.",
        )

    # Related products
    try:
        page.wait_for_selector("text=Related, text=You may also like, text=More from, text=Similar", timeout=3000)
        check("Related products / 'You may also like' section", True)
    except PlaywrightTimeout:
        check(
            "Related products / 'You may also like' section",
            False,
            "no related products section found",
            "Shaka Wear shows related products at the bottom of each product page. "
            "This drives additional page views and increases average order value.",
        )

    # Social share buttons
    try:
        page.wait_for_selector("text=Share, [aria-label*='share'], [href*='instagram'], [href*='facebook']", timeout=3000)
        check("Social share buttons on product page", True)
    except PlaywrightTimeout:
        check(
            "Social share buttons on product page",
            False,
            "no share buttons found",
            "Shaka Wear has social sharing on product pages. For Pacific culture products, "
            "social sharing is a natural fit — buyers share finds with their community.",
        )


# ─── 4. SEARCH ────────────────────────────────────────────────────────────────

def check_search(page):
    print("\n[ SEARCH ]")
    print("  Shaka Wear: header search bar, full product search with results page\n")

    page.goto(FRONTEND)
    page.wait_for_selector("nav", timeout=8000)

    # Search input anywhere on page
    search_input = page.locator("input[type='search'], input[placeholder*='earch']").count()
    check(
        "Site-wide product search",
        search_input > 0,
        f"{search_input} search input(s) found",
        "Shaka Wear has a global search that returns matching products instantly. "
        "Without search, buyers must browse by category to find specific items — "
        "a friction point that increases abandonment.",
    )


# ─── 5. NEWSLETTER & MARKETING ───────────────────────────────────────────────

def check_marketing(page):
    print("\n[ NEWSLETTER & MARKETING ]")
    print("  Shaka Wear: email newsletter signup, social media links\n")

    page.goto(FRONTEND)

    # Newsletter signup
    try:
        page.wait_for_selector("input[type='email'][placeholder*='email' i], text=Subscribe, text=Newsletter, text=Stay in the loop", timeout=4000)
        check("Newsletter / email signup section", True)
    except PlaywrightTimeout:
        check(
            "Newsletter / email signup section",
            False,
            "no email capture form found",
            "Shaka Wear has a 'Stay in the Loop' newsletter signup for exclusive offers and new arrivals. "
            "An email list is DA SHOP's most valuable owned marketing channel — without it, "
            "there's no way to re-engage past visitors or announce new vendors.",
        )

    # Social media links
    try:
        page.wait_for_selector("[href*='instagram'], [href*='tiktok'], [href*='facebook'], [href*='youtube']", timeout=4000)
        check("Social media links (Instagram / TikTok / Facebook / YouTube)", True)
    except PlaywrightTimeout:
        check(
            "Social media links (Instagram / TikTok / Facebook / YouTube)",
            False,
            "no social media links found",
            "Shaka Wear links to Instagram, TikTok, YouTube, and Facebook in the footer. "
            "For a Pacific culture brand, social presence is credibility — "
            "buyers expect to find the shop's Instagram before purchasing.",
        )


# ─── 6. TRUST SIGNALS ────────────────────────────────────────────────────────

def check_trust(page):
    print("\n[ TRUST SIGNALS ]")
    print("  Shaka Wear: 'Best Seller' + 'Trending' badges, free shipping banner,")
    print("  brand story / about page, FAQ, return policy page\n")

    # About / brand story page
    try:
        page.goto(f"{FRONTEND}/about")
        page.wait_for_selector("h1", timeout=5000)
        check("About / brand story page exists (/about)", True)
    except PlaywrightTimeout:
        check(
            "About / brand story page exists (/about)",
            False,
            "no h1 found at /about — page likely doesn't exist",
            "Shaka Wear has an About page with brand mission and vision. "
            "For DA SHOP, an about page would explain the Pacific vendor mission "
            "and build trust with first-time buyers.",
        )
    except Exception as e:
        check("About / brand story page exists (/about)", False, str(e),
              "An about page builds brand trust and explains the DA SHOP mission.")

    # FAQ page
    try:
        page.goto(f"{FRONTEND}/faq")
        page.wait_for_selector("h1", timeout=5000)
        check("FAQ page exists (/faq)", True)
    except PlaywrightTimeout:
        check(
            "FAQ page exists (/faq)",
            False,
            "no h1 found at /faq",
            "Shaka Wear links to a Help / FAQ section. Common buyer questions "
            "(how does shipping work? how do I return?) reduce support burden when answered upfront.",
        )
    except Exception as e:
        check("FAQ page exists (/faq)", False, str(e),
              "An FAQ page reduces common buyer questions and increases purchase confidence.")

    # Contact page
    try:
        page.goto(f"{FRONTEND}/contact")
        page.wait_for_selector("h1, form", timeout=5000)
        check("Contact page exists (/contact)", True)
    except PlaywrightTimeout:
        check(
            "Contact page exists (/contact)",
            False,
            "no content found at /contact",
            "Shaka Wear has a contact/customer service page. "
            "Buyers want to know they can reach someone if there's a problem.",
        )
    except Exception as e:
        check("Contact page exists (/contact)", False, str(e),
              "A contact page is a basic trust signal for any e-commerce site.")


# ─── 7. CART & CHECKOUT FLOW ─────────────────────────────────────────────────

def check_cart(page):
    print("\n[ CART & CHECKOUT FLOW ]")
    print("  Shaka Wear: persistent cart, cart page with line items + subtotal,")
    print("  checkout flow\n")

    # Cart page
    try:
        page.goto(f"{FRONTEND}/cart")
        page.wait_for_selector("h1, text=Your Cart, text=Cart", timeout=5000)
        check("Cart page exists (/cart)", True)
    except PlaywrightTimeout:
        check(
            "Cart page exists (/cart)",
            False,
            "no cart page content found at /cart",
            "Shaka Wear has a full cart page showing all items, quantities, subtotal, "
            "and a checkout button. DA SHOP's 'Add to Cart' button has no backing cart — "
            "buyers can't view, edit, or check out with their selections.",
        )
    except Exception as e:
        check("Cart page exists (/cart)", False, str(e),
              "A cart page is required to complete the buy flow.")

    # Checkout page / flow
    try:
        page.goto(f"{FRONTEND}/checkout")
        page.wait_for_selector("h1, text=Checkout, text=checkout, form", timeout=5000)
        check("Checkout page / flow exists (/checkout)", True)
    except PlaywrightTimeout:
        check(
            "Checkout page / flow exists (/checkout)",
            False,
            "no checkout content found at /checkout",
            "Shaka Wear has a full checkout flow (shipping address, payment). "
            "DA SHOP currently has no checkout — purchases cannot be completed.",
        )
    except Exception as e:
        check("Checkout page / flow exists (/checkout)", False, str(e),
              "A checkout flow is required to actually sell products.")


# ─── 8. COLLECTION / CATEGORY PAGES ─────────────────────────────────────────

def check_collections(page):
    print("\n[ COLLECTION / CATEGORY PAGES ]")
    print("  Shaka Wear: dedicated /collections/<category> pages, fit filters,")
    print("  12 products initial load, badges on cards\n")

    # Dedicated category landing pages (e.g., /category/clothing)
    for slug in ["clothing", "art", "food"]:
        try:
            page.goto(f"{FRONTEND}/category/{slug}")
            page.wait_for_selector("h1", timeout=5000)
            check(f"Dedicated category page exists (/category/{slug})", True)
        except PlaywrightTimeout:
            check(
                f"Dedicated category page exists (/category/{slug})",
                False,
                "no h1 found — page likely doesn't exist",
                f"Shaka Wear has a dedicated /collections/{slug} page for each category. "
                "DA SHOP filters by ?category= query param on the homepage — not a standalone page. "
                "Dedicated category pages are indexable by Google and give each category its own SEO value.",
            )
        except Exception as e:
            check(f"Dedicated category page exists (/category/{slug})", False, str(e),
                  "Dedicated category pages improve SEO and buyer navigation.")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def run_benchmark():
    print("\n" + "=" * 65)
    print("  DA SHOP — Feature Benchmark vs Shaka Wear (shakawear.com)")
    print("=" * 65)
    print("  PASS = DA SHOP has this feature")
    print("  MISS = Feature absent — gap vs Shaka Wear")
    print("=" * 65)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 900})

        try:
            check_header(page)
            check_product_cards(page)
            check_product_detail(page)
            check_search(page)
            check_marketing(page)
            check_trust(page)
            check_cart(page)
            check_collections(page)
        finally:
            browser.close()

    # ── SUMMARY ───────────────────────────────────────────────────────────────
    passed = sum(results)
    total  = len(results)
    missed = total - passed

    print("\n" + "=" * 65)
    print(f"  BENCHMARK: {passed}/{total} features present  |  {missed} gaps identified")
    print("=" * 65)

    if gaps:
        print("\n  FEATURE GAPS — DA SHOP vs Shaka Wear")
        print("  " + "-" * 61)
        for i, (label, description) in enumerate(gaps, 1):
            print(f"\n  {i}. {label}")
            # Word-wrap the description at 60 chars
            words = description.split()
            line = "     "
            for word in words:
                if len(line) + len(word) + 1 > 65:
                    print(line)
                    line = "     " + word
                else:
                    line += (" " if line.strip() else "") + word
            if line.strip():
                print(line)

    print("\n" + "=" * 65)
    print("  PRIORITY RECOMMENDATION")
    print("  " + "-" * 61)
    print("  High impact gaps (fix first):")
    print("    1. Cart page + checkout flow — buyers can't purchase yet")
    print("    2. Product pricing on cards — buyers need to compare costs")
    print("    3. Search — critical once catalog grows past ~20 products")
    print("    4. Newsletter signup — build the email list from day one")
    print("    5. Customer reviews — #1 trust signal for first-time buyers")
    print("  Lower priority (build later):")
    print("    6. Size/color variant system")
    print("    7. Product badges (New / Trending / Best Seller)")
    print("    8. Sorting + filtering controls")
    print("    9. About + FAQ + Contact pages")
    print("   10. Social media links in header/footer")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_benchmark()
