#!/usr/bin/env python3
"""
Add Supersistence logo image to social card
"""

from PIL import Image
import os

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
social_card_path = os.path.join(project_root, 'web', 'social-card.png')
logo_path = os.path.join(project_root, 'web', 'Supersistence_logo.png')

print("Opening images...")
social_card = Image.open(social_card_path)
logo = Image.open(logo_path)

# Convert logo to RGBA if needed
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

# Make logo smaller - target height of about 35px to fit nicely
logo_height = 35
aspect_ratio = logo.width / logo.height
logo_width = int(logo_height * aspect_ratio)
logo_resized = logo.resize((logo_width, logo_height), Image.LANCZOS)

# Create a white version by inverting (logo is black, we want white for blue background)
pixels = logo_resized.load()
for y in range(logo_resized.height):
    for x in range(logo_resized.width):
        r, g, b, a = pixels[x, y]
        # If it's dark (black logo), make it white, preserve alpha
        if r + g + b < 384:  # Sum less than 128*3 means dark
            pixels[x, y] = (255, 255, 255, a)

# Position logo in bottom left, where we added text
logo_x = 40
logo_y = 520

print(f"Adding logo at position ({logo_x}, {logo_y})...")
social_card.paste(logo_resized, (logo_x, logo_y), logo_resized)

# Save
social_card.save(social_card_path)
print(f"✓ Updated social card with Supersistence logo image: {social_card_path}")
print(f"  Logo size: {logo_width}x{logo_height}px")
