from PIL import Image

src = "/Users/i.abid/Desktop/Money Apps/kingdom-alliance website/Website logo/Websitelogo.jpeg"
img = Image.open(src).convert("RGB")

tw, th = 1200, 630
# Scale so width fills 1200 (height will be 800)
resized = img.resize((tw, int(tw * img.height / img.width)), Image.LANCZOS)
print("Resized:", resized.size)

# Center-crop height to 630
top = (resized.height - th) // 2
cropped = resized.crop((0, top, tw, top + th))
print("Cropped:", cropped.size)

out = "/Users/i.abid/Desktop/Money Apps/kingdom-alliance website/public/images/og-banner.png"
cropped.save(out, "PNG")
print("Saved:", out)