# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow==12.3.0"]
# ///
"""Render the Chrome Web Store small promo tile as an RGB (no alpha) PNG."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
scale = 3
im = Image.new('RGB', (440*scale, 280*scale), '#fff5e5')
d = ImageDraw.Draw(im)
def text(x, y, value, size, color, bold=False):
    name = 'Arial Bold.ttf' if bold else 'Arial.ttf'
    font = ImageFont.truetype('/System/Library/Fonts/Supplemental/' + name, size*scale)
    d.text((x*scale,y*scale),value,font=font,fill=color)
def rect(box, color, radius=0):
    d.rounded_rectangle(tuple(int(v*scale) for v in box),radius=radius*scale,fill=color)
text(28,24,'NoShorts',43,'#253d3b',True)
text(30,81,'Your subscriptions.',22,'#253d3b',True)
text(30,109,'Minus the distractions.',22,'#253d3b',True)
# An abstract chronological video feed: no invented application controls.
for i, color in enumerate(['#91b7b3','#bdb0cd','#cfb991']):
    x=30+i*130
    rect((x,155,x+120,220),color,8)
    d.polygon([(int((x+49)*scale),174*scale),(int((x+49)*scale),202*scale),(int((x+74)*scale),188*scale)],fill='#fff5e5')
text(30,241,'Less scrolling. More watching.',18,'#287f82',True)
im = im.resize((440,280),Image.Resampling.LANCZOS)
out=root/'store/promo/small-promo-440x280.png'
out.parent.mkdir(parents=True,exist_ok=True)
im.save(out)
with Image.open(out) as check:
    assert check.size == (440,280) and check.mode == 'RGB'
    assert 'transparency' not in check.info
    print(f'{out}: {check.size}, {check.mode}, no alpha')
