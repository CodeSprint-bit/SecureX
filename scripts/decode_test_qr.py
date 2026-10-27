from pathlib import Path
import cv2
import json

root = Path(__file__).resolve().parents[1]
decoder = cv2.QRCodeDetector()

for filename in ("qr_matching.png", "qr_mismatching.png"):
    path = root / "sample_data" / "qr" / filename
    image = cv2.imread(str(path))
    value, points, _ = decoder.detectAndDecode(image)

    print(f"\n{filename}")
    if not value:
        print("No QR payload decoded.")
        continue

    try:
        print(json.dumps(json.loads(value), indent=2))
    except json.JSONDecodeError:
        print(value)