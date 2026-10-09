from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="artisan")  # artisan | buyer
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    craft = Column(String)           # e.g. "Handloom Weaving"
    materials = Column(String)       # e.g. "Cotton, Silk"
    region = Column(String)          # e.g. "Varanasi, Uttar Pradesh"
    state = Column(String)
    district = Column(String)
    language = Column(String, default="Hindi,English")
    experience_years = Column(Integer, default=0)
    production_capacity = Column(String)  # e.g. "10 pieces per week"
    phone = Column(String)
    bio = Column(Text)
    user = relationship("User")

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    phone = Column(String)
    default_address = Column(Text)
    user = relationship("User")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id"))
    name = Column(String)
    category = Column(String)
    description = Column(Text)
    materials = Column(String)
    color = Column(String)
    dimensions = Column(String)
    production_time = Column(String)
    tags = Column(String)
    views = Column(Integer, default=0)
    inquiries = Column(Integer, default=0)
    image_quality_score = Column(Integer, nullable=True)

    # Pricing
    ai_suggested_price = Column(Float, nullable=True)
    final_price = Column(Float, nullable=True)

    # Status
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    artisan = relationship("ArtisanProfile")
    images = relationship("ProductImage", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    image_url = Column(String)
    is_enhanced = Column(Boolean, default=False)
    product = relationship("Product", back_populates="images")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)
    status = Column(String, default="Placed")
    delivery_name = Column(String)
    delivery_address = Column(Text)
    delivery_phone = Column(String)
    estimated_delivery = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship("OrderItem", back_populates="order")
    buyer = relationship("User")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id"))
    quantity = Column(Integer)
    price_at_time = Column(Float)
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
