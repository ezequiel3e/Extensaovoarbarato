import os
from PIL import Image
import cairosvg

# Tamanhos dos ícones necessários
sizes = [16, 48, 128]

# Converte SVG para PNG em diferentes tamanhos
for size in sizes:
    output_png = f'icons/icon{size}.png'
    cairosvg.svg2png(
        url='icons/icon.svg',
        write_to=output_png,
        output_width=size,
        output_height=size
    ) 