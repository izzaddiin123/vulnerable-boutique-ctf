from flask import Flask, request, jsonify, render_template_string
import mysql.connector
import os
import requests
import jwt
import pickle
import base64
import time
def get_db():
    retries = 10
    while retries > 0:
        try:
            return mysql.connector.connect(
                host=os.getenv('DB_HOST', 'database'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', 'rootpassword'),
                database=os.getenv('DB_NAME', 'boutique_db')
            )
        except mysql.connector.Error:
            retries -= 1
            time.sleep(2)
    raise Exception("Could not connect to MySQL server after multiple retries.")
app = Flask(__name__)
JWT_SECRET = "secret"  # Weak JWT secret

@app.route('/products', methods=['GET'])
def get_products():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    db.close()
    return jsonify(products)

# 1. SQL Injection (Auth Bypass & DB Extraction)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '')
    password = data.get('password', '')
    query = f"SELECT * FROM users WHERE email = '{email}' AND password = '{password}'"
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(query)
        user = cursor.fetchone()
        db.close()
        if user:
            token = jwt.encode({"id": user["id"], "role": user["role"]}, JWT_SECRET, algorithm="HS256")
            return jsonify({"success": True, "token": token, "user": user})
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. Server-Side Template Injection (SSTI)
@app.route('/preview-card', methods=['POST'])
def preview_card():
    message = request.json.get('message', '') if request.is_json else request.form.get('message', '')
    template = f"<div style='border:1px solid gold; padding:20px;'><h3>Boutique Card</h3><p>{message}</p></div>"
    return render_template_string(template)

# 3. OS Command Injection
@app.route('/admin/generate-label', methods=['POST'])
def generate_label():
    tracking_id = request.json.get('tracking_id', '')
    cmd = f"echo 'Processing shipment {tracking_id}' >> /tmp/shipments.log"
    os.system(cmd)
    return jsonify({"status": f"Label generated for {tracking_id}"})

# 4. IDOR (Order Receipts)
@app.route('/account/receipt', methods=['GET'])
def receipt():
    order_id = request.args.get('order_id', '1')
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM orders WHERE id = {order_id}")
    order = cursor.fetchone()
    db.close()
    return jsonify(order or {"error": "Receipt not found"})

# 5. SSRF
@app.route('/fetch-design', methods=['POST'])
def fetch_design():
    url = request.json.get('url', '')
    try:
        res = requests.get(url, timeout=3)
        return jsonify({"content": res.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 6. Race Condition (Coupon Stacking)
@app.route('/redeem-coupon', methods=['POST'])
def redeem_coupon():
    user_id = request.json.get('user_id', 2)
    code = request.json.get('code', '')
    
    if code == "LUXURY50":
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(f"SELECT balance FROM users WHERE id = {user_id}")
        user = cursor.fetchone()
        
        time.sleep(1)  # Window for concurrent race requests
        
        new_balance = float(user['balance']) + 50.00
        cursor.execute(f"UPDATE users SET balance = {new_balance} WHERE id = {user_id}")
        db.commit()
        db.close()
        return jsonify({"success": True, "new_balance": new_balance})
    return jsonify({"success": False, "message": "Invalid Code"}), 400

# 7. Business Logic / Negative Price Vulnerability
@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.get_json() or {}
    price = float(data.get('price', 0))
    quantity = int(data.get('quantity', 1))
    total = price * quantity
    return jsonify({"status": "Success", "total_charged": total, "flag": "FLAG{logic_flaw_negative_price_purchase}" if total <= 0 else ""})

# 8. Insecure Deserialization
@app.route('/import-cart', methods=['POST'])
def import_cart():
    try:
        raw_b64 = request.json.get('session_data', '')
        decoded = base64.b64decode(raw_b64)
        cart_data = pickle.loads(decoded)
        return jsonify({"status": "Cart loaded", "cart": str(cart_data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 9. JWT Auth Bypass
@app.route('/admin/dashboard', methods=['GET'])
def admin_dashboard():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing Token"}), 401
    
    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        if decoded.get("role") == "admin":
            return jsonify({"admin_panel": "Welcome Admin", "flag": "FLAG{jwt_token_forgery_admin_bypass}"})
        return jsonify({"error": "Unauthorized role"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 10. Information Disclosure
@app.route('/debug-env', methods=['GET'])
def debug_env():
    return jsonify({"env": dict(os.environ), "flag": "FLAG{information_disclosure_environment_keys}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)