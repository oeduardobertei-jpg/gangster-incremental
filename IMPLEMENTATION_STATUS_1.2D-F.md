# Gangster Incremental 1.2D–1.2F — T1 Rebuild

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `5770871` (1.2B–C).

## 1.2D — Circulação / Topografia Orgânica

- O eixo central deixou de parecer avenida radial planejada e passou a funcionar como espinha irregular de morro.
- Vielas laterais ficaram assimétricas, com largura variável e trajetórias menos geométricas.
- Foram adicionados cortes pedonais, escadarias, áreas de desgaste, drenagem e patamares visuais.
- A alteração é visual; os corredores físicos/colliders continuam sendo a fonte canônica de gameplay.

## 1.2E — Cor, Natureza e Luz de Rua

- Paleta urbana ganhou mais variação controlada de tijolo, concreto pintado, metal, verde e tons quentes.
- Vegetação ampliada com bananeiras, trepadeiras, arbustos e massas de encosta.
- Postes ganharam campos de luz quente estáticos/cacheáveis.
- O bairro continua legível para combate; a vegetação não cria obstáculos invisíveis.

## 1.2F — NPCs 2.0

- Em modo de detalhe completo, infantaria passou do sprite blocado 3/4 para o renderer anatômico/vetorial já existente no projeto.
- Silhueta agora expõe pernas, tronco, cabeça, roupas, acessórios, postura e armas próprias por classe/variante.
- Escala visual aumentada sem alterar hitbox.
- Cor de facção virou detalhe têxtil/armband + grounding no chão, em vez de pintar o personagem inteiro.
- `batedor_moto` mantém renderer específico existente.
- Em batalhas densas (60+ unidades, zoom não próximo), o LOD barato continua assumindo automaticamente.

## Validação

- `npm run check`: PASS.
- `acceptance-051-world.mjs`: 20/20 PASS.
- `acceptance-056c-combat.mjs`: 10/10 PASS.
- `acceptance-110d-faction-mass.mjs`: 11/11 PASS.
- `acceptance-110j-performance.mjs`: 16/16 PASS após retry limpo.
- `solidWorldViolations = 0`.
- Massa de 68 entidades: T5 ~52 FPS; T6 ~59 FPS no retry limpo.

## Capturas preservadas

- `rebuild-i.png`: circulação orgânica.
- `rebuild-j.png`: cor/natureza/luz.
- `rebuild-m.png`: NPCs 2.0 ajustados.

Revisão visual: `1.2f-t1-world-and-infantry-v1`.
