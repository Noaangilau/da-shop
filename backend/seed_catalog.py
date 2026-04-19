"""
Idempotent seed script — inserts FDC brand + 53 products.
Run: python seed_catalog.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine, Base
import models.brand   # noqa: F401 — ensures table is registered
import models.product  # noqa: F401

Base.metadata.create_all(bind=engine)

from models.brand import Brand
from models.product import Product

SIZES = json.dumps(["S", "M", "L", "XL", "2XL", "3XL"])
PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80"  # TODO: replace with real FDC product images
TEE_PRICE = 35.0    # TODO: confirm with FDC
LS_PRICE = 45.0     # TODO: confirm with FDC

KAIKEFIU_DISCLAIMER = (
    "FDC Kaikefiu Series — Pacific identity parody apparel. "
    "These designs are commentary on the cultural mashup of growing up Polynesian in America. "
    "Kaikefiu (n.) — one who indulges excessively in American things."
)

FDC_BRAND = {
    "name": "Filiku Design Co.",
    "tagline": "Pacific identity. Worn with pride.",
    "bio": (
        "Pacific apparel for the diaspora. Born in Utah, rooted in the islands. "
        "FDC makes gear for the kids who grew up between two worlds — Polynesian by blood, "
        "American by circumstance. Every design is a conversation between where we come from "
        "and where we landed."
    ),
    "category": "Clothing",
    "location": "Salt Lake City, Utah",
    "instagram": "@filikudesignco",
    "logo_white_url": "/brands/fdc-logo-white.png",
    "logo_navy_url": "/brands/fdc-logo-navy.png",
    "hero_image_url": "https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=1600&q=80",  # TODO: replace with real FDC hero
    "card_image_url": "https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=800&q=80",   # TODO: replace with real FDC card
    "is_active": True,
}

# Each tuple: (name, collection, price, subcategory, description, kaikefiu)
PRODUCTS = [
    # ── COLLECTION 1: THE GREETINGS ──────────────────────────────────────────────
    (
        "Alofas Script Tee — Green/Gold",
        "The Greetings", TEE_PRICE, "The Greetings",
        "Alofa — love in Samoan and Tongan — rendered in bold script on a green and gold field. A greeting worn on the chest, given freely to everyone you pass.",
        False,
    ),
    (
        "Alofas Script Long Sleeve — Green/Gold",
        "The Greetings", LS_PRICE, "The Greetings",
        "The Alofas script in long-sleeve form — green and gold standing up through every season. Island warmth, extended.",
        False,
    ),
    (
        "Alofas Script Tee — Yellow/White",
        "The Greetings", TEE_PRICE, "The Greetings",
        "The same alofa energy in a sunlit yellow and white colorway. Bright as the greeting itself.",
        False,
    ),
    (
        "Ofas Script Tee — Green/Yellow",
        "The Greetings", TEE_PRICE, "The Greetings",
        "Ofa — the Tongan word for love — written large and proud. Green and gold for the islands in your blood.",
        False,
    ),
    (
        "Ofas Script Tee — Black/Gold",
        "The Greetings", TEE_PRICE, "The Greetings",
        "Black and gold Ofa script — midnight colors for a word that runs deep. Love dressed in its most serious colorway.",
        False,
    ),
    (
        "Ofas Script Tee — Red/Navy/White",
        "The Greetings", TEE_PRICE, "The Greetings",
        "Red, navy, and white — colors that live on flags and in family pride. Ofa in the colors of the motherland.",
        False,
    ),
    (
        "Alohas Script Tee",  # TODO: colorway TBD
        "The Greetings", TEE_PRICE, "The Greetings",
        "Aloha — the word that carries a whole philosophy of welcome and farewell. Script tee dropping soon.",
        False,
    ),
    # ── COLLECTION 2: THE NEIGHBORHOODS ──────────────────────────────────────────
    (
        "Glendale Script Tee — Navy",
        "The Neighborhoods", TEE_PRICE, "The Neighborhoods",
        "Glendale — one of Salt Lake's most Pacific neighborhoods — claimed in navy script. Rep the block where the community planted roots.",
        False,
    ),
    (
        "Glendale Script Tee — Black Outline",
        "The Neighborhoods", TEE_PRICE, "The Neighborhoods",
        "The Glendale script in stark black outline on white. Clean enough for Sunday, real enough for the block.",
        False,
    ),
    (
        "Rose Park Script Tee",  # TODO: colorway TBD
        "The Neighborhoods", TEE_PRICE, "The Neighborhoods",
        "Rose Park — another SLC neighborhood where Pacific families built something from nothing. The block immortalized.",
        False,
    ),
    (
        "West Valley City Tee",  # TODO: colorway TBD
        "The Neighborhoods", TEE_PRICE, "The Neighborhoods",
        "West Valley — the city within the city, where the culture lives loudest. A tee for everyone who calls it home.",
        False,
    ),
    (
        "Poplar Grove Tee",  # TODO: colorway TBD
        "The Neighborhoods", TEE_PRICE, "The Neighborhoods",
        "Poplar Grove, where Pacific roots run deep in Utah soil. Carrying the neighborhood wherever you go.",
        False,
    ),
    (
        "SLC Script Tee",  # TODO: colorway TBD
        "The Neighborhoods", TEE_PRICE, "The Neighborhoods",
        "Salt Lake City in bold script — because the diaspora made this city its own. From the islands to the valley.",
        False,
    ),
    # ── COLLECTION 3: THE IDENTITY ────────────────────────────────────────────────
    (
        "SĀ Tee — White/Black",
        "The Identity", TEE_PRICE, "The Identity",
        "SĀ — sacred, forbidden, set apart. A single word that holds entire traditions. White on black, the definition of contrast.",
        False,
    ),
    (
        "SĀ Tee — White/Blue/Red",
        "The Identity", TEE_PRICE, "The Identity",
        "SĀ in the colors of flags and bloodlines — white, blue, and red. The sacred, rendered in the colors of the diaspora's double identity.",
        False,
    ),
    (
        "Samoans × Mariners Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Pacific heritage meets the Pacific Northwest — a mashup for the Samoans who fell in love with Seattle. Two cultures, one chest.",
        False,
    ),
    (
        "Samoans × Rangers Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Samoan pride wearing Texas colors. For the diaspora scattered wide enough to love two homes at once.",
        False,
    ),
    (
        "Tongans × Dodgers Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Tongan pride in Dodger blue — because the Pacific community runs deep in Southern California. Island meets coast.",
        False,
    ),
    (
        "Tongans × Utes Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Red and black for the Tongans who bled Ute. Utah raised, island made — the crossroads in a tee.",
        False,
    ),
    (
        "Tongans × Diamondbacks Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Tonga meets the Valley of the Sun. For the Tongan community in Arizona — the desert never felt so Pacific.",
        False,
    ),
    (
        "Tongans × Cougs Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Blue and white for the Tongans who found a home in Provo. Faith, family, and football — all three in one design.",
        False,
    ),
    (
        "Tonga Script Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Just the name — just the island. Tonga in script, nothing else needed. Some identities speak for themselves.",
        False,
    ),
    (
        "Mate Ma'a Tonga Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "Die for Tonga — the war cry that echoes from rugby fields worldwide. Worn by those who mean it with every heartbeat.",
        False,
    ),
    (
        "Made in Tonga Tee",
        "The Identity", TEE_PRICE, "The Identity",
        "No matter where you landed, this tells them where you were made. Origin story on a tee.",
        False,
    ),
    # ── COLLECTION 4: THE NESIANS ─────────────────────────────────────────────────
    (
        "Nesian by Nature Tee",
        "The Nesians", TEE_PRICE, "The Nesians",
        "Not by choice, not by chance — by nature. A statement for everyone who was born Pacific and will die Pacific, wherever they are.",
        False,
    ),
    (
        "Nesians × Lakers Tee",
        "The Nesians", TEE_PRICE, "The Nesians",
        "Purple and gold for the Nesians who grew up watching Showtime. Pacific pride runs from the islands to Staples Center.",
        False,
    ),
    (
        "Nesians × Grizzy Tee",
        "The Nesians", TEE_PRICE, "The Nesians",
        "Nesian blood, Grizzlies blue — for the Pacific community that put down roots in Memphis. Grit and grind, island style.",
        False,
    ),
    # ── COLLECTION 5: UTAH PRIDE ──────────────────────────────────────────────────
    (
        "Utah Native Tee",
        "Utah Pride", TEE_PRICE, "Utah Pride",
        "Born and raised in the Beehive State — but native to something older than Utah's statehood. For the Pacific kids who grew up calling this home.",
        False,
    ),
    (
        "Life Elevation Tee",
        "Utah Pride", TEE_PRICE, "Utah Pride",
        "The elevation is 4,226 feet, but the spirit runs higher. Living Pacific at altitude — this is life in elevation.",
        False,
    ),
    # ── COLLECTION 6: THE HIGH SCHOOLS ───────────────────────────────────────────
    (
        "West High Tee",
        "The High Schools", TEE_PRICE, "The High Schools",
        "West High — where Salt Lake's Pacific students dominated hallways, fields, and stages. The alma mater, immortalized.",
        False,
    ),
    (
        "Granger High Tee",
        "The High Schools", TEE_PRICE, "The High Schools",
        "Granger — another school where the diaspora showed up and showed out. For the alumni who still bleed those colors.",
        False,
    ),
    (
        "Hunter High Tee",
        "The High Schools", TEE_PRICE, "The High Schools",
        "Hunter High, where Pacific families planted flags in the West Valley. School pride that runs deeper than the yearbook.",
        False,
    ),
    (
        "East High Tee",
        "The High Schools", TEE_PRICE, "The High Schools",
        "East High in Capitol Hill — where cultures collide and Pacific students left their mark. The hallways remember.",
        False,
    ),
    # ── COLLECTION 7: KAIKEFIU ───────────────────────────────────────────────────
    (
        "Kaikefiu × Nintendo Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} The controller in one hand, a plate of taro in the other — this tee knows who you are.",
        True,
    ),
    (
        "Kaikefiu × SEGA Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} SEGA Saturday mornings, aunty's cooking on the stove — the ultimate Pacific childhood in one design.",
        True,
    ),
    (
        "Kaikefiu × Fortnite Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} Victory royale and plate lunch — the new generation of Pacific excess, documented in apparel.",
        True,
    ),
    (
        "Kaikefiu × TMNT Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} Cowabunga! For the Pacific kid who could recite every turtle's name but also every island protocol.",
        True,
    ),
    (
        "Kaikefiu × Newport Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} Commentary on consumption culture, rendered in Pacific parody. You know exactly what this is about.",
        True,
    ),
    (
        "Kaikefiu × Gatorade Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} Is it in you? For the Pacific athlete who hydrated on Gatorade but was fueled by something older.",
        True,
    ),
    (
        "Kaikefiu × Chuckarama Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} The all-you-can-eat buffet as Pacific cultural institution. Chuckarama was a pilgrimage, and this tee knows it.",
        True,
    ),
    (
        "Kaikefiu × Saimini Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} Saimin — the Hawaiian noodle soup that became Pacific comfort food. Excess never tasted this good.",
        True,
    ),
    (
        "Kaikefiu × 9ers Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} The Bay Area's Pacific community and the red and gold — an obsession documented in parody apparel.",
        True,
    ),
    (
        "Kaikefiu KKF Tee",
        "Kaikefiu", TEE_PRICE, "Kaikefiu",
        f"{KAIKEFIU_DISCLAIMER} KKF — the initials that say everything without saying anything. The OGs know.",
        True,
    ),
    # ── COLLECTION 8: MISC ───────────────────────────────────────────────────────
    (
        "Hot Cheehoo Tee",
        "Misc", TEE_PRICE, "Misc",
        "Cheehoo — the Pacific battle cry of excitement and celebration. Hot as the energy it represents. Say it loud.",
        False,
    ),
    (
        "Salt Lake Pokemon Tee",
        "Misc", TEE_PRICE, "Misc",
        "Gotta catch 'em all in the 801. A love letter to the Pacific kids who grew up collecting cards and catching the bus.",
        False,
    ),
    (
        "Jonah Lomu Tee",
        "Misc", TEE_PRICE, "Misc",
        "The greatest to ever do it. Jonah Lomu — a Tongan giant who ran through the world and made the islands proud forever.",
        False,
    ),
    (
        "Ohana Tee",
        "Misc", TEE_PRICE, "Misc",
        "Ohana means family — and family means nobody gets left behind. The word that holds a whole value system.",
        False,
    ),
    (
        "Aloha Tee",
        "Misc", TEE_PRICE, "Misc",
        "Not a tourist slogan — a way of living. Aloha as it was meant: presence, love, and mutual regard.",
        False,
    ),
    (
        "One Love Lion Tee",
        "Misc", TEE_PRICE, "Misc",
        "The lion and the island spirit — strength, pride, and the universal language of love that crosses every ocean.",
        False,
    ),
    (
        "SLC Cityscape Tee",
        "Misc", TEE_PRICE, "Misc",
        "The Salt Lake skyline — a city reshaped by the Pacific diaspora that settled here and made it home. The skyline belongs to us too.",
        False,
    ),
    (
        "Side of Salt Lake Tee",
        "Misc", TEE_PRICE, "Misc",
        "The side of Salt Lake they don't put on postcards — the side where the culture lives. Real SLC, captured.",
        False,
    ),
    (
        "Salt Lake City Utah Tee",
        "Misc", TEE_PRICE, "Misc",
        "Full name, full pride. Salt Lake City, Utah — the Pacific diaspora capital of the Mountain West.",
        False,
    ),
    (
        "Bay Area Cityscape Tee",
        "Misc", TEE_PRICE, "Misc",
        "The Bay — where the Pacific community built one of its strongest mainland footholds. The skyline across the water, always calling.",
        False,
    ),
]


def seed():
    db = SessionLocal()
    try:
        # ── Upsert brand ─────────────────────────────────────────────────────────
        brand = db.query(Brand).filter(Brand.name == "Filiku Design Co.").first()
        if not brand:
            brand = Brand(**FDC_BRAND)
            db.add(brand)
            db.flush()
            print(f"  Created brand: {brand.name} (id={brand.id})")
        else:
            for k, v in FDC_BRAND.items():
                setattr(brand, k, v)
            print(f"  Updated brand: {brand.name} (id={brand.id})")

        db.flush()

        # ── Upsert products ───────────────────────────────────────────────────────
        created = updated = 0
        for name, collection, price, subcategory, description, kaikefiu in PRODUCTS:
            product = db.query(Product).filter(
                Product.brand_id == brand.id,
                Product.name == name,
            ).first()
            data = dict(
                brand_id=brand.id,
                name=name,
                collection=collection,
                price=price,
                category="Clothing",
                subcategory=subcategory,
                description=description,
                sizes=SIZES,
                image_url=PLACEHOLDER_IMAGE,
                type="product",
                is_active=True,
                kaikefiu=kaikefiu,
            )
            if not product:
                db.add(Product(**data))
                created += 1
            else:
                for k, v in data.items():
                    setattr(product, k, v)
                updated += 1

        db.commit()
        print(f"\n  Products created: {created}  |  updated: {updated}")
        print(f"  Total products: {created + updated} / {len(PRODUCTS)}")
        print("\n  Seed complete.")

    except Exception as e:
        db.rollback()
        print(f"\n  ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding FDC catalog...")
    seed()
