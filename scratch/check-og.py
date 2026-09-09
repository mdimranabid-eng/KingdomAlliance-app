from PIL import Image

path = "/Users/i.abid/Desktop/Money Apps/kingdom-alliance website/public/images/og-banner.png"
img = Image.open(path)
print(f"Size: {img.size}")

# Check top row, middle row, bottom row - various x positions
for y in [0, 315, 629]:
    for x in [0, 600, 1199]:
        p = img.getpixel((x, y))
        print(f"  ({x}, {y}) -> RGB{p}")

# Center area
print("Center area:")
for x in [500, 600, 700]:
    for y in [250, 315, 380]:
        p = img.getpixel((x, y))
        print(f"  ({x}, {y}) -> RGB{p}")

# Check unique colors
colors = set()
for x in range(0, 1200, 25):
    for y in range(0, 630, 25):
        colors.add(img.getpixel((x, y)))
print(f"Unique colors: {len(colors)}")
if len(colors) <= 5:
    print("WARNING: Nearly solid color!")

# Check if there's actual content by looking at pixel variance
# in the logo position area (center ~400-800px width, center ~200-430px height)
logo_center_colors = set()
for x in range(400, 800):
    for y in range(200, 430):
        logo_center_colors.add(img.getpixel((x, y)))
print(f"Logo area unique colors: {len(logo_center_colors)}")