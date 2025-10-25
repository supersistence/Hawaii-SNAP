#!/usr/bin/env python3
"""
Add "Supersistence" text branding to social card image
Simple approach using PIL only
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
social_card_path = os.path.join(project_root, 'web', 'social-card.png')

# Open the existing image
img = Image.open(social_card_path)
draw = ImageDraw.Draw(img)

# Load a nice font
try:
    # Try Helvetica Bold for branding
    font_brand = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
except:
    try:
        font_brand = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
        font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)
    except:
        # Use default
        font_brand = ImageFont.load_default()
        font_small = ImageFont.load_default()

# Add "Supersistence" branding in bottom left
# Position it above and to the left of the URL
brand_text = "supersistence"
powered_text = "Powered by"

# Get text dimensions
bbox = draw.textbbox((0, 0), brand_text, font=font_brand)
brand_width = bbox[2] - bbox[0]

bbox_small = draw.textbbox((0, 0), powered_text, font=font_small)
powered_width = bbox_small[2] - bbox_small[0]

# Position - left side, above URL
x_brand = 40
y_powered = 520
y_brand = y_powered + 28

# Draw with white/light color and slight transparency
text_color = (255, 255, 255, 230)  # White

# Draw "Powered by" smaller
draw.text((x_brand, y_powered), powered_text, fill=(255, 255, 255, 180), font=font_small)

# Draw "supersistence" larger
draw.text((x_brand, y_brand), brand_text, fill=text_color, font=font_brand)

# Save the updated image
img.save(social_card_path)
print(f"✓ Updated social card with Supersistence branding: {social_card_path}")
print(f"  Added 'Powered by supersistence' in bottom left corner")
