"""Örnek ürün görsellerini (SVG) üretir: public/urunler/*.svg ve public/kategoriler/*.svg.

Mağaza örnek veriyle çalıştığı için gerçek ürün fotoğrafı yok; her ürün tipine sade,
tutarlı bir çizim üretilir. Çalıştırma: python3 scripts/urun-gorselleri.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public')


def wrap(body, bg='#EEF1F5', w=800, h=800):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{bg}"/><stop offset="1" stop-color="{shade(bg, -10)}"/></linearGradient>
  <radialGradient id="sh" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="{w}" height="{h}" fill="url(#bg)"/>
{body}
</svg>'''


def shade(hex_color, pct):
    h = hex_color.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    f = (100 + pct) / 100
    r, g, b = (max(0, min(255, int(c * f))) for c in (r, g, b))
    return f'#{r:02x}{g:02x}{b:02x}'


def floor(cx=400, cy=680, rx=230, ry=26):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="url(#sh)"/>'


# ---------------------------------------------------------------- çizimler
def case(color, clear=False, magsafe=False, cams=3, wallet=False, tilt=-8):
    body_fill = 'rgba(255,255,255,0.35)' if clear else color
    edge = shade(color, -25) if not clear else '#9fb3c8'
    cam = ''
    if cams == 3:
        cam = f'''<rect x="-118" y="-238" width="128" height="128" rx="30" fill="{shade(color, -18) if not clear else 'rgba(40,50,60,0.18)'}" stroke="{edge}" stroke-width="4"/>
<circle cx="-82" cy="-202" r="24" fill="#1d232b"/><circle cx="-82" cy="-146" r="24" fill="#1d232b"/><circle cx="-26" cy="-174" r="24" fill="#1d232b"/>
<circle cx="-82" cy="-202" r="9" fill="#3b4856"/><circle cx="-82" cy="-146" r="9" fill="#3b4856"/><circle cx="-26" cy="-174" r="9" fill="#3b4856"/>'''
    elif cams == 2:
        cam = f'''<rect x="-118" y="-238" width="70" height="128" rx="30" fill="{shade(color, -18)}" stroke="{edge}" stroke-width="4"/>
<circle cx="-83" cy="-203" r="22" fill="#1d232b"/><circle cx="-83" cy="-145" r="22" fill="#1d232b"/>'''
    ring = '<circle cx="0" cy="20" r="78" fill="none" stroke="#c9d3de" stroke-width="10"/><rect x="-6" y="98" width="12" height="40" fill="#c9d3de"/>' if magsafe else ''
    inner = '<rect x="-128" y="-262" width="256" height="524" rx="44" fill="#2a3138" opacity="0.35"/>' if clear else ''
    flap = ''
    if wallet:
        flap = f'<rect x="-150" y="-50" width="300" height="70" rx="10" fill="{shade(color, -12)}" stroke="{edge}" stroke-width="4"/><circle cx="118" cy="-15" r="12" fill="#c9a36a"/>'
    return f'''{floor()}
<g transform="translate(400 380) rotate({tilt})">
<rect x="-150" y="-285" width="300" height="570" rx="58" fill="{body_fill}" stroke="{edge}" stroke-width="6"/>
{inner}{cam}{ring}{flap}
<rect x="-150" y="-285" width="300" height="570" rx="58" fill="url(#gloss)"/>
<rect x="152" y="-150" width="8" height="70" rx="4" fill="{edge}"/>
</g>'''


def glass(label='9H'):
    return f'''{floor(rx=260)}
<g transform="translate(400 390) rotate(-6)">
<rect x="-160" y="-300" width="320" height="600" rx="56" fill="rgba(210,230,245,0.55)" stroke="#8fb2cc" stroke-width="5"/>
<rect x="-160" y="-300" width="320" height="600" rx="56" fill="url(#gloss)"/>
<rect x="-50" y="-280" width="100" height="22" rx="11" fill="none" stroke="#8fb2cc" stroke-width="4"/>
<path d="M-120 140 L80 -200" stroke="#fff" stroke-width="14" opacity="0.5"/>
</g>
<g transform="translate(560 560)"><rect x="-70" y="-34" width="140" height="68" rx="10" fill="#1f2a36"/><text x="0" y="13" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#fff" text-anchor="middle">{label}</text></g>'''


def lens():
    return f'''{floor(rx=200)}
<g transform="translate(400 400)">
<rect x="-170" y="-170" width="340" height="340" rx="70" fill="rgba(220,235,245,0.5)" stroke="#8fb2cc" stroke-width="6"/>
{''.join(f'<circle cx="{x}" cy="{y}" r="62" fill="#1d232b" stroke="#c9d3de" stroke-width="10"/><circle cx="{x}" cy="{y}" r="22" fill="#3b4856"/>' for x, y in [(-70, -70), (-70, 70), (70, 0)])}
<rect x="-170" y="-170" width="340" height="340" rx="70" fill="url(#gloss)"/>
</g>'''


def adapter(color='#f4f6f8', watt='20W', wide=False):
    w = 230 if wide else 190
    ports = '<rect x="-34" y="-120" width="68" height="20" rx="10" fill="#2a3138"/>' if not wide else '<rect x="-80" y="-130" width="50" height="18" rx="9" fill="#2a3138"/><rect x="-20" y="-130" width="50" height="18" rx="9" fill="#2a3138"/><rect x="40" y="-132" width="50" height="22" rx="4" fill="#2a3138"/>'
    return f'''{floor(rx=180)}
<g transform="translate(400 400) rotate(-10)">
<rect x="-16" y="130" width="14" height="80" rx="4" fill="#b8c2cc"/><rect x="22" y="130" width="14" height="80" rx="4" fill="#b8c2cc"/>
<rect x="{-w / 2}" y="-160" width="{w}" height="300" rx="34" fill="{color}" stroke="{shade(color, -22)}" stroke-width="5"/>
{ports}
<text x="0" y="40" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="{shade(color, -45)}" text-anchor="middle">{watt}</text>
<rect x="{-w / 2}" y="-160" width="{w}" height="300" rx="34" fill="url(#gloss)"/>
</g>'''


def pad(color='#2a3138', ring='#7c9cff'):
    return f'''{floor(rx=240, cy=600)}
<g transform="translate(400 470)">
<ellipse cx="0" cy="30" rx="230" ry="80" fill="{shade(color, -25)}"/>
<ellipse cx="0" cy="0" rx="230" ry="80" fill="{color}"/>
<ellipse cx="0" cy="0" rx="150" ry="50" fill="none" stroke="{ring}" stroke-width="6" opacity="0.8"/>
<ellipse cx="0" cy="0" rx="230" ry="80" fill="url(#gloss)"/>
<path d="M200 40 C 300 60, 330 140, 380 160" stroke="#2a3138" stroke-width="12" fill="none"/>
</g>'''


def stand():
    return f'''{floor(rx=260)}
<g transform="translate(400 420)">
<rect x="-220" y="160" width="440" height="60" rx="30" fill="#2a3138"/>
<rect x="-30" y="-230" width="60" height="400" rx="20" fill="#3a434d"/>
<rect x="-110" y="-280" width="220" height="300" rx="36" fill="#1d232b" stroke="#55606b" stroke-width="5"/>
<circle cx="0" cy="-130" r="60" fill="none" stroke="#7c9cff" stroke-width="6"/>
<rect x="120" y="70" width="90" height="110" rx="26" fill="#3a434d"/><rect x="132" y="82" width="66" height="70" rx="20" fill="#1d232b"/>
<ellipse cx="-150" cy="160" rx="55" ry="14" fill="#7c9cff" opacity="0.6"/>
</g>'''


def cable(color='#2a3138', braided=True, end='c'):
    tex = f'<path d="M210 250 C 120 420, 520 380, 420 560 S 230 640, 300 470" stroke="{shade(color, 25)}" stroke-width="22" stroke-dasharray="8 10" fill="none" opacity="0.6"/>' if braided else ''
    plug2 = '<rect x="-24" y="-60" width="48" height="90" rx="14" fill="#e9edf1" stroke="#b8c2cc" stroke-width="4"/><rect x="-14" y="-90" width="28" height="34" rx="8" fill="#c9d3de"/>' if end == 'c' else '<rect x="-24" y="-60" width="48" height="90" rx="14" fill="#e9edf1" stroke="#b8c2cc" stroke-width="4"/><rect x="-10" y="-92" width="20" height="36" rx="5" fill="#d8dee5"/>'
    return f'''{floor(rx=260)}
<path d="M210 250 C 120 420, 520 380, 420 560 S 230 640, 300 470" stroke="{color}" stroke-width="28" fill="none" stroke-linecap="round"/>
{tex}
<g transform="translate(210 230) rotate(-20)"><rect x="-26" y="-70" width="52" height="100" rx="16" fill="{shade(color, 10)}"/><rect x="-16" y="-100" width="32" height="36" rx="10" fill="#c9d3de"/></g>
<g transform="translate(300 450) rotate(160)">{plug2}</g>'''


def powerbank(color='#2a3138', mag=False, cap='10.000'):
    ring = '<circle cx="0" cy="-20" r="70" fill="none" stroke="#c9d3de" stroke-width="8"/>' if mag else ''
    return f'''{floor(rx=210)}
<g transform="translate(400 400) rotate(-8)">
<rect x="-150" y="-230" width="300" height="440" rx="44" fill="{color}" stroke="{shade(color, -30)}" stroke-width="5"/>
{ring}
<text x="0" y="140" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="{shade(color, 60)}" text-anchor="middle">{cap}</text>
<text x="0" y="178" font-family="Arial, sans-serif" font-size="24" fill="{shade(color, 45)}" text-anchor="middle">mAh</text>
{''.join(f'<circle cx="{x}" cy="-180" r="7" fill="#7be0a0"/>' for x in (-45, -15, 15, 45))}
<rect x="-150" y="-230" width="300" height="440" rx="44" fill="url(#gloss)"/>
</g>'''


def earbuds(color='#f4f6f8'):
    bud = lambda x, r: f'<g transform="translate({x} 120) rotate({r})"><rect x="-26" y="0" width="52" height="150" rx="26" fill="{color}" stroke="{shade(color, -20)}" stroke-width="4"/><ellipse cx="0" cy="0" rx="58" ry="52" fill="{color}" stroke="{shade(color, -20)}" stroke-width="4"/><ellipse cx="-18" cy="-6" rx="22" ry="18" fill="#2a3138"/></g>'
    return f'''{floor(rx=260)}
<g transform="translate(400 330)">
<rect x="-170" y="-110" width="340" height="230" rx="110" fill="{color}" stroke="{shade(color, -20)}" stroke-width="5"/>
<path d="M-170 -10 H170" stroke="{shade(color, -20)}" stroke-width="4"/>
<circle cx="0" cy="40" r="9" fill="#7be0a0"/>
<rect x="-170" y="-110" width="340" height="230" rx="110" fill="url(#gloss)"/>
</g>
{bud(260, -18)}{bud(540, 18)}'''


def wired():
    return f'''{floor(rx=240)}
<path d="M300 260 C 300 420, 400 470, 400 520 C 400 470, 500 420, 500 260" stroke="#f4f6f8" stroke-width="12" fill="none"/>
<path d="M400 520 C 400 600, 360 640, 330 690" stroke="#f4f6f8" stroke-width="12" fill="none"/>
<path d="M300 260 C 300 420, 400 470, 400 520 C 400 470, 500 420, 500 260" stroke="#c9d3de" stroke-width="2" fill="none"/>
<g transform="translate(300 220) rotate(-15)"><ellipse rx="56" ry="50" fill="#f4f6f8" stroke="#c9d3de" stroke-width="4"/><ellipse cx="-14" cy="-4" rx="22" ry="18" fill="#2a3138"/></g>
<g transform="translate(500 220) rotate(15)"><ellipse rx="56" ry="50" fill="#f4f6f8" stroke="#c9d3de" stroke-width="4"/><ellipse cx="14" cy="-4" rx="22" ry="18" fill="#2a3138"/></g>
<rect x="388" y="440" width="24" height="70" rx="10" fill="#e1e6eb"/>
<g transform="translate(330 690) rotate(30)"><rect x="-20" y="-30" width="40" height="70" rx="12" fill="#e9edf1" stroke="#b8c2cc" stroke-width="4"/></g>'''


def vent():
    return f'''{floor(rx=200)}
<g transform="translate(400 400)">
<rect x="-260" y="-140" width="520" height="40" rx="8" fill="#3a434d"/><rect x="-260" y="-80" width="520" height="40" rx="8" fill="#3a434d"/><rect x="-260" y="-20" width="520" height="40" rx="8" fill="#3a434d"/>
<rect x="-30" y="-120" width="60" height="160" rx="12" fill="#1d232b"/>
<circle cx="0" cy="120" r="130" fill="#2a3138" stroke="#55606b" stroke-width="6"/>
<circle cx="0" cy="120" r="80" fill="none" stroke="#c9d3de" stroke-width="8"/>
<circle cx="0" cy="120" r="130" fill="url(#gloss)"/>
</g>'''


def car_charger():
    return f'''{floor(rx=150)}
<g transform="translate(400 400) rotate(-12)">
<rect x="-60" y="-40" width="120" height="260" rx="40" fill="#c9d3de"/>
<rect x="-110" y="-230" width="220" height="210" rx="44" fill="#2a3138"/>
<rect x="-62" y="-170" width="50" height="20" rx="10" fill="#7c9cff"/><rect x="12" y="-174" width="56" height="26" rx="5" fill="#7c9cff"/>
<text x="0" y="-80" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#e9edf1" text-anchor="middle">45W</text>
<rect x="-110" y="-230" width="220" height="210" rx="44" fill="url(#gloss)"/>
</g>'''


def dash():
    return f'''{floor(rx=230)}
<g transform="translate(400 430)">
<ellipse cx="0" cy="190" rx="120" ry="34" fill="#2a3138"/>
<rect x="-18" y="40" width="36" height="150" fill="#3a434d"/>
<rect x="-200" y="-160" width="400" height="210" rx="28" fill="#2a3138"/>
<rect x="-180" y="-140" width="360" height="170" rx="20" fill="#1d232b"/>
<rect x="-215" y="-120" width="30" height="120" rx="10" fill="#55606b"/><rect x="185" y="-120" width="30" height="120" rx="10" fill="#55606b"/>
</g>'''


def band(color):
    return f'''{floor(rx=180)}
<g transform="translate(400 390)">
<rect x="-70" y="-310" width="140" height="250" rx="60" fill="{color}"/>
<rect x="-70" y="60" width="140" height="250" rx="60" fill="{color}"/>
{''.join(f'<circle cx="0" cy="{y}" r="9" fill="{shade(color, -30)}"/>' for y in range(120, 290, 40))}
<rect x="-110" y="-110" width="220" height="230" rx="56" fill="#1d232b" stroke="#55606b" stroke-width="6"/>
<rect x="-90" y="-90" width="180" height="190" rx="40" fill="#0f1418"/>
<text x="0" y="25" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="#e9edf1" text-anchor="middle">10:09</text>
</g>'''


def watch_charger():
    return f'''{floor(rx=200)}
<g transform="translate(400 400)">
<circle cx="-40" cy="-60" r="120" fill="#f4f6f8" stroke="#c9d3de" stroke-width="6"/>
<circle cx="-40" cy="-60" r="70" fill="#e1e6eb"/>
<path d="M30 40 C 120 200, 260 120, 200 300" stroke="#f4f6f8" stroke-width="22" fill="none" stroke-linecap="round"/>
<g transform="translate(200 300) rotate(10)"><rect x="-26" y="0" width="52" height="90" rx="14" fill="#e9edf1" stroke="#b8c2cc" stroke-width="4"/><rect x="-14" y="86" width="28" height="30" rx="8" fill="#c9d3de"/></g>
</g>'''


# ---------------------------------------------------------------- ürünler
# slug: (bg, [çizim1, çizim2])
PRODUCTS = {
    'iphone-15-pro-seffaf-magsafe-kilif': ('#E7EEF6', [case('#dfe7ef', clear=True, magsafe=True), case('#dfe7ef', clear=True, magsafe=True, tilt=6)]),
    'iphone-15-silikon-kilif-gece-mavisi': ('#E6EAF4', [case('#24365c', cams=2), case('#24365c', cams=2, tilt=6)]),
    'galaxy-s24-ultra-darbe-emici-kilif': ('#ECEDEF', [case('#2b2f35'), case('#2b2f35', tilt=6)]),
    'iphone-14-deri-cuzdan-kilif-taba': ('#F4ECE3', [case('#9a5a2c', wallet=True, cams=2), case('#9a5a2c', cams=2, tilt=6)]),
    'redmi-note-13-pro-kamera-korumali-kilif': ('#EEF3EC', [case('#4f6b4a'), case('#4f6b4a', tilt=6)]),
    'iphone-15-pro-max-hayalet-cam': ('#E9EEF3', [glass('Gizlilik'), glass('9H')]),
    'galaxy-s24-kirilmaz-cam-2li': ('#E9EEF3', [glass('2 adet'), glass('9H')]),
    'kamera-lens-koruyucu-seti': ('#ECEFF3', [lens(), lens()]),
    '20w-usb-c-hizli-sarj-adaptoru': ('#EEF0F3', [adapter(), adapter('#2a3138')]),
    '65w-gan-3-portlu-sarj-cihazi': ('#E9EBEF', [adapter('#2a3138', '65W', wide=True), adapter('#2a3138', '65W', wide=True)]),
    '15w-magsafe-uyumlu-kablosuz-sarj': ('#E8ECF4', [pad(), pad('#f4f6f8', '#7c9cff')]),
    '3u-1-arada-kablosuz-sarj-istasyonu': ('#E8EBF2', [stand(), stand()]),
    'usb-c-usb-c-orgu-kablo-1m-60w': ('#EEF0F3', [cable('#2a3138'), cable('#2a3138')]),
    'usb-c-lightning-kablo-2m': ('#F1F2F4', [cable('#e9edf1', braided=False, end='l'), cable('#e9edf1', braided=False, end='l')]),
    '240w-usb-c-kablo-2m': ('#ECEEF4', [cable('#3a4a8c'), cable('#3a4a8c')]),
    '10000-mah-magsafe-powerbank': ('#ECEEF2', [powerbank('#e9edf1', mag=True), powerbank('#e9edf1', mag=True)]),
    '20000-mah-22-5w-powerbank': ('#E8EAEE', [powerbank('#2a3138', cap='20.000'), powerbank('#2a3138', cap='20.000')]),
    'kablosuz-kulak-ici-kulaklik-anc': ('#ECEEF3', [earbuds(), earbuds('#2a3138')]),
    'usb-c-kablolu-kulaklik': ('#EFF1F4', [wired(), wired()]),
    'havalandirma-miknatisli-arac-tutucu': ('#E9EBEE', [vent(), vent()]),
    'arac-ici-45w-cift-port-sarj': ('#E9EBEF', [car_charger(), car_charger()]),
    'torpido-vantuzlu-telefon-tutucu': ('#ECEDEF', [dash(), dash()]),
    'apple-watch-silikon-kayis-45mm': ('#F3EDE8', [band('#c46a4a'), band('#3d5a80')]),
    'akilli-saat-sarj-kablosu-usb-c': ('#EFF1F4', [watch_charger(), watch_charger()]),
}

CATEGORIES = {
    'telefon-kiliflari': ('#E6EAF4', case('#24365c', cams=2)),
    'ekran-koruyucular': ('#E9EEF3', glass('9H')),
    'sarj-cihazlari': ('#EEF0F3', adapter()),
    'kablolar': ('#EEF0F3', cable('#2a3138')),
    'powerbank': ('#ECEEF2', powerbank('#e9edf1', mag=True)),
    'kulakliklar': ('#ECEEF3', earbuds()),
    'arac-aksesuarlari': ('#E9EBEE', vent()),
    'akilli-saat-aksesuarlari': ('#F3EDE8', band('#c46a4a')),
}


# ---------------------------------------------------------------- kapak ve logo
def scene(parts, bg1, bg2):
    """1600x900 kapak: solda metin için boşluk, sağda ölçeklenmiş ürün çizimleri."""
    body = ''.join(f'<g transform="translate({x} {y}) scale({k})">{d}</g>' for d, x, y, k in parts)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
<defs>
  <linearGradient id="kbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>
  <radialGradient id="glow" cx="0.72" cy="0.5" r="0.5"><stop offset="0" stop-color="#C8F25C" stop-opacity="0.22"/><stop offset="1" stop-color="#C8F25C" stop-opacity="0"/></radialGradient>
  <radialGradient id="sh" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1600" height="900" fill="url(#kbg)"/>
<rect width="1600" height="900" fill="url(#glow)"/>
{body}
</svg>'''


KAPAKLAR = {
    'kapak-1': scene([(case('#24365c', cams=2), 640, 140, 0.8), (case('#dfe7ef', clear=True, magsafe=True, tilt=8), 860, 100, 0.85), (case('#c46a4a', cams=2, tilt=14), 1080, 160, 0.78)], '#0E1726', '#1F3A5F'),
    'kapak-2': scene([(adapter('#f4f6f8', '20W'), 660, 200, 0.75), (stand(), 900, 110, 0.9), (cable('#C8F25C'), 1150, 330, 0.6)], '#111418', '#24303F'),
    'kapak-3': scene([(powerbank('#e9edf1', mag=True), 760, 130, 0.85), (adapter('#2a3138', '65W', wide=True), 1020, 170, 0.8)], '#1A1F14', '#2F3B22'),
}

# Kelime işareti: harfler çizgiyle çizilir (SVG yazı tipine bağlı kalmasın)
def logo(ink):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" width="330" height="110">
<rect x="0" y="5" width="100" height="100" rx="24" fill="#C8F25C"/>
<rect x="31" y="22" width="38" height="66" rx="9" fill="none" stroke="#111418" stroke-width="7"/>
<path d="M53 35 L42 56 H52 L46 75 L60 50 H50 Z" fill="#111418"/>
<g fill="none" stroke="{ink}" stroke-width="15" stroke-linecap="butt" stroke-linejoin="miter">
  <path d="M128 22 V64 A21 21 0 0 0 170 64 V22"/>
  <path d="M196 22 V93 M196 29.5 H220 A13 13 0 0 1 220 55.5 H196 M196 55.5 H223 A15 15 0 0 1 223 85.5 H196"/>
  <path d="M296 29.5 H259 V85.5 H296 M259 57 H290"/>
  <path d="M315 22 V93"/>
</g>
</svg>'''


if __name__ == '__main__':
    os.makedirs(os.path.join(OUT, 'urunler'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'kategoriler'), exist_ok=True)
    for slug, (bg, drawings) in PRODUCTS.items():
        for i, d in enumerate(drawings, 1):
            # ikinci görsel farklı zeminle (ürün sayfası galerisinde ayırt edilsin)
            with open(os.path.join(OUT, 'urunler', f'{slug}-{i}.svg'), 'w') as f:
                f.write(wrap(d, bg if i == 1 else shade(bg, -4)))
    for slug, (bg, d) in CATEGORIES.items():
        with open(os.path.join(OUT, 'kategoriler', f'{slug}.svg'), 'w') as f:
            f.write(wrap(d, bg))
    os.makedirs(os.path.join(OUT, 'kapak'), exist_ok=True)
    for name, svg in KAPAKLAR.items():
        with open(os.path.join(OUT, 'kapak', f'{name}.svg'), 'w') as f:
            f.write(svg)
    os.makedirs(os.path.join(OUT, 'marka'), exist_ok=True)
    for name, ink in (('logo-koyu', '#111418'), ('logo-acik', '#FFFFFF')):
        with open(os.path.join(OUT, 'marka', f'{name}.svg'), 'w') as f:
            f.write(logo(ink))
    print(len(PRODUCTS), 'ürün,', len(CATEGORIES), 'kategori görseli yazıldı')
