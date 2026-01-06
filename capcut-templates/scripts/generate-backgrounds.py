"""
Background Generator for CapCut Templates
Generates gradient and solid backgrounds for video production
"""

from PIL import Image, ImageDraw
import os

# Configuration
OUTPUT_DIR = "../assets/backgrounds"
WIDTH = 1920
HEIGHT = 1080

def create_gradient(colors, name):
    """Create a gradient image with specified colors"""
    image = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(image)
    
    # Calculate gradient steps
    steps = HEIGHT
    num_segments = len(colors) - 1
    segment_height = HEIGHT // num_segments
    
    for segment in range(num_segments):
        start_color = hex_to_rgb(colors[segment])
        end_color = hex_to_rgb(colors[segment + 1])
        
        for i in range(segment_height):
            y = segment * segment_height + i
            if y >= HEIGHT:
                break
            
            # Calculate color interpolation
            ratio = i / segment_height
            r = int(start_color[0] + (end_color[0] - start_color[0]) * ratio)
            g = int(start_color[1] + (end_color[1] - start_color[1]) * ratio)
            b = int(start_color[2] + (end_color[2] - start_color[2]) * ratio)
            
            draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
    
    # Save the image
    output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
    image.save(output_path, "PNG")
    print(f"✓ Created: {output_path}")
    return output_path

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_solid(color, name):
    """Create a solid color background"""
    image = Image.new('RGB', (WIDTH, HEIGHT), hex_to_rgb(color))
    output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
    image.save(output_path, "PNG")
    print(f"✓ Created: {output_path}")
    return output_path

def main():
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("🎨 Generating backgrounds for CapCut templates...")
    print(f"📁 Output directory: {OUTPUT_DIR}")
    print(f"📐 Resolution: {WIDTH}x{HEIGHT}\n")
    
    # 1. Blue → Indigo gradient
    create_gradient(
        colors=['#2563eb', '#4338ca'],
        name='gradient-blue-indigo'
    )
    
    # 2. Blue → Indigo → Purple gradient
    create_gradient(
        colors=['#1e3a8a', '#3730a3', '#5b21b6'],
        name='gradient-blue-indigo-purple'
    )
    
    # 3. Solid White
    create_solid('#ffffff', 'solid-white')
    
    # 4. Solid Blue (bonus)
    create_solid('#2563eb', 'solid-blue')
    
    # 5. Solid Indigo (bonus)
    create_solid('#4338ca', 'solid-indigo')
    
    # 6. Dark gradient for contrast (bonus)
    create_gradient(
        colors=['#1e293b', '#0f172a'],
        name='gradient-dark-slate'
    )
    
    print("\n✅ Background generation complete!")
    print("\n📋 Next steps:")
    print("1. Review backgrounds in: capcut-templates/assets/backgrounds/")
    print("2. Import into CapCut Desktop")
    print("3. Use in your video templates")

if __name__ == "__main__":
    main()
