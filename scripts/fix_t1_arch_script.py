from pathlib import Path
p=Path(r"C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental\scripts\t1_architecture_pass_094.py")
s=p.read_text(encoding="utf-8-sig")
s=s.replace('  patchFacade(ctx,b,facadeY,height,tone);"""if old not in s:', '  patchFacade(ctx,b,facadeY,height,tone);"""\nif old not in s:', 1)
p.write_text(s,encoding="utf-8")
print('fixed')