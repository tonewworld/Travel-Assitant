from flask import Flask, request, render_template, jsonify
import requests
import os

app = Flask(__name__)

# 换成你的真实 KEY 或本地模型地址
OPENAI_API_KEY = os.getenv("MOONSHOT_API_KEY", "api-key")
OPENAI_API_URL = "https://api.moonshot.cn/v1/chat/completions"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    user_input = request.json.get("text", "").strip()
    if not user_input:
        return jsonify({"reply": "请输入关键词"}), 400

    payload = {
        "model": "moonshot-v1-8k",   # 可改 gpt-4 / glm-4 / qwen-turbo 等
        "messages": [
            {"role": "system", "content": "你是一个贴心的小助手，用中文回答，尽量简洁。"},
            {"role": "user", "content": user_input}
        ],
        "temperature": 0.7
    }

    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}

    try:
        rsp = requests.post(OPENAI_API_URL, json=payload, headers=headers, timeout=30)
        rsp.raise_for_status()
        answer = rsp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        answer = f"调用模型出错：{e}"

    return jsonify({"reply": answer})

if __name__ == "__main__":
    app.run(debug=True, port=5000)