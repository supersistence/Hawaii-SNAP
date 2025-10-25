#!/usr/bin/env python3
"""
Create a professional social card for Hawaii SNAP from scratch
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
social_card_path = os.path.join(project_root, 'web', 'social-card.png')
logo_path = os.path.join(project_root, 'web', 'SUPERSISTENCE logo copy.png')

# Social card dimensions (optimal for Facebook, Twitter, LinkedIn)
width = 1200
height = 630

# Create new image with gradient background
print("Creating new social card...")
img = Image.new('RGB', (width, height))
draw = ImageDraw.Draw(img)

# Create a nice blue gradient background
for y in range(height):
    # Gradient from darker blue at top to lighter blue at bottom
    r = int(55 + (y / height) * 25)
    g = int(120 + (y / height) * 35)
    b = int(200 + (y / height) * 35)
    draw.rectangle([(0, y), (width, y + 1)], fill=(r, g, b))

# Load fonts
try:
    # Title font - large and bold
    font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 90)
    font_subtitle = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
    font_stats = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    font_url = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
except:
    print("Warning: Using default fonts")
    font_title = ImageFont.load_default()
    font_subtitle = ImageFont.load_default()
    font_stats = ImageFont.load_default()
    font_small = ImageFont.load_default()
    font_url = ImageFont.load_default()

# Define colors
white = (255, 255, 255)
light_white = (255, 255, 255, 240)
gold = (255, 200, 50)

# Draw main title - centered
title = "Hawaii SNAP Analysis"
bbox = draw.textbbox((0, 0), title, font=font_title)
title_width = bbox[2] - bbox[0]
x_title = (width - title_width) // 2
y_title = 80
draw.text((x_title, y_title), title, fill=white, font=font_title)

# Draw subtitle
subtitle = "1989-2025 Data & Insights"
bbox = draw.textbbox((0, 0), subtitle, font=font_subtitle)
subtitle_width = bbox[2] - bbox[0]
x_subtitle = (width - subtitle_width) // 2
y_subtitle = y_title + 110
draw.text((x_subtitle, y_subtitle), subtitle, fill=white, font=font_subtitle)

# Draw key statistics - centered
y_stats = y_subtitle + 90

# Stat 1
stat1 = "165K people • $720M annually"
bbox = draw.textbbox((0, 0), stat1, font=font_stats)
stat1_width = bbox[2] - bbox[0]
x_stat1 = (width - stat1_width) // 2
draw.text((x_stat1, y_stats), stat1, fill=white, font=font_stats)

# Stat 2
stat2 = "Pandemic trends • Federal shutdown impact"
bbox = draw.textbbox((0, 0), stat2, font=font_small)
stat2_width = bbox[2] - bbox[0]
x_stat2 = (width - stat2_width) // 2
y_stat2 = y_stats + 55
draw.text((x_stat2, y_stat2), stat2, fill=white, font=font_small)

# Draw highlight feature
feature = "Working Family Analysis"
bbox = draw.textbbox((0, 0), feature, font=font_small)
feature_width = bbox[2] - bbox[0]
x_feature = (width - feature_width) // 2
y_feature = y_stat2 + 50
draw.text((x_feature, y_feature), feature, fill=gold, font=font_small)

# Draw URL at bottom
url = "snap.supersistence.org"
bbox = draw.textbbox((0, 0), url, font=font_url)
url_width = bbox[2] - bbox[0]
x_url = (width - url_width) // 2
y_url = height - 80
draw.text((x_url, y_url), url, fill=white, font=font_url)

# Add Supersistence logo in bottom left
if os.path.exists(logo_path):
    logo = Image.open(logo_path)

    # Convert to RGBA
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')

    # Resize logo
    logo_height = 40
    aspect_ratio = logo.width / logo.height
    logo_width = int(logo_height * aspect_ratio)
    logo = logo.resize((logo_width, logo_height), Image.LANCZOS)

    # Convert logo: white background to transparent, black to white
    data = logo.getdata()
    new_data = []
    for item in data:
        if len(item) == 4:
            r, g, b, a = item
        else:
            r, g, b = item
            a = 255

        # If pixel is white/light (background), make it fully transparent
        if r > 200 and g > 200 and b > 200:
            new_data.append((255, 255, 255, 0))  # Transparent
        # If pixel is black/dark (logo), make it white and opaque
        elif r < 128 and g < 128 and b < 128:
            new_data.append((255, 255, 255, 255))  # White, fully opaque
        else:
            # Gray pixels - make proportionally transparent
            avg = (r + g + b) // 3
            alpha = 255 - avg  # Darker = more opaque
            new_data.append((255, 255, 255, alpha))

    logo.putdata(new_data)

    # Position in bottom left
    logo_x = 40
    logo_y = height - logo_height - 35
    img.paste(logo, (logo_x, logo_y), logo)
    print(f"Added logo at ({logo_x}, {logo_y})")

# Save
img.save(social_card_path, quality=95)
print(f"✓ Created new social card: {social_card_path}")
print(f"  Dimensions: {width}x{height}px")
print(f"  Clean, professional design with gradient background")
