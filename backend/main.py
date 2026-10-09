"""
KalaSaarthi Backend — Complete Flask API
All phases: Auth, Products, AI, Cart, Orders, Onboarding
"""
import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from app.db.database import db_session, init_db
from app.models import User, ArtisanProfile, BuyerProfile, Product, ProductImage, CartItem, Order, OrderItem
from app.services.storage import StorageService
from app.services.ai_service import AIService
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "")
        if not token.startswith("Bearer "):
            return jsonify({"detail": "Missing token"}), 401
        try:
            payload = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            user = db_session.query(User).filter_by(email=payload["sub"]).first()
            if not user:
                return jsonify({"detail": "User not found"}), 401
            request.user = user
        except Exception:
            return jsonify({"detail": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

def artisan_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "")
        if not token.startswith("Bearer "):
            return jsonify({"detail": "Missing token"}), 401
        try:
            payload = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            user = db_session.query(User).filter_by(email=payload["sub"]).first()
            if not user or user.role != "artisan":
                return jsonify({"detail": "Artisan access required"}), 403
            request.user = user
        except Exception:
            return jsonify({"detail": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

def buyer_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "")
        if not token.startswith("Bearer "):
            return jsonify({"detail": "Missing token"}), 401
        try:
            payload = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            user = db_session.query(User).filter_by(email=payload["sub"]).first()
            if not user or user.role != "buyer":
                return jsonify({"detail": "Buyer access required"}), 403
            request.user = user
        except Exception:
            return jsonify({"detail": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

def serialize_product(p, include_artisan=False):
    d = {
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "description": p.description,
        "materials": p.materials,
        "color": p.color,
        "production_time": p.production_time,
        "tags": p.tags,
        "ai_suggested_price": p.ai_suggested_price,
        "final_price": p.final_price,
        "is_published": p.is_published,
        "views": p.views or 0,
        "image_quality_score": p.image_quality_score,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "images": [{"id": i.id, "url": i.image_url, "is_enhanced": i.is_enhanced} for i in p.images],
    }
    if include_artisan and p.artisan:
        d["artisan"] = {
            "id": p.artisan.id,
            "name": p.artisan.name,
            "craft": p.artisan.craft,
            "region": p.artisan.region,
            "state": p.artisan.state,
        }
    return d

# ─── Auth ──────────────────────────────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"detail": "Email and password required"}), 400
    if db_session.query(User).filter_by(email=data["email"]).first():
        return jsonify({"detail": "Email already registered"}), 400

    role = data.get("role", "artisan")
    if role not in ("artisan", "buyer"):
        return jsonify({"detail": "Invalid role"}), 400

    hashed = pwd_context.hash(data["password"])
    user = User(email=data["email"], hashed_password=hashed, role=role)
    db_session.add(user)
    db_session.commit()

    if role == "artisan":
        profile = ArtisanProfile(user_id=user.id, name=data.get("name", ""))
        db_session.add(profile)
    else:
        profile = BuyerProfile(user_id=user.id, name=data.get("name", ""))
        db_session.add(profile)

    db_session.commit()
    return jsonify({"id": user.id, "email": user.email, "role": user.role, "onboarding_complete": user.onboarding_complete})

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email") or data.get("username")
    password = data.get("password")
    if not email or not password:
        return jsonify({"detail": "Email and password required"}), 400

    user = db_session.query(User).filter_by(email=email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return jsonify({"detail": "Incorrect email or password"}), 400

    token = jwt.encode({
        "sub": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }, SECRET_KEY, algorithm="HS256")
    return jsonify({
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "onboarding_complete": user.onboarding_complete
    })

@app.route("/api/auth/me", methods=["GET"])
@token_required
def me():
    u = request.user
    if u.role == "artisan":
        profile = db_session.query(ArtisanProfile).filter_by(user_id=u.id).first()
        profile_data = {
            "name": profile.name if profile else "",
            "craft": profile.craft if profile else "",
            "materials": profile.materials if profile else "",
            "region": profile.region if profile else "",
            "state": profile.state if profile else "",
            "district": profile.district if profile else "",
            "language": profile.language if profile else "",
            "experience_years": profile.experience_years if profile else 0,
            "production_capacity": profile.production_capacity if profile else "",
            "phone": profile.phone if profile else "",
            "bio": profile.bio if profile else "",
        } if profile else None
    else:
        profile = db_session.query(BuyerProfile).filter_by(user_id=u.id).first()
        profile_data = {
            "name": profile.name if profile else "",
            "phone": profile.phone if profile else "",
            "default_address": profile.default_address if profile else "",
        } if profile else None

    return jsonify({
        "id": u.id,
        "email": u.email,
        "role": u.role,
        "onboarding_complete": u.onboarding_complete,
        "profile": profile_data
    })

# ─── Artisan Onboarding ────────────────────────────────────────────────────

@app.route("/api/artisan/onboarding", methods=["POST"])
@artisan_required
def complete_onboarding():
    data = request.get_json() or {}
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile:
        return jsonify({"detail": "Profile not found"}), 404

    fields = ["name", "craft", "materials", "region", "state", "district",
              "language", "experience_years", "production_capacity", "phone", "bio"]
    for field in fields:
        if field in data:
            setattr(profile, field, data[field])

    request.user.onboarding_complete = True
    db_session.commit()
    return jsonify({"ok": True})

@app.route("/api/artisan/profile", methods=["PUT"])
@artisan_required
def update_artisan_profile():
    data = request.get_json() or {}
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile:
        return jsonify({"detail": "Profile not found"}), 404

    fields = ["name", "craft", "materials", "region", "state", "district",
              "language", "experience_years", "production_capacity", "phone", "bio"]
    for field in fields:
        if field in data:
            setattr(profile, field, data[field])
    db_session.commit()
    return jsonify({"ok": True})

@app.route("/api/buyer/profile", methods=["PUT"])
@buyer_required
def update_buyer_profile():
    data = request.get_json() or {}
    profile = db_session.query(BuyerProfile).filter_by(user_id=request.user.id).first()
    if not profile:
        return jsonify({"detail": "Profile not found"}), 404
    for field in ["name", "phone", "default_address"]:
        if field in data:
            setattr(profile, field, data[field])
    db_session.commit()
    return jsonify({"ok": True})

# ─── Opportunities (personalized by profile) ───────────────────────────────

ALL_OPPORTUNITIES = [
    {
        "id": 1,
        "title": "PM Vishwakarma Yojana",
        "type": "Government Scheme",
        "description": "Central Sector Scheme supporting traditional artisans with financial assistance, skill training, and market linkage.",
        "benefits": ["₹1 lakh collateral-free loan (Phase 1)", "₹2 lakh (Phase 2)", "Skill training certificate", "Digital empowerment"],
        "eligibility": "Traditional artisans and craftspeople in 18 identified trades",
        "source": "Ministry of MSME",
        "url": "https://pmvishwakarma.gov.in",
        "crafts": ["all"],
        "states": ["all"],
        "icon": "building-2"
    },
    {
        "id": 2,
        "title": "Ambedkar Hastshilp Vikas Yojana",
        "type": "Craft Development",
        "description": "Supports artisan clusters with design development, technology upgradation, and marketing support.",
        "benefits": ["Cluster development support", "Design input", "Marketing assistance", "Common facility centres"],
        "eligibility": "Artisans in craft clusters across India",
        "source": "O/o DC Handicrafts",
        "url": "https://handicrafts.nic.in",
        "crafts": ["all"],
        "states": ["all"],
        "icon": "palette"
    },
    {
        "id": 3,
        "title": "MUDRA Loan — Shishu/Kishore/Tarun",
        "type": "Financial Support",
        "description": "Micro-finance loans for small artisan businesses — no collateral required for Shishu (up to ₹50,000).",
        "benefits": ["Up to ₹10 lakh business loan", "No collateral for Shishu/Kishore", "Low interest rates", "Flexible repayment"],
        "eligibility": "Non-farm income generating micro-enterprises",
        "source": "MUDRA Bank / PMMY",
        "url": "https://www.mudra.org.in",
        "crafts": ["all"],
        "states": ["all"],
        "icon": "landmark"
    },
    {
        "id": 4,
        "title": "National Handicraft Training Programme",
        "type": "Skill Development",
        "description": "Short-term residential and non-residential training in traditional crafts with stipend support.",
        "benefits": ["Free skill training", "Stipend during training", "Raw material support", "Tool kit on completion"],
        "eligibility": "Artisans interested in skill upgradation",
        "source": "O/o DC Handicrafts",
        "url": "https://handicrafts.nic.in",
        "crafts": ["all"],
        "states": ["all"],
        "icon": "graduation-cap"
    },
    {
        "id": 5,
        "title": "GeM Seller Registration",
        "type": "Market Access",
        "description": "Sell directly to government departments and PSUs on GeM — zero commission for artisans.",
        "benefits": ["Direct government procurement", "No middlemen", "Digital payments", "Larger buyer base"],
        "eligibility": "Registered artisans with bank account",
        "source": "GeM Portal",
        "url": "https://gem.gov.in",
        "crafts": ["all"],
        "states": ["all"],
        "icon": "shopping-bag"
    },
    {
        "id": 6,
        "title": "UP Handloom Board Support",
        "type": "State Scheme",
        "description": "Uttar Pradesh government support for handloom weavers including raw material subsidy and marketing support.",
        "benefits": ["Raw material at subsidised rates", "Marketing support", "Yarn bank facility"],
        "eligibility": "Handloom weavers registered in Uttar Pradesh",
        "source": "UP Handloom & Textile Dept",
        "url": "https://handloom.upsdc.gov.in",
        "crafts": ["handloom", "weaving", "textile", "silk"],
        "states": ["uttar pradesh", "up"],
        "icon": "scissors"
    },
    {
        "id": 7,
        "title": "Rajasthan Handicrafts Policy",
        "type": "State Scheme",
        "description": "Rajasthan government's incentives for handicraft artisans including export assistance and participation in national craft fairs.",
        "benefits": ["Export promotion", "National craft fair participation", "Subsidy on tools"],
        "eligibility": "Registered handicraft artisans of Rajasthan",
        "source": "Rajasthan Dept of Industries",
        "url": "https://industries.rajasthan.gov.in",
        "crafts": ["pottery", "blue pottery", "block printing", "leatherwork"],
        "states": ["rajasthan"],
        "icon": "map-pin"
    },
    {
        "id": 8,
        "title": "National SC/ST Hub",
        "type": "Special Category Support",
        "description": "Support for SC/ST artisan entrepreneurs including mentorship, marketing, credit facilitation, and vendor development.",
        "benefits": ["Mentorship from industry", "Priority in government procurement", "Credit facilitation"],
        "eligibility": "SC/ST artisans and entrepreneurs",
        "source": "MSME Ministry",
        "url": "https://www.nscshub.gov.in",
        "crafts": ["all"],
        "states": ["all"],
        "icon": "users"
    },
]

@app.route("/api/opportunities", methods=["GET"])
def get_opportunities():
    profile = None
    token = request.headers.get("Authorization", "")
    if token.startswith("Bearer "):
        try:
            payload = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            user = db_session.query(User).filter_by(email=payload["sub"]).first()
            if user and user.role == "artisan":
                profile = db_session.query(ArtisanProfile).filter_by(user_id=user.id).first()
        except Exception:
            pass

    result = []
    for opp in ALL_OPPORTUNITIES:
        score = 0
        reasons = []

        if profile:
            craft_lower = (profile.craft or "").lower()
            state_lower = (profile.state or profile.region or "").lower()

            craft_match = opp["crafts"] == ["all"] or any(c in craft_lower for c in opp["crafts"])
            state_match = opp["states"] == ["all"] or any(s in state_lower for s in opp["states"])

            if craft_match: score += 2; reasons.append(f"Matches your craft: {profile.craft}")
            if state_match: score += 3; reasons.append(f"Available in {profile.state or profile.region}")
            if opp["crafts"] == ["all"]: score += 1
        else:
            score = 1

        result.append({**opp, "relevance_score": score, "relevance_reasons": reasons})

    result.sort(key=lambda x: x["relevance_score"], reverse=True)
    return jsonify(result)

# ─── Products ──────────────────────────────────────────────────────────────

@app.route("/api/products", methods=["GET"])
def list_products():
    search = request.args.get("q", "").lower()
    category = request.args.get("category", "")
    products = db_session.query(Product).filter_by(is_published=True).all()
    result = [serialize_product(p, include_artisan=True) for p in products]
    if search:
        result = [p for p in result if search in (p.get("name") or "").lower()
                  or search in (p.get("description") or "").lower()
                  or search in (p.get("tags") or "").lower()]
    if category:
        result = [p for p in result if (p.get("category") or "").lower() == category.lower()]
    return jsonify(result)

@app.route("/api/products/my", methods=["GET"])
@artisan_required
def my_products():
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile:
        return jsonify([])
    products = db_session.query(Product).filter_by(artisan_id=profile.id).order_by(Product.created_at.desc()).all()
    return jsonify([serialize_product(p) for p in products])

@app.route("/api/products", methods=["POST"])
@artisan_required
def create_product():
    data = request.get_json() or {}
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile:
        return jsonify({"detail": "Artisan profile not found"}), 400
    allowed = ["name", "category", "description", "materials", "color", "production_time", "tags", "final_price"]
    kwargs = {k: v for k, v in data.items() if k in allowed}
    p = Product(artisan_id=profile.id, **kwargs)
    db_session.add(p)
    db_session.commit()
    return jsonify(serialize_product(p))

@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    p = db_session.query(Product).get(product_id)
    if not p:
        return jsonify({"detail": "Not found"}), 404
    # Increment view count
    p.views = (p.views or 0) + 1
    db_session.commit()
    return jsonify(serialize_product(p, include_artisan=True))

@app.route("/api/products/<int:product_id>", methods=["PUT"])
@artisan_required
def update_product(product_id):
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile: return jsonify({"detail": "Forbidden"}), 403
    p = db_session.query(Product).get(product_id)
    if not p: return jsonify({"detail": "Not found"}), 404
    if p.artisan_id != profile.id: return jsonify({"detail": "Forbidden"}), 403

    data = request.get_json() or {}
    allowed = ["name", "category", "description", "materials", "color", "production_time",
               "tags", "final_price", "ai_suggested_price", "is_published"]
    for k, v in data.items():
        if k in allowed:
            setattr(p, k, v)
    db_session.commit()
    return jsonify(serialize_product(p))

# ─── Image ────────────────────────────────────────────────────────────────

@app.route("/api/products/<int:product_id>/image", methods=["POST"])
@artisan_required
def upload_image(product_id):
    file = request.files.get("file")
    if not file:
        return jsonify({"detail": "No file provided"}), 400

    # Ownership check
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile:
        return jsonify({"detail": "Artisan profile not found"}), 403
    p = db_session.query(Product).get(product_id)
    if not p:
        return jsonify({"detail": "Product not found"}), 404
    if p.artisan_id != profile.id:
        return jsonify({"detail": "Forbidden"}), 403

    file_bytes = file.read()
    mime_type = file.mimetype or "application/octet-stream"
    filename = file.filename or "upload.jpg"

    # Validate & upload to Supabase
    try:
        url = StorageService.upload_image(request.user.id, product_id, file_bytes, mime_type, filename)
    except ValueError as e:
        return jsonify({"detail": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"detail": str(e)}), 502

    # Image quality analysis (non-critical)
    try:
        analysis = AIService.analyze_image(file_bytes)
    except Exception:
        analysis = {"score": None}

    # Replace existing image record (delete old, insert new)
    existing = db_session.query(ProductImage).filter_by(product_id=p.id).first()
    if existing:
        db_session.delete(existing)

    img = ProductImage(product_id=p.id, image_url=url, is_enhanced=False)
    db_session.add(img)
    p.image_quality_score = analysis.get("score")
    db_session.commit()
    return jsonify({"id": img.id, "url": url, "analysis": analysis})

# ─── AI ───────────────────────────────────────────────────────────────────

@app.route("/api/ai/transcribe", methods=["POST"])
@token_required
def transcribe():
    file = request.files.get("audio")
    if not file:
        return jsonify({"detail": "No audio file provided"}), 400

    mime_type = file.mimetype or "audio/webm"
    if not mime_type.startswith("audio/"):
        mime_type = "audio/webm"

    audio_bytes = file.read()

    # Reject extremely small payloads before hitting the API
    if len(audio_bytes) < 1024:
        return jsonify({"text": "", "no_speech": True,
                        "message": "Recording was too short or empty. Please speak clearly and try again."})

    try:
        text = AIService.transcribe_audio(audio_bytes, mime_type)
        if not text:
            return jsonify({"text": "", "no_speech": True,
                            "message": "No speech was detected. Please speak clearly and try again."})
        return jsonify({"text": text, "no_speech": False})
    except RuntimeError as e:
        return jsonify({"detail": str(e)}), 500
    except Exception as e:
        return jsonify({"detail": f"Transcription failed: {e}"}), 500

@app.route("/api/ai/generate-catalog", methods=["POST"])
@artisan_required
def generate_catalog():
    data = request.get_json() or {}
    description = data.get("description", "").strip()
    if not description:
        return jsonify({"detail": "Description required"}), 400
    catalog = AIService.generate_catalog(description, data.get("image_url", ""))
    return jsonify(catalog)

@app.route("/api/ai/recommend-price", methods=["POST"])
@artisan_required
def recommend_price():
    data = request.get_json() or {}
    result = AIService.recommend_price(
        materials=data.get("materials", ""),
        production_time=data.get("production_time", ""),
        category=data.get("category", ""),
        description=data.get("description", ""),
    )
    return jsonify(result)

@app.route("/api/products/<int:product_id>/health", methods=["GET"])
@artisan_required
def product_health(product_id):
    p = db_session.query(Product).get(product_id)
    if not p:
        return jsonify({"detail": "Not found"}), 404
    return jsonify(AIService.calculate_health(serialize_product(p)))

# ─── Revival Engine ────────────────────────────────────────────────────────

@app.route("/api/artisan/revival", methods=["GET"])
@artisan_required
def revival_engine():
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile:
        return jsonify([])
    products = db_session.query(Product).filter_by(artisan_id=profile.id).all()
    result = []
    for p in products:
        health = AIService.calculate_health(serialize_product(p))
        if health["score"] < 80:
            result.append({
                "product": serialize_product(p),
                "health": health
            })
    result.sort(key=lambda x: x["health"]["score"])
    return jsonify(result)

# ─── Cart & Orders ─────────────────────────────────────────────────────────

@app.route("/api/cart", methods=["GET"])
@buyer_required
def get_cart():
    items = db_session.query(CartItem).filter_by(user_id=request.user.id).all()
    res = []
    for item in items:
        p = item.product
        if not p: continue
        res.append({"id": item.id, "product": serialize_product(p, include_artisan=True), "quantity": item.quantity})
    return jsonify(res)

@app.route("/api/cart", methods=["POST"])
@buyer_required
def add_to_cart():
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    item = db_session.query(CartItem).filter_by(user_id=request.user.id, product_id=product_id).first()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(user_id=request.user.id, product_id=product_id, quantity=quantity)
        db_session.add(item)
    db_session.commit()
    return jsonify({"ok": True})

@app.route("/api/cart/<int:item_id>", methods=["PUT", "DELETE"])
@buyer_required
def modify_cart(item_id):
    item = db_session.query(CartItem).filter_by(id=item_id, user_id=request.user.id).first()
    if not item: return jsonify({"detail": "Not found"}), 404
    if request.method == "DELETE":
        db_session.delete(item)
    else:
        item.quantity = request.get_json().get("quantity", item.quantity)
    db_session.commit()
    return jsonify({"ok": True})

@app.route("/api/checkout", methods=["POST"])
@buyer_required
def checkout():
    data = request.get_json()
    items = db_session.query(CartItem).filter_by(user_id=request.user.id).all()
    if not items: return jsonify({"detail": "Cart is empty"}), 400
    total = sum((i.product.final_price or 0) * i.quantity for i in items if i.product)
    order = Order(
        user_id=request.user.id,
        total_amount=total,
        delivery_name=data.get("name"),
        delivery_address=data.get("address"),
        delivery_phone=data.get("phone"),
        estimated_delivery=datetime.utcnow() + timedelta(days=5)
    )
    db_session.add(order)
    db_session.flush()
    for item in items:
        if not item.product: continue
        db_session.add(OrderItem(
            order_id=order.id,
            product_id=item.product.id,
            artisan_id=item.product.artisan_id,
            quantity=item.quantity,
            price_at_time=item.product.final_price
        ))
        db_session.delete(item)
    db_session.commit()
    return jsonify({"order_id": order.id})

@app.route("/api/orders", methods=["GET"])
@buyer_required
def get_orders():
    orders = db_session.query(Order).filter_by(user_id=request.user.id).order_by(Order.created_at.desc()).all()
    return jsonify([{
        "id": o.id,
        "total_amount": o.total_amount,
        "status": o.status,
        "created_at": o.created_at.isoformat(),
        "estimated_delivery": o.estimated_delivery.isoformat() if o.estimated_delivery else None,
        "items": [{"product_name": i.product.name if i.product else "?", "quantity": i.quantity} for i in o.items]
    } for o in orders])

@app.route("/api/artisan/orders", methods=["GET"])
@artisan_required
def artisan_orders():
    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile: return jsonify([])
    order_items = db_session.query(OrderItem).filter_by(artisan_id=profile.id).all()
    orders_map = {}
    for item in order_items:
        o = item.order
        if o.id not in orders_map:
            orders_map[o.id] = {
                "id": o.id,
                "buyer_name": o.delivery_name,
                "address": o.delivery_address,
                "phone": o.delivery_phone,
                "status": o.status,
                "created_at": o.created_at.isoformat(),
                "items": []
            }
        orders_map[o.id]["items"].append({
            "product_name": item.product.name if item.product else "Unknown",
            "quantity": item.quantity,
            "price": item.price_at_time
        })
    return jsonify(list(orders_map.values()))

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
@artisan_required
def update_order_status(order_id):
    data = request.get_json()
    order = db_session.query(Order).get(order_id)
    if not order: return jsonify({"detail": "Not found"}), 404

    profile = db_session.query(ArtisanProfile).filter_by(user_id=request.user.id).first()
    if not profile or not any(item.artisan_id == profile.id for item in order.items):
        return jsonify({"detail": "Forbidden"}), 403

    order.status = data.get("status", order.status)
    db_session.commit()
    return jsonify({"ok": True})

@app.route("/api/artisans/<int:artisan_id>", methods=["GET"])
def get_artisan(artisan_id):
    profile = db_session.query(ArtisanProfile).get(artisan_id)
    if not profile: return jsonify({"detail": "Not found"}), 404
    products = db_session.query(Product).filter_by(artisan_id=profile.id, is_published=True).all()
    return jsonify({
        "id": profile.id,
        "name": profile.name,
        "craft": profile.craft,
        "region": profile.region,
        "bio": profile.bio,
        "products": [serialize_product(p) for p in products]
    })

if __name__ == "__main__":
    init_db()
    app.run(port=8000, debug=True)
