#!/usr/bin/env python3
"""
Add Supersistence logo to social card image
"""

from PIL import Image, ImageDraw, ImageFont
import os
import cairosvg
from io import BytesIO

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
social_card_path = os.path.join(project_root, 'web', 'social-card.png')
logo_svg_path = os.path.join(project_root, 'web', 'Supersistence_logo.svg')
logo_png_path = os.path.join(project_root, 'web', 'supersistence_logo_temp.png')

# Convert SVG to PNG with transparency
print("Converting SVG logo to PNG...")
cairosvg.svg2png(
    url=logo_svg_path,
    write_to=logo_png_path,
    output_width=300,  # Reasonable width for the social card
    background_color='transparent'
)

# Open the social card and logo
print("Opening images...")
social_card = Image.open(social_card_path)
logo = Image.open(logo_png_path)

# Make sure logo has transparency
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

# Resize logo if needed (max height 50px to fit nicely)
logo_height = 50
aspect_ratio = logo.width / logo.height
logo_width = int(logo_height * aspect_ratio)
logo = logo.resize((logo_width, logo_height), Image.LANCZOS)

# Position logo at bottom left, just above the URL
# Social card is 1200x630, URL is around y=580-600
logo_x = 40  # Left margin
logo_y = 520  # Above the URL text

# Create a white/light version of the logo since background is blue
# Convert black parts to white
logo_data = logo.getdata()
new_logo_data = []
for item in logo_data:
    # If pixel has alpha (RGBA)
    if len(item) == 4:
        r, g, b, a = item
        # If it's mostly black (r+g+b < 128*3), make it white
        if r + g + b < 128 * 3 and a > 0:
            new_logo_data.append((255, 255, 255, a))
        else:
            new_logo_data.append(item)
    else:
        new_logo_data.append(item)

logo.putdata(new_logo_data)

# Paste logo onto social card
print(f"Adding logo at position ({logo_x}, {logo_y})...")
social_card.paste(logo, (logo_x, logo_y), logo)

# Save the updated social card
social_card.save(social_card_path)
print(f"✓ Updated social card with Supersistence logo: {social_card_path}")

# Clean up temp file
os.remove(logo_png_path)
print("✓ Cleaned up temporary files")
