from pathlib import Path
import shutil, zipfile, hashlib, os
src=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental-0.9.5T-final')
cp=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-checkpoints\1.0.0-gold-lock')
zip_path=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-1.0.0-source.zip')
if cp.exists(): shutil.rmtree(cp)
exclude_dirs={'.git','node_modules','dist','checkpoints','.chrome-shot-base-v3','.claude','.vscode'}
exclude_files={'.env'}
def ignore(directory,names):
    rel=Path(directory).relative_to(src)
    ignored=[]
    for n in names:
        if n in exclude_dirs or n in exclude_files:
            ignored.append(n)
        elif n.startswith('patch-') or n.startswith('diagnose-'):
            ignored.append(n)
    return ignored
shutil.copytree(src,cp,ignore=ignore)
# Remove any build/cache remnants that might exist below copied folders.
for pattern in ['**/__pycache__','**/.DS_Store']:
    for p in cp.glob(pattern):
        if p.is_dir(): shutil.rmtree(p,ignore_errors=True)
        else: p.unlink(missing_ok=True)
if zip_path.exists(): zip_path.unlink()
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in cp.rglob('*'):
        if p.is_file(): z.write(p,p.relative_to(cp.parent))
h=hashlib.sha256()
with zip_path.open('rb') as f:
    for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
sha=h.hexdigest()
sha_file=zip_path.with_suffix(zip_path.suffix+'.sha256.txt')
sha_file.write_text(f'{sha}  {zip_path.name}\n',encoding='utf-8')
files=sum(1 for p in cp.rglob('*') if p.is_file())
size=sum(p.stat().st_size for p in cp.rglob('*') if p.is_file())
print(f'CHECKPOINT={cp}')
print(f'FILES={files}')
print(f'CHECKPOINT_BYTES={size}')
print(f'ZIP={zip_path}')
print(f'ZIP_BYTES={zip_path.stat().st_size}')
print(f'SHA256={sha}')
