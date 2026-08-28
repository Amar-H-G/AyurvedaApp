import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def draw_amrutam_logo(size, is_round=False, padding_ratio=0.12):
    # Supersample 4x for extreme anti-aliasing
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Colors
    bg_color = (18, 71, 52, 255)       # Deep Forest Green #124734
    ring_color = (212, 175, 55, 255)    # Warm Gold #D4AF37
    gold_bright = (230, 198, 101, 255) # Bright Gold #E6C665
    leaf_light = (255, 253, 248, 255)  # Off-white Cream #FFFDF8
    emerald = (46, 125, 91, 255)       # Sage Green #2E7D5B

    center = s / 2.0
    radius = (s / 2.0) * (1.0 - padding_ratio)

    # Draw Background
    if is_round:
        draw.ellipse([center - radius, center - radius, center + radius, center + radius], fill=bg_color)
        # Gold accent ring
        ring_width = s * 0.02
        draw.ellipse([center - radius, center - radius, center + radius, center + radius], outline=ring_color, width=int(ring_width))
    else:
        # Rounded Rectangle (Squircle)
        corner_r = s * 0.22
        draw.rounded_rectangle([center - radius, center - radius, center + radius, center + radius], radius=corner_r, fill=bg_color)
        ring_width = s * 0.02
        draw.rounded_rectangle([center - radius, center - radius, center + radius, center + radius], radius=corner_r, outline=ring_color, width=int(ring_width))

    # Center Emblem: Stylized Ayurvedic Lotus Leaf & Wellness Drops
    # Draw central gold healing drop / sun
    drop_r = radius * 0.18
    drop_center_y = center - radius * 0.05
    draw.ellipse([center - drop_r, drop_center_y - drop_r, center + drop_r, drop_center_y + drop_r], fill=gold_bright)

    # Draw 3 symmetrical leaves surrounding the central drop
    # Leaf 1 (Left leaf)
    pts_left = [
        (center - radius * 0.08, drop_center_y + radius * 0.05),
        (center - radius * 0.45, drop_center_y - radius * 0.15),
        (center - radius * 0.35, drop_center_y - radius * 0.45),
        (center - radius * 0.05, drop_center_y - radius * 0.25),
    ]
    draw.polygon(pts_left, fill=leaf_light)

    # Leaf 2 (Right leaf)
    pts_right = [
        (center + radius * 0.08, drop_center_y + radius * 0.05),
        (center + radius * 0.45, drop_center_y - radius * 0.15),
        (center + radius * 0.35, drop_center_y - radius * 0.45),
        (center + radius * 0.05, drop_center_y - radius * 0.25),
    ]
    draw.polygon(pts_right, fill=leaf_light)

    # Leaf 3 (Bottom Lotus Base Petal)
    pts_bottom_l = [
        (center, drop_center_y + radius * 0.48),
        (center - radius * 0.35, drop_center_y + radius * 0.25),
        (center - radius * 0.15, drop_center_y + radius * 0.05),
        (center, drop_center_y + radius * 0.15),
    ]
    draw.polygon(pts_bottom_l, fill=gold_bright)

    pts_bottom_r = [
        (center, drop_center_y + radius * 0.48),
        (center + radius * 0.35, drop_center_y + radius * 0.25),
        (center + radius * 0.15, drop_center_y + radius * 0.05),
        (center, drop_center_y + radius * 0.15),
    ]
    draw.polygon(pts_bottom_r, fill=ring_color)

    # Central Stem / Leaf Vein Line
    draw.line([(center, drop_center_y - radius * 0.50), (center, drop_center_y + radius * 0.45)], fill=emerald, width=int(s * 0.015))

    # Downsample using high quality Lanczos filter
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def draw_splash_logo(width=400, height=400):
    scale = 4
    w, h = width * scale, height * scale
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center_x = w / 2.0
    center_y = h * 0.45

    # Render emblem
    emblem_size = int(w * 0.45)
    logo_sq = draw_amrutam_logo(emblem_size // scale, is_round=True, padding_ratio=0.08)
    logo_sq_scaled = logo_sq.resize((emblem_size, emblem_size), Image.Resampling.LANCZOS)
    img.paste(logo_sq_scaled, (int(center_x - emblem_size / 2), int(center_y - emblem_size / 2)), logo_sq_scaled)

    # Downsample
    final_img = img.resize((width, height), Image.Resampling.LANCZOS)
    return final_img

def main():
    base_res = "d:/Bengalore/Assignment/Task2/AyurvedaApp/android/app/src/main/res"
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    for folder, size in densities.items():
        out_dir = os.path.join(base_res, folder)
        os.makedirs(out_dir, exist_ok=True)
        
        # Square launcher icon
        img_sq = draw_amrutam_logo(size, is_round=False)
        img_sq.save(os.path.join(out_dir, "ic_launcher.png"))
        
        # Round launcher icon
        img_round = draw_amrutam_logo(size, is_round=True)
        img_round.save(os.path.join(out_dir, "ic_launcher_round.png"))
        print(f"Generated {folder} icons ({size}x{size})")

    # Generate Splash Logo asset in drawable
    drawable_dir = os.path.join(base_res, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    splash_logo = draw_splash_logo(380, 380)
    splash_logo.save(os.path.join(drawable_dir, "splash_logo.png"))
    print("Generated drawable/splash_logo.png")

if __name__ == "__main__":
    main()
