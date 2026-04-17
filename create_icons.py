#!/usr/bin/env python3
"""
Create PWA icons for AgriTech app
Generates simple SVG-based icons in required sizes
"""

import os
from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO

def create_icon(size):
    """Create a simple icon for the given size"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create a green background circle
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin], 
                 fill=(76, 175, 80, 255))  # Green color
    
    # Draw a simple plant/leaf symbol
    center = size // 2
    leaf_size = size // 3
    
    # Draw a simple leaf shape
    leaf_points = [
        (center, center - leaf_size),  # Top
        (center - leaf_size//2, center),  # Left
        (center, center + leaf_size//2),  # Bottom
        (center + leaf_size//2, center),  # Right
        (center, center - leaf_size),  # Back to top
    ]
    
    draw.polygon(leaf_points, fill=(255, 255, 255, 230))  # Semi-transparent white
    
    # Add a small text "AT" for AgriTech
    try:
        # Try to use a simple font
        font_size = max(8, size // 8)
        font = ImageFont.load_default()
    except:
        font = None
    
    if font:
        text = "AT"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = center - text_width // 2
        text_y = center + leaf_size // 2 + 5
        draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    return img

def create_all_icons():
    """Create all required icon sizes"""
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    icons_dir = os.path.join(os.path.dirname(__file__), 'public', 'icons')
    
    # Ensure icons directory exists
    os.makedirs(icons_dir, exist_ok=True)
    
    for size in sizes:
        icon = create_icon(size)
        icon_path = os.path.join(icons_dir, f'icon-{size}x{size}.png')
        icon.save(icon_path, 'PNG')
        print(f"Created icon: {icon_path}")
    
    print(f"All {len(sizes)} icons created successfully!")

if __name__ == "__main__":
    create_all_icons()
