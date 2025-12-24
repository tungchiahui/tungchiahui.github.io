#!/usr/bin/env python3
import os
import shutil
import re

SOURCE_DIR = "./content/posts"
BACKUP_DIR = "./content/posts_backup"

def shift_headings(md_text: str) -> str:
    """
    将 Markdown 中的标题整体下移一级
    忽略代码块中的内容
    """
    lines = md_text.splitlines(keepends=True)
    in_code_block = False
    result = []

    for line in lines:
        stripped = line.lstrip()

        # 判断代码块开关
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            result.append(line)
            continue

        if not in_code_block:
            # 匹配 Markdown 标题（行首 1~6 个 #，后面至少一个空格）
            match = re.match(r"(#{1,6})(\s+.*)", line)
            if match:
                hashes, rest = match.groups()
                # 标题等级 +1（不设上限，6 -> 7）
                new_hashes = "#" * (len(hashes) + 1)
                line = new_hashes + rest

        result.append(line)

    return "".join(result)

def main():
    # 创建备份目录
    os.makedirs(BACKUP_DIR, exist_ok=True)

    for filename in os.listdir(SOURCE_DIR):
        if not filename.endswith(".md"):
            continue

        src_path = os.path.join(SOURCE_DIR, filename)
        backup_path = os.path.join(BACKUP_DIR, filename)

        # 备份原文件
        shutil.copy2(src_path, backup_path)

        # 读取并处理
        with open(src_path, "r", encoding="utf-8") as f:
            original = f.read()

        modified = shift_headings(original)

        # 写回原文件
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(modified)

        print(f"✔ 已处理: {filename}（原文件已备份）")

    print("\n🎉 全部 Markdown 标题已下移一级，备份完成。")

if __name__ == "__main__":
    main()
