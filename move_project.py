import os
import shutil

src_dir = 'intel-os'
dest_dir = '.'

for item in os.listdir(src_dir):
    s = os.path.join(src_dir, item)
    d = os.path.join(dest_dir, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.copytree(s, d, dirs_exist_ok=True)
            shutil.rmtree(s)
        else:
            shutil.move(s, d)
    else:
        shutil.move(s, d)

if os.path.exists(src_dir) and not os.listdir(src_dir):
    os.rmdir(src_dir)
