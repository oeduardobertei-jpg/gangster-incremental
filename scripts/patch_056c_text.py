from pathlib import Path
p=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.5.5-beauty-pass\gangster-incremental\src\components\GameCanvas.tsx')
s=p.read_text(encoding='utf-8')
old="""  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {\n    if (!showDamageNumbersRef.current) return;\n    floatingTextsRef.current.push({"""
new="""  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {\n    if (!showDamageNumbersRef.current) return;\n    // 0.5.6C: zero-damage and dense repeated numbers add noise but no information.\n    if (/^-0(?:\\D|$)/.test(text)) return;\n    const numericDamage = /^-\\d/.test(text);\n    if (numericDamage && floatingTextsRef.current.length > 80 && Math.random() < .55) return;\n    floatingTextsRef.current.push({"""
if old not in s: raise SystemExit('floating text block not found')
s=s.replace(old,new)
p.write_text(s,encoding='utf-8')
print('056C_TEXT_CLARITY_OK')