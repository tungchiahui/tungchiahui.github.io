import os
from PIL import Image

# 支持的图片格式
IMAGE_EXTS = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif')

def main():
    # 当前脚本所在目录
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # 输出目录
    output_dir = os.path.join(base_dir, 'webp')
    os.makedirs(output_dir, exist_ok=True)

    for filename in os.listdir(base_dir):
        if not filename.lower().endswith(IMAGE_EXTS):
            continue

        src_path = os.path.join(base_dir, filename)
        name, _ = os.path.splitext(filename)
        dst_path = os.path.join(output_dir, name + '.webp')

        try:
            with Image.open(src_path) as img:
                # 转换为 RGB，避免某些 PNG / P 模式报错
                img = img.convert('RGB')
                img.save(dst_path, 'WEBP', quality=90)
                print(f'✔ 已转换: {filename} -> webp/{name}.webp')
        except Exception as e:
            print(f'✘ 转换失败: {filename}, 错误: {e}')

if __name__ == '__main__':
    main()
