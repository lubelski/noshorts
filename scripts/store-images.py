# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow==12.3.0"]
# ///
"""Generate store images from the supplied 3140x2424 capture; never save its original.
Usage: uv run --no-project scripts/store-images.py /path/to/capture.png
The coordinate map is specific to this capture. Outputs intentionally anonymize
content and are labeled accordingly; the diagram is not a product screenshot.
"""
from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'store/screenshots'
OUT.mkdir(parents=True, exist_ok=True)
CREAM = '#fff5e5'
INK = '#253d3b'
TEAL = '#287f82'
MUTED = '#62736e'
FONT = Path('/System/Library/Fonts/Supplemental')

def font(size, bold=False):
    return ImageFont.truetype(str(FONT / ('Arial Bold.ttf' if bold else 'Arial.ttf')), size)

def label(d, xy, text, size=20, fill=INK, bold=False):
    d.text(xy, text, font=font(size, bold), fill=fill)

def card(d, box, index):
    x, y, right, bottom = box
    colors = [('#305f66', '#91c4bf'), ('#675c80', '#c5b6d9'), ('#826443', '#ddc197')]
    bg, fg = colors[index % 3]
    d.rounded_rectangle(box, radius=16, fill=bg)
    # Deliberately abstract artwork, not a fabricated video still.
    d.ellipse((x+45, y+40, x+170, y+165), fill=fg)
    d.polygon([(x+180,bottom-35),(x+290,y+65),(right-35,bottom-35)], fill=fg)
    d.rounded_rectangle((x+38,bottom-58,x+145,bottom-43), radius=7, fill=fg)

with Image.open(sys.argv[1]) as original:
    if original.size != (3140, 2424):
        raise ValueError('This anonymization map requires the original 3140x2424 capture.')
    print(f'Input: {original.format}, {original.size}, {original.mode}')
    capture = ImageOps.exif_transpose(original).convert('RGB').resize((2000,1544), Image.Resampling.LANCZOS)
d = ImageDraw.Draw(capture)
# Sidebar channel identities (retain actual navigation above and below).
d.rectangle((88,335,350,689), fill='#0f0f0f')
for i, name in enumerate(['Design studio','Weekend builds','Science notes','Listening room','Made by hand','Outside today','Something new']):
    y = 354 + i*51
    d.ellipse((102,y-15,132,y+15), fill=['#709d9a','#afa0c0','#c7aa7d'][i%3])
    label(d,(163,y-11),name,19,'#eeeeee')
    d.ellipse((318,y-2,323,y+3),fill='#3ea6ff')
# Remove account identity while retaining the rest of the real masthead.
d.rectangle((1839,168,1910,235), fill='#0f0f0f')
d.ellipse((1860,177,1898,215),fill='#627b79')
# Replace every content identity in the two visible rows, not just thumbnails.
titles = ['A new perspective','Making something useful','An idea worth exploring',
          'A closer look','The weekend project','Small discoveries']
channels = ['Design studio','Made by hand','Everyday science','Outside today','Weekend projects','Something new']
for row, y in enumerate([347,760]):
    for col, x in enumerate([407,911,1415]):
        i=row*3+col
        d.rectangle((x-8,y,x+484,y+385),fill='#0f0f0f')
        card(d,(x,y,x+483,y+272),i)
        d.ellipse((x,y+290,x+39,y+329),fill=['#709d9a','#afa0c0','#c7aa7d'][col])
        label(d,(x+55,y+288),titles[i],24,'#f1f1f1',True)
        label(d,(x+55,y+326),channels[i],20,'#aaaaaa')
        label(d,(x+55,y+355),f'{i+1} hours ago',18,'#aaaaaa')
        for dy in [-5,0,5]:
            d.ellipse((x+474,y+299+dy,x+477,y+302+dy),fill='#dddddd')
# Browser chrome and third row excluded entirely.
viewport = capture.crop((72,160,1928,1150)).resize((1152,614),Image.Resampling.LANCZOS)
canvas = Image.new('RGB',(1280,800),CREAM)
d = ImageDraw.Draw(canvas)
label(d,(64,27),'NoShorts',20,TEAL,True)
label(d,(64,59),'Your subscriptions. Minus the distractions.',42,INK,True)
label(d,(64,111),'No Shorts. No Home detour. No “Most relevant” shelf.',20,MUTED)
canvas.paste(viewport,(64,156))
label(d,(64,778),'Actual layout • Example content; channel and video details anonymized.',12,MUTED)
canvas.save(OUT/'01-subscriptions.png')

canvas = Image.new('RGB',(1280,800),CREAM)
d = ImageDraw.Draw(canvas)
label(d,(64,30),'NoShorts',20,TEAL,True)
label(d,(64,70),'Less noise. Straight to what you follow.',43,INK,True)
label(d,(64,128),'A small extension. Three deliberate changes.',22,MUTED)

# Diagram: clearly an illustration, not another claimed screenshot.
for x, title, after in [(64,'Before',False),(686,'With NoShorts',True)]:
    label(d,(x,200),title,25,TEAL if after else MUTED,True)
    d.rounded_rectangle((x,246,x+530,605),radius=22,fill='#ffffff',outline='#deded3',width=2)
    d.rounded_rectangle((x+22,268,x+508,309),radius=10,fill='#edf0e9')
    label(d,(x+38,278),'Subscriptions' if after else 'Home',18,INK,True)
    if not after:
        for j, text in enumerate(['Shorts','Most relevant','Latest subscriptions']):
            yy=333+j*82
            d.rounded_rectangle((x+22,yy,x+508,yy+64),radius=12,fill='#f4e4da' if j<2 else '#edf0e9')
            label(d,(x+40,yy+21),text,19,INK)
    else:
        label(d,(x+24,330),'Latest subscriptions',19,INK,True)
        for row in range(2):
            for col in range(3):
                xx=x+24+col*164
                yy=369+row*107
                d.rounded_rectangle((xx,yy,xx+151,yy+77),radius=9,fill=['#91b7b3','#bdb0cd','#cfb991'][col])
                d.rounded_rectangle((xx,yy+85,xx+118,yy+90),radius=2,fill='#b8c2bd')
# Direction indicator.
d.line((610,425,666,425),fill=TEAL,width=5)
d.polygon([(666,425),(651,415),(651,435)],fill=TEAL)
for x, number, title, detail in [(64,'01','Skip the Shorts','Shelves and sidebar entries hidden.'),(466,'02','Start with subscriptions','Home takes you straight there.'),(868,'03','Keep it chronological','“Most relevant” shelf removed.')]:
    label(d,(x,646),number,18,TEAL,True)
    label(d,(x,677),title,22,INK,True)
    label(d,(x,712),detail,17,MUTED)
label(d,(64,771),'Illustrative comparison • Simplified layout, not a product screenshot.',13,MUTED)
canvas.save(OUT/'02-how-it-works.png')
for path in sorted(OUT.glob('*.png')):
    with Image.open(path) as im:
        assert im.size == (1280,800) and im.mode == 'RGB'
        print(f'{path.name}: {im.size}, {im.mode}, {path.stat().st_size:,} bytes')
