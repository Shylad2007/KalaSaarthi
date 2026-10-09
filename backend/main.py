from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "KalaSaarthi Foundation API"})

if __name__ == "__main__":
    app.run(port=8000, debug=True)
