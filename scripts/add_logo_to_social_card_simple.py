#!/usr/bin/env python3
"""
Add Supersistence logo to social card image
Uses svglib to convert SVG to PIL Image
"""

from PIL import Image, ImageDraw, ImageFont
import os

try:
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPM
    HAS_SVGLIB = True
except ImportError:
    HAS_SVGLIB = False

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
social_card_path = os.path.join(project_root, 'web', 'social-card.png')
logo_svg_path = os.path.join(project_root, 'web', 'Supersistence_logo.svg')

if not HAS_SVGLIB:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(['pip3', 'install', 'svglib', 'reportlab'])
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPM

# Convert SVG to PIL Image
print("Converting SVG logo to image...")
drawing = svg2rlg(logo_svg_path)

# Scale to desired width (300px)
scale_factor = 300 / drawing.width
drawing.width = 300
drawing.height = drawing.height * scale_factor
drawing.scale(scale_factor, scale_factor)

# Render to PNG in memory
from io import BytesIO
png_data = BytesIO()
renderPM.drawToFile(drawing, png_data, fmt='PNG', bg=0x4F86EA)  # Blue background matching card
png_data.seek(0)

# Open as PIL Image
logo = Image.open(png_data)

# Ensure RGBA mode
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

# Resize logo to fit nicely (height ~40-50px)
logo_height = 45
aspect_ratio = logo.width / logo.height
logo_width = int(logo_height * aspect_ratio)
logo = logo.resize((logo_width, logo_height), Image.LANCZOS)

# Open social card
print("Opening social card...")
social_card = Image.open(social_card_path)

# Position logo at bottom left
logo_x = 30
logo_y = 525  # Just above the URL

# Paste logo
print(f"Adding logo at position ({logo_x}, {logo_y})...")
social_card.paste(logo, (logo_x, logo_y), logo if logo.mode == 'RGBA' else None)

# Save
social_card.save(social_card_path)
print(f"✓ Updated social card with Supersistence logo: {social_card_path}")
