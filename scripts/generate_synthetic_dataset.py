
from pathlib import Path
import csv
import json
import io

import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "sample_data"
DOCS = DATA / "documents"
QR_DIR = DATA / "qr"
EXPECTED = DATA / "expected_results"

for folder in (DOCS, QR_DIR, EXPECTED):
    folder.mkdir(parents=True, exist_ok=True)

DISCLAIMER = "NOT VALID FOR IDENTIFICATION"
SAMPLE = {
    "name": "ALEX SAMPLE",
    "date_of_birth": "2001-04-15",
    "document_number": "TEST-000042",
    "address": "123 Example Street, Sample City",
    "issuer": "SecureX Synthetic Test Lab",
}


def font(size, bold=False):
    candidates = (
        [
            r"C:\Windows\Fonts\arialbd.ttf",
            r"C:\Windows\Fonts\segoeuib.ttf",
        ]
        if bold
        else [
            r"C:\Windows\Fonts\arial.ttf",
            r"C:\Windows\Fonts\segoeui.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def make_card(data, output_path, scale=1):
    # Entirely fictional layout; not based on any government document.
    width, height = 1000, 620
    image = Image.new("RGB", (width, height), "#f2f7fc")
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle(
        (15, 15, width - 15, height - 15),
        radius=28, fill="#ffffff", outline="#275b80", width=5
    )
    draw.rounded_rectangle(
        (20, 20, width - 20, 130),
        radius=24, fill="#173b57"
    )
    draw.rectangle((20, 95, width - 20, 130), fill="#173b57")

    draw.text(
        (45, 35), "SECUREX | SYNTHETIC TEST CARD",
        font=font(32, True), fill="white"
    )
    draw.text(
        (45, 83), "FICTIONAL DATASET • QA ONLY",
        font=font(20), fill="#cbe8ff"
    )

    # Large, unmistakable disclaimer.
    draw.rounded_rectangle(
        (35, 150, 965, 205),
        radius=12, fill="#ffe5e5", outline="#b00020", width=3
    )
    draw.text(
        (55, 160), DISCLAIMER,
        font=font( thirty := 30, True), fill="#a00000"
    )

    # Generic abstract portrait placeholder, not a real person's photo.
    draw.rounded_rectangle(
        (55, 235, 260, 475),
        radius=18, fill="#d9e8f5", outline="#7898b2", width=3
    )
    draw.ellipse((118, 270, 197, 350), fill="#7795ac")
    draw.rounded_rectangle(
        (90, 360, 225, 445), radius=35, fill="#7795ac"
    )
    draw.text(
        (65, 485), "FICTIONAL PORTRAIT",
        font=font(18, True), fill="#40576b"
    )

    labels = [
        ("NAME", data["name"]),
        ("DATE OF BIRTH", data["date_of_birth"]),
        ("TEST NUMBER", data["document_number"]),
        ("ADDRESS", data["address"]),
        ("ISSUER", data["issuer"]),
    ]
    y = 235
    for label, value in labels:
        draw.text((300, y), label, font=font(17, True), fill="#42617b")
        draw.text((300, y + 25), value, font=font(23), fill="#172d40")
        y += 75

    draw.text(
        (300, 590), "DEMONSTRATION DATA ONLY",
        font=font(18, True), fill="#a00000"
    )

    if scale != 1:
        image = image.resize(
            (max(1, width // scale), max(1, height // scale)),
            Image.Resampling.LANCZOS,
        )

    image.save(output_path)
    return image


def make_pdf(image, output_path):
    page_w, page_h = A4
    c = canvas.Canvas(str(output_path), pagesize=A4)
    c.setTitle("Synthetic SecureX QA Document - Not Valid for Identification")
    c.setFont("Helvetica-Bold", 15)
    c.setFillColorRGB(0.65, 0.0, 0.0)
    c.drawCentredString(
        page_w / 2, page_h - 45, DISCLAIMER
    )
    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica", 9)
    c.drawCentredString(
        page_w / 2, page_h - 62, "FICTIONAL QA SAMPLE - NOT A REAL ID"
    )

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    max_w = page_w - 70
    max_h = page_h - 150
    scale = min(max_w / image.width, max_h / image.height)
    draw_w, draw_h = image.width * scale, image.height * scale
    c.drawImage(
        ImageReader(buffer),
        (page_w - draw_w) / 2,
        (page_h - draw_h) / 2 - 20,
        width=draw_w,
        height=draw_h,
    )
    c.save()


def make_qr(payload, output_path):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=4,
    )
    qr.add_data(json.dumps(payload, sort_keys=True))
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save(output_path)


# 1. Clean fictional card.
clean = make_card(SAMPLE, DOCS / "sample_id_clean.png")
make_pdf(clean, DOCS / "sample_id_clean.pdf")

# 2. Altered date. This is a controlled test fixture, not a real ID.
altered_data = dict(SAMPLE)
altered_data["date_of_birth"] = "2001-04-19"
altered = make_card(altered_data, DOCS / "sample_id_altered_date.png")
make_pdf(altered, DOCS / "sample_id_altered_date.pdf")

# 3. Low-resolution copy for OCR robustness testing.
make_card(
    SAMPLE,
    DOCS / "sample_id_low_quality.jpg",
    scale=5,
)

# 4. Matching QR payload.
matching_payload = {
    "dataset": "SecureX-SYNTHETIC-QA",
    "test_case": "QR-MATCH-01",
    "document_number": SAMPLE["document_number"],
    "name": SAMPLE["name"],
    "date_of_birth": SAMPLE["date_of_birth"],
    "notice": DISCLAIMER,
}
make_qr(matching_payload, QR_DIR / "qr_matching.png")

# 5. Mismatching QR payload: DOB differs from the clean card.
mismatch_payload = dict(matching_payload)
mismatch_payload["test_case"] = "QR-MISMATCH-01"
mismatch_payload["date_of_birth"] = "2001-04-19"
make_qr(mismatch_payload, QR_DIR / "qr_mismatching.png")

# 6. Malformed PDF for defensive error-handling tests.
(DOCS / "malformed.pdf").write_bytes(
    b"%PDF-1.7\nThis is intentionally not a valid PDF.\n"
)

# 7. Machine-readable payloads.
(EXPECTED / "qr_payloads.json").write_text(
    json.dumps(
        {
            "matching": matching_payload,
            "mismatching": mismatch_payload,
        },
        indent=2,
    ),
    encoding="utf-8",
)

# 8. Test-case manifest.
rows = [
    ["TC-01", "sample_id_clean.png", "Valid synthetic image upload", "Accepted if PNG uploads are supported"],
    ["TC-02", "sample_id_clean.pdf", "Valid synthetic PDF upload", "Accepted if PDF uploads are supported"],
    ["TC-03", "sample_id_altered_date.png", "Altered date fixture", "Only report an anomaly if an enabled check detects it"],
    ["TC-04", "sample_id_low_quality.jpg", "Low-resolution image", "Report OCR uncertainty when applicable"],
    ["TC-05", "qr_matching.png", "Matching QR fields", "Decoded fields match the clean sample"],
    ["TC-06", "qr_mismatching.png", "Mismatching QR DOB", "DOB mismatch if decoding and field comparison are implemented"],
    ["TC-07", "malformed.pdf", "Malformed PDF", "Graceful rejection; server remains available"],
    ["TC-08", "sample_id_clean.png", "Authorization test", "A different user must not access this user's private document"],
]
with (EXPECTED / "test_cases.csv").open(
    "w", newline="", encoding="utf-8-sig"
) as f:
    writer = csv.writer(f)
    writer.writerow(
        ["Test ID", "Fixture", "Scenario", "Expected Result", "Actual Result", "Status"]
    )
    for test_id, fixture, scenario, expected in rows:
        writer.writerow([test_id, fixture, scenario, expected, "", "Not Run"])

# Dataset README.
(DATA / "README.md").write_text(
    """# SecureX Synthetic QA Dataset

All files in this folder are fictional test fixtures.
They are not official identity documents and are NOT VALID FOR IDENTIFICATION.

## Contents
- documents/: clean, altered-date, low-resolution, and malformed samples
- qr/: QR images with matching and intentionally mismatching fields
- expected_results/: QR payload JSON and test-case CSV

## Limitations
The altered-date file is a separate synthetic fixture, not a pixel-level
edit of the clean file. It tests different visible field values, not forensic
detection of an actual image edit. QR payloads are plain demonstration data,
not cryptographically signed issuer credentials. A readable QR code does
not establish authenticity.

Record actual results only after running tests. Never claim a test passed
merely because a fixture exists.
""",
    encoding="utf-8",
)

print("Synthetic SecureX dataset created:")
for folder in (DOCS, QR_DIR, EXPECTED):
    for path in sorted(folder.iterdir()):
        print(f" - {path.relative_to(ROOT)}")
