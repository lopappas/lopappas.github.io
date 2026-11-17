#!/usr/bin/env python3
"""Bake the original SVG ribbons. Requires Pillow, librsvg 2.46+ and libcairo.
Run from source/: python scripts/render-aurora.py
No browser or rendering library is added to the game runtime.
"""
from ctypes import CDLL, Structure, POINTER, byref, c_char_p, c_double, c_int, c_size_t, c_void_p
from io import BytesIO
import json
from pathlib import Path
import tempfile
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SCALE, PADDING = 4.5, 18  # Covers the 520 CSS-pixel scene at device ratio 3; six blur sigmas.
NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', NS[1:-1])

class Rect(Structure):
    _fields_ = [(field, c_double) for field in ('x', 'y', 'width', 'height')]

rsvg, cairo, gobject = CDLL('librsvg-2.so.2'), CDLL('libcairo.so.2'), CDLL('libgobject-2.0.so.0')
rsvg.rsvg_handle_new_from_data.argtypes = [c_char_p, c_size_t, POINTER(c_void_p)]
rsvg.rsvg_handle_new_from_data.restype = c_void_p
rsvg.rsvg_handle_get_geometry_for_layer.argtypes = [c_void_p, c_char_p, POINTER(Rect), POINTER(Rect), POINTER(Rect), POINTER(c_void_p)]
rsvg.rsvg_handle_get_geometry_for_layer.restype = c_int
rsvg.rsvg_handle_render_document.argtypes = [c_void_p, c_void_p, POINTER(Rect), POINTER(c_void_p)]
rsvg.rsvg_handle_render_document.restype = c_int
cairo.cairo_image_surface_create.argtypes = [c_int, c_int, c_int]
cairo.cairo_image_surface_create.restype = c_void_p
cairo.cairo_create.argtypes = [c_void_p]
cairo.cairo_create.restype = c_void_p
cairo.cairo_surface_write_to_png.argtypes = [c_void_p, c_char_p]
cairo.cairo_surface_write_to_png.restype = c_int
cairo.cairo_destroy.argtypes = [c_void_p]
cairo.cairo_surface_destroy.argtypes = [c_void_p]
gobject.g_object_unref.argtypes = [c_void_p]

def handle(svg):
    data = svg if isinstance(svg, bytes) else svg.encode()
    error = c_void_p()
    result = rsvg.rsvg_handle_new_from_data(data, len(data), byref(error))
    if not result or error.value:
        raise RuntimeError('Could not load SVG')
    return result

def rasterize(svg, width, height):
    document = handle(svg)
    surface = cairo.cairo_image_surface_create(0, width, height)
    context = cairo.cairo_create(surface)
    try:
        error = c_void_p()
        if not rsvg.rsvg_handle_render_document(document, context, byref(Rect(0, 0, width, height)), byref(error)):
            raise RuntimeError('Could not render SVG')
        with tempfile.NamedTemporaryFile(suffix='.png', dir=ROOT) as tmp:
            if cairo.cairo_surface_write_to_png(surface, tmp.name.encode()):
                raise RuntimeError('Could not encode PNG')
            return Image.open(BytesIO(Path(tmp.name).read_bytes())).convert('RGBA')
    finally:
        cairo.cairo_destroy(context)
        cairo.cairo_surface_destroy(surface)
        gobject.g_object_unref(document)

def main():
    source = ROOT / 'art/aurora.svg'
    document = handle(source.read_bytes())
    output = ROOT / 'src/art'
    output.mkdir(exist_ok=True)
    bounds = {}
    try:
        for color in ('red', 'green', 'blue'):
            logical, ink, error = Rect(), Rect(), c_void_p()
            if not rsvg.rsvg_handle_get_geometry_for_layer(document, f'#ribbon-{color}'.encode(), byref(Rect(0, 0, 360, 300)), byref(ink), byref(logical), byref(error)):
                raise RuntimeError(f'Could not measure {color}')
            # Symmetric padding keeps the old fill-box center used by CSS transforms.
            box = {key: getattr(logical, key) + (-PADDING if key in ('x', 'y') else PADDING * 2) for key in ('x', 'y', 'width', 'height')}
            root = ET.fromstring(source.read_bytes())
            ribbons = root.find(NS + 'g')
            for child in list(ribbons):
                if child.get('id') != f'ribbon-{color}':
                    ribbons.remove(child)
            root.set('viewBox', ' '.join(str(box[key]) for key in ('x', 'y', 'width', 'height')))
            root.set('preserveAspectRatio', 'none')
            root.set('width', str(round(box['width'] * SCALE)))
            root.set('height', str(round(box['height'] * SCALE)))
            image = rasterize(ET.tostring(root), round(box['width'] * SCALE), round(box['height'] * SCALE))
            # Lossless WebP retains alpha and smooth color gradients without JPEG halos.
            image.save(output / f'aurora-{color}.webp', lossless=True, method=6)
            bounds[color] = box
            print(f'{color}: {image.width} × {image.height}; {(output / f"aurora-{color}.webp").stat().st_size} bytes')
        (output / 'aurora-bounds.json').write_text(json.dumps(bounds, indent=2) + '\n')
    finally:
        gobject.g_object_unref(document)

if __name__ == '__main__':
    main()
