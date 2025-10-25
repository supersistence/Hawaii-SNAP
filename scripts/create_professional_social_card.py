#!/usr/bin/env python3
"""
Create a truly professional social card with design discipline:
- Only 2-3 font sizes
- Only 2 colors (white + one accent)
- No wasted space
- Strong visual hierarchy
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
social_card_path = os.path.join(project_root, 'web', 'social-card.png')
logo_path = os.path.join(project_root, 'web', 'SUPERSISTENCE logo copy.png')

# Dimensions
width = 1200
height = 630

# Create image with solid blue background
print("Creating professional social card...")
img = Image.new('RGB', (width, height), color=(65, 135, 210))  # Solid professional blue
draw = ImageDraw.Draw(img)

# Load fonts - ONLY 3 SIZES
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)   # Title
    font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)  # Stats
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)   # URL/details
except:
    print("Warning: Using default fonts")
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()
    font_small = ImageFont.load_default()

# ONLY 2 COLORS
white = (255, 255, 255)
accent = (255, 255, 255, 200)  # Slightly transparent white for secondary text

# Vertical positioning with NO WASTED SPACE
y_current = 100  # Start position

# Title
title = "Hawaii SNAP Analysis"
bbox = draw.textbbox((0, 0), title, font=font_large)
title_width = bbox[2] - bbox[0]
x_title = (width - title_width) // 2
draw.text((x_title, y_current), title, fill=white, font=font_large)
y_current += 90

# Subtitle
subtitle = "1989-2025 • 37 Years of Data"
bbox = draw.textbbox((0, 0), subtitle, font=font_medium)
subtitle_width = bbox[2] - bbox[0]
x_subtitle = (width - subtitle_width) // 2
draw.text((x_subtitle, y_current), subtitle, fill=white, font=font_medium)
y_current += 80

# Divider line
line_width = 600
line_x1 = (width - line_width) // 2
line_x2 = line_x1 + line_width
draw.rectangle([(line_x1, y_current), (line_x2, y_current + 2)], fill=white)
y_current += 50

# Key stats - COMPACT
stat1 = "165,000 people served monthly"
bbox = draw.textbbox((0, 0), stat1, font=font_medium)
stat1_width = bbox[2] - bbox[0]
x_stat1 = (width - stat1_width) // 2
draw.text((x_stat1, y_current), stat1, fill=white, font=font_medium)
y_current += 50

stat2 = "$720M in annual benefits"
bbox = draw.textbbox((0, 0), stat2, font=font_medium)
stat2_width = bbox[2] - bbox[0]
x_stat2 = (width - stat2_width) // 2
draw.text((x_stat2, y_current), stat2, fill=white, font=font_medium)
y_current += 70

# Features - compact list
feature1 = "Pandemic recovery analysis • Federal shutdown impact"
bbox = draw.textbbox((0, 0), feature1, font=font_small)
feature1_width = bbox[2] - bbox[0]
x_feature1 = (width - feature1_width) // 2
draw.text((x_feature1, y_current), feature1, fill=white, font=font_small)
y_current += 38

feature2 = "Working family trends • Interactive visualizations"
bbox = draw.textbbox((0, 0), feature2, font=font_small)
feature2_width = bbox[2] - bbox[0]
x_feature2 = (width - feature2_width) // 2
draw.text((x_feature2, y_current), feature2, fill=white, font=font_small)

# Bottom section - logo and URL
bottom_y = height - 70

# URL centered
url = "snap.supersistence.org"
bbox = draw.textbbox((0, 0), url, font=font_medium)
url_width = bbox[2] - bbox[0]
x_url = (width - url_width) // 2
draw.text((x_url, bottom_y), url, fill=white, font=font_medium)

# Logo - larger and cleaner
if os.path.exists(logo_path):
    logo = Image.open(logo_path)

    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')

    # Resize logo - bigger
    logo_height = 50
    aspect_ratio = logo.width / logo.height
    logo_width = int(logo_height * aspect_ratio)
    logo = logo.resize((logo_width, logo_height), Image.LANCZOS)

    # Convert to white on transparent
    data = logo.getdata()
    new_data = []
    for item in data:
        if len(item) == 4:
            r, g, b, a = item
        else:
            r, g, b = item
            a = 255

        # White background to transparent
        if r > 200 and g > 200 and b > 200:
            new_data.append((255, 255, 255, 0))
        # Black to solid white
        elif r < 128 and g < 128 and b < 128:
            new_data.append((255, 255, 255, 255))
        else:
            # Grays proportional
            avg = (r + g + b) // 3
            alpha = 255 - avg
            new_data.append((255, 255, 255, alpha))

    logo.putdata(new_data)

    # Position bottom left
    logo_x = 50
    logo_y = height - logo_height - 40
    img.paste(logo, (logo_x, logo_y), logo)
    print(f"Added logo at ({logo_x}, {logo_y})")

# Save
img.save(social_card_path, quality=95)
print(f"✓ Created professional social card: {social_card_path}")
print(f"  Design discipline: 3 font sizes, 1 color, no wasted space")
