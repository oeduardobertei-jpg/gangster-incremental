from pathlib import Path
p=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental\src\data\territoryAtmospheres.ts')
s=p.read_text(encoding='utf-8')
old="""  1: {
    ambientLight: 'rgba(20,25,35,.50)',
    shadowStrength: .60,
    hazeAmount: .30,
    particleDensity: .20,
    buildingTint: 'rgba(255,255,255,0)',
    streetTint: 'rgba(255,255,255,0)'
  },"""
new="""  1: {
    // 0.9.5M: base fria controlada; calor vem das luzes práticas e do comércio.
    ambientLight: 'rgba(16,23,32,.56)',
    shadowStrength: .66,
    hazeAmount: .26,
    particleDensity: .16,
    buildingTint: 'rgba(255,176,108,.012)',
    streetTint: 'rgba(18,32,39,.08)'
  },"""
if old not in s: raise SystemExit('T1 atmosphere profile anchor missing')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('095M-final-grade-ok')
