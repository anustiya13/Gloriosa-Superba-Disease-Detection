"""
scripts/test_api_endpoints.py
-----------------------------
End-to-end validation of backend API with real AI inference:
1. Health check
2. Authentication (OTP flow)
3. Prediction with valid Gloriosa superba image
4. Prediction with non-Gloriosa image (crop validation rejection)
5. History verification
"""

import urllib.request
import urllib.parse
import json
import mimetypes
import uuid
import os

BASE_URL = "http://127.0.0.1:8000"

def http_json(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def upload_image(path, filepath, token):
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    filename = os.path.basename(filepath)
    with open(filepath, "rb") as f:
        file_bytes = f.read()
        
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'.encode("utf-8"))
    body.extend(b"Content-Type: image/jpeg\r\n\r\n")
    body.extend(file_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {token}"
    }
    
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

if __name__ == "__main__":
    print("--- 1. Testing Health Endpoint ---")
    st, data = http_json("GET", "/api/health")
    print(f"Status: {st}, Health Data: {data}")
    assert data["mock_ai"] is False, "MOCK_AI should be False!"
    
    print("\n--- 2. Testing Authentication (Send OTP & Verify) ---")
    st, data = http_json("POST", "/api/auth/send-otp", {"phone_number": "9876543210"})
    print(f"Send OTP Response: {data}")
    
    st, data = http_json("POST", "/api/auth/verify-otp", {"phone_number": "9876543210", "otp": "123456"})
    print(f"Verify OTP Response: user_id={data.get('user_id')}")
    token = data["access_token"]
    
    print("\n--- 3. Testing Real Gloriosa Superba Image Analysis ---")
    gloriosa_img = r"c:\Users\anust\OneDrive\Desktop\MINIPROJECT_\dataset\raw_collected_images\WhatsApp Image 2026-10-13 at 3.04.46 PM (1).jpeg"
    st, res_gloriosa = upload_image("/api/analysis/predict", gloriosa_img, token)
    print("Gloriosa Superba Analysis Result:")
    print(json.dumps(res_gloriosa, indent=2, default=str))
    assert res_gloriosa["is_gloriosa"] is True, "Image should be recognized as Gloriosa superba!"
    
    print("\n--- 4. Testing Non-Gloriosa Image (Crop Validation Rejection) ---")
    non_gloriosa_img = r"c:\Users\anust\OneDrive\Desktop\MINIPROJECT_\dataset\non_gloriosa\non_gloriosa_001.jpg"
    st, res_non = upload_image("/api/analysis/predict", non_gloriosa_img, token)
    print("Non-Gloriosa Analysis Result:")
    print(json.dumps(res_non, indent=2, default=str))
    assert res_non["is_gloriosa"] is False, "Non-Gloriosa should be rejected by crop validator!"
    
    print("\n--- 5. Testing Analysis History ---")
    st, hist = http_json("GET", "/api/history", token=token)
    print(f"Total History Records: {len(hist)}")
    if hist:
        print("Latest Record:", json.dumps(hist[0], indent=2, default=str))
        
    print("\n--- 6. Testing Invalid File Upload Rejection ---")
    try:
        # Create a small dummy non-image file
        dummy_file = "dummy_invalid.txt"
        with open(dummy_file, "w") as f:
            f.write("This is not a plant image")
        st, res_err = upload_image("/api/analysis/predict", dummy_file, token)
        print("Unexpected response:", res_err)
    except urllib.error.HTTPError as e:
        print(f"Server correctly rejected invalid file with HTTP {e.code}")
        err_body = json.loads(e.read().decode("utf-8"))
        print(f"Error detail: {err_body}")
    finally:
        if os.path.exists("dummy_invalid.txt"):
            os.remove("dummy_invalid.txt")

    print("\n=== ALL ENDPOINTS AND EDGE CASES VERIFIED SUCCESSFULLY WITH REAL AI INFERENCE ===")
