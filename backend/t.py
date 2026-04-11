import os

IGNORE_DIRS = {
    "node_modules", ".git", "__pycache__", "dist", "build", ".next", ".vscode"
}

IGNORE_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".exe", ".dll", ".log", ".lock"
}

def combine_files(root_folder, output_file):
    with open(output_file, 'w', encoding='utf-8') as out:
        for foldername, subfolders, filenames in os.walk(root_folder):

            # skip unwanted folders
            subfolders[:] = [d for d in subfolders if d not in IGNORE_DIRS]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in IGNORE_EXT):
                    continue

                file_path = os.path.join(foldername, filename)

                out.write("\n" + "="*60 + "\n")
                out.write(f"FILE: {file_path}\n")
                out.write("="*60 + "\n")

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        out.write(f.read() + "\n")
                except Exception as e:
                    out.write(f"[Could not read file: {e}]\n")


# usage
combine_files(r"D:\app\CareMind", "output.txt")