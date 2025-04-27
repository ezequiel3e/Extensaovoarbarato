from PIL import Image
import os

# Verificar se a pasta icons existe, se não, criar
if not os.path.exists('icons'):
    os.makedirs('icons')

# Tamanhos dos ícones necessários
sizes = [16, 32, 48, 128]

# Caminho para o arquivo de origem
source_image_path = 'icons/aviao.png'

# Função para redimensionar a imagem
def resize_image(input_path, output_path, size):
    try:
        with Image.open(input_path) as img:
            # Redimensionar a imagem mantendo a proporção
            img = img.resize((size, size), Image.LANCZOS)
            # Salvar a imagem redimensionada
            img.save(output_path)
            return True
    except Exception as e:
        print(f"Erro ao processar a imagem: {e}")
        return False

# Redimensionar a imagem para os diferentes tamanhos
try:
    if not os.path.exists(source_image_path):
        print(f"Arquivo de origem não encontrado: {source_image_path}")
    else:
        for size in sizes:
            output_path = f'icons/icon{size}.png'
            if resize_image(source_image_path, output_path, size):
                print(f"Ícone {size}x{size} gerado: {output_path}")
            
        print("Todos os ícones foram gerados com sucesso!")
except Exception as e:
    print(f"Erro ao gerar ícones: {e}")