from flask import Flask, jsonify, request
from flask_cors import CORS
from app.db.database import db_session, init_db
from app.models import User, ArtisanProfile, BuyerProfile, Product, ProductImage, CartItem, Order, OrderItem
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "KalaSaarthi Foundation API"})

# (Auth and other endpoints omitted for isolation)


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
