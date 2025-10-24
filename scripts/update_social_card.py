#!/usr/bin/env python3
"""
Update social card image to change URL from hawaii-snap.netlify.app to snap.supersistence.org
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

# Load a font - try to use a nice font, fallback to default
try:
    # Try Arial or Helvetica
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
except:
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 32)
    except:
        # Use default font
        font = ImageFont.load_default()

# The old URL appears at the bottom of the image
# We need to cover it with a rectangle and write new text

# Based on the image, the URL is near the bottom
# Cover the old URL with a blue rectangle (matching the background)
# The background appears to be a blue gradient, approximately rgb(79, 134, 234)
blue_color = (79, 134, 234)

# Cover the old URL (approximate position based on viewing the image)
# The URL "hawaii-snap.netlify.app" is centered near bottom
old_url_region = (0, 560, 1200, 630)  # Full width, bottom area
draw.rectangle(old_url_region, fill=blue_color)

# Draw the new URL in the same position
new_url = "snap.supersistence.org"

# Get text bounding box to center it
bbox = draw.textbbox((0, 0), new_url, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

# Center the text horizontally
x = (1200 - text_width) / 2
y = 580  # Approximate vertical position

# Draw the new URL in white or light color
text_color = (255, 255, 255, 200)  # White with slight transparency effect
draw.text((x, y), new_url, fill=text_color, font=font)

# Save the updated image
img.save(social_card_path)
print(f"✓ Updated social card: {social_card_path}")
print(f"  Changed URL from 'hawaii-snap.netlify.app' to 'snap.supersistence.org'")
