# DOCUMENTO DE DESIGN DE JOGO (GDD)
# GUERRA DE FACÇÕES: DOMÍNIO URBANO INCREMENTAL (PT-BR)
*Adaptação Tática Urbana do Mecanismo Incremancer com Foco em Gangues e Facções Rivais*

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Resumo Executivo
**Guerra de Facções PT-BR** é um jogo incremental / RPG tático de gerenciamento de gangues e territórios urbanos. O jogador assume o posto de Comandante Geral de uma facção emblemática (escolhendo entre **Comando Vermelho / Falange Rubra** ou **Primeiro Comando da Capital / Cartel Azul**) em disputa territorial direta pelo controle de pontos estratégicos, vielas de favela, avenidas comerciais e quartéis-generais de facções rivais.

A mecânica de simulação 2D em tempo real substitui a necromancia por **táticas de guerrilha urbana**: cada soldado rival abatido no tiroteio cai no solo e pode ser **cooptado / recrutado** para o seu bonde através de ordens de rádio, além de fornecer dinheiro sujo, caixas de munição, respeito das ruas e contatos com informantes.

### 1.2 Pilares de Design
1. **Satisfação de Tomada de Território em Tempo Real**: Cada beco conquistado reflete o avanço físico dos seus soldados armados contra as barricadas inimigas.
2. **Ciclo de Conversão de Rivais**: O clássico loop de "reanimar cadáveres" foi convertido em "cooptar vira-casacas" caídos nas vielas, montando um bonde cada vez mais pesado.
3. **Escalação Exponencial & Proclamação de Hegemonia**: Economia multicamada em Grana Suja ($), Munição, Respeito Moral, Contatos Chave e Emblemas de Hegemonia (Prestígio).
4. **Customização & Modularidade**: Código limpo e desacoplado em React/TypeScript, preparado para novas facções, viaturas, armas pesadas e disputas multiplayer.

---

## 2. O LOOP PRINCIPAL DE GAMEPLAY (CORE LOOP)

```
[Spawn de Soldados Rivais no Território] 
       │
       ▼
[Tiroteio: Seu Bonde avança / Comandante dá Ordens de Sniper e Rádio]
       │
       ├─► [Rival Cai Ferido no Chão] ──► Fica Vulnerável por Tempo Limitado
       │                                  ├─► Deixa Grana Suja ($) e Munição
       │                                  └─► Cooptado/Recrutado para seu Bonde
       │
       ▼
[Coleta de Recursos: Grana, Munição, Respeito, Contatos]
       │
       ▼
[Compra de Upgrades nas 4 Oficinas do Sindicato]
       │
       ├─► Arsenal & Balística (Coletes, Calibres, Motos, Saúde)
       ├─► Bocas & Pontos de Apoio (Barricadas, Limite de Tropa, Fuzileiros)
       ├─► Rádios & Inteligência (Recuperação de Rádio, Dano de Sniper)
       └─► Conexões & Sindicato (Auto-Recrutamento, Drones, Lavagem)
       │
       ▼
[Domínio do Ponto / Neutralização do Chefe Rival da Área]
       │
       ▼
[Avanço para Território Mais Difícil OU Proclamação de Hegemonia]
       │
       └─► Ganho de Emblemas de Hegemonia ──► Vantagens Permanentes do Cartel
```

---

## 3. SISTEMA DE RECURSOS E ECONOMIA URBANA

| Recurso | Ícone / Cor | Origem Principal | Utilidade Primária |
| :--- | :--- | :--- | :--- |
| **Rádio / Inteligência** | 📻 Azul Celeste | Frequência de rádio recuperada com o tempo | Ordens ativas (Recrutar, Tiro de Sniper, Fumaça, RPG) |
| **Grana Suja ($)** | 💵 Verde Esmeralda | Malotes recolhidos de rivais neutralizados | Compra de coletes, calibres e motos no Arsenal |
| **Munição (Caixas)** | 🎯 Âmbar Dourado | Apreensão de caixas de fuzil e armas caídas | Fortificação de bocas, barricadas e limite de soldados |
| **Respeito das Ruas** | 🎖️ Roxo Moral | Reconhecimento imediato por dominar a área | Melhoria de centrais de rádio e precisão de snipers |
| **Contatos Chave** | 📱 Rosa Pálido | Interrogatório de gerentes de boca e chefes | Automação do sindicato (Auto-Recrutar, Vigilância) |
| **Emblemas de Hegemonia**| 🛡️ Ouro / Titânio | Proclamação da Hegemonia (Prestígio) | Vantagens eternas que persistem entre reinícios de mapa |

---

## 4. AGENTES DA SIMULAÇÃO: RIVAIS E SOLDADOS DA SUA FACÇÃO

### 4.1 Tropas da Facção Rival (Invasores / Defensores)
1. **Olheiro Desarmado (Fogueteiro)**:
   - *Comportamento*: Foge velozmente pelas esquinas quando seu bonde se aproxima.
   - *Atributos*: HP Baixo (35), Dano 4, Velocidade Alta.
   - *Recompensa*: Malote rápido de Grana, 1 recruta fácil.
2. **Soldado Pistoleiro**:
   - *Comportamento*: Patrulha em duplas e atira com pistola semi-automática 9mm.
   - *Atributos*: HP Médio (75), Dano 12, Alcance 110px.
   - *Recompensa*: Grana, Caixas de Munição.
3. **Fuzileiro de Laje (AR-15 / Fal)**:
   - *Comportamento*: Mantém distância protegida atrás de muretas e dispara rajadas pesadas.
   - *Atributos*: HP Frágil (55), Dano Alto (18), Alcance 180px.
   - *Recompensa*: Armas pesadas e respeito.
4. **Gerente do Ponto**:
   - *Comportamento*: Apoia os soldados ao redor e tenta manter o controle do cofre.
   - *Atributos*: HP Médio (95), Dano 10.
   - *Recompensa*: Grande quantidade de Respeito e Contatos Chave de rádio.
5. **Segurança Pesado Encouraçado (Mini-chefe)**:
   - *Comportamento*: Avança na linha de frente com escudo tático e espingarda calibre 12.
   - *Atributos*: HP Alto (260), Armadura Pesada, Dano 28.
   - *Recompensa*: Carga pesada de armas e grana.
6. **Chefe de Área do Morro (Boss de Território)**:
   - *Comportamento*: Comanda reforços de motos e dispara com metralhadora pesada.
   - *Atributos*: HP Massivo (580+), Imune a atordoamento.
   - *Recompensa*: Conquista total do território e liberação do próximo mapa.

### 4.2 Tropas da Sua Facção
1. **Soldado Recrutado**:
   - *Papel*: Infantaria de frente com pistolas e submetralhadoras.
2. **Fuzileiro de Apoio**:
   - *Papel*: Atirador de longo alcance convertido da Forja de Bocas.
3. **Batedor de Moto**:
   - *Papel*: Unidade veloz que caça olheiros e alvos isolados.
4. **Guarda-Costas Pesado**:
   - *Papel*: Tanque de contenção na entrada dos becos.

---

## 5. CONVOCAÇÃO TÁTICA DO BONDE (CENTRO DE OPERAÇÕES)

1. **Convocar Soldado / Recruta [Espaço / Clique no Mapa]**:
   - *Custo*: 10 Inteligência (reduzido com Informantes & Linha Segura).
   - *Efeito*: Despacha instantaneamente 1 recruta armado diretamente para o combate.
   - *Sem dependência de abates*: Não é necessário abater ou esperar cadáveres caírem; a convocação é imediata e orgânica.
   - *Autonomia Total*: O soldado caminha pelas vielas, detecta rivais autonomamente e engaja em tiroteio sem necessidade de marcação manual.
2. **Auto-Convocação [Sindicato / Contatos]**:
   - *Efeito*: O rádio central convoca soldados automaticamente em intervalos regulares sem gasto de inteligência.
3. **HUD Despoluído e Focado em Horda**:
   - Remoção de ações manuais individuais (sniper, gás, carro-bomba, bazuca) que poluíam a tela, mantendo o foco total na progressão incremental, expansão do bando e melhorias estratégicas.

---

## 6. AS 4 OFICINAS DO SINDICATO (UPGRADE TREES)

### 6.1 Arsenal & Balística (Custo: Grana $)
- **Coletes Balísticos Nível III**: +20% HP Máximo dos soldados por nível.
- **Munição Ponta Oca**: +15% Dano por disparo.
- **Bonde das Motos**: +8% Velocidade de perseguição nas vielas.
- **Intimidação Moral**: 5% de chance de colocar o rival em fuga imediata.
- **Médicos Clandestinos**: Regeneração contínua de vida para seu bonde fora de combate.

### 6.2 Bocas & Pontos de Apoio (Custo: Munição)
- **Casas Seguras & Bunkers**: +3 no Limite Máximo de soldados ativos.
- **Barricadas de Aço**: Reduz dano recebido em +3% (máx 60%).
- **Fuzileiros de Elite**: Chance de recrutar soldados de longo alcance com rifles automáticos.
- **Recolhimento Automático**: Gera caixas de munição continuas automaticamente.

### 6.3 Rádios & Inteligência (Custo: Respeito)
- **Frequência Criptografada**: +0.8 de Inteligência recuperada por segundo.
- **Central de Monitoramento**: +20 no Limite Máximo de Inteligência.
- **Calibre Pesado de Sniper**: +25% de dano nos disparos de precisão e ordens.
- **Linha Segura / Suborno**: Reduz custo de rádio de todas as ordens em 4%.

### 6.4 Conexões & Sindicato (Custo: Contatos Chave)
- **Cooptação Automática**: Recruta automaticamente rivais caídos sem precisar clicar.
- **Vigilância Noturna com Sniper**: Disparo de sniper automático no rival mais forte.
- **Lavagem Expressa**: Converte grana recolhida em inteligência adicional.
- **Monopólio Comunitário**: Ganho de respeito em dobro pelas tomadas.

---

## 7. SISTEMA DE PRESTÍGIO: "PROCLAMAÇÃO DA HEGEMONIA"

Quando o controle de um morro atinge o teto, o Comandante declara a **Hegemonia do Cartel**:
- **O que é Consolidado**: Toda a grana, munição e territórios do ciclo atual são limpos para o sindicato.
- **O que é Ganho**: **Emblemas de Hegemonia**, calculados com base no respeito conquistado e territórios dominados:
$$\text{Emblemas} = \lfloor \sqrt{\frac{\text{Respeito Total}}{10}} \times (\text{Território Máximo}) \rfloor$$

### 7.1 Vantagens Permanentes da Hegemonia:
1. **Rota Internacional de Lucros**: +50% permanente em toda a Grana recolhida.
2. **Satélites e Escutas**: Inicia novas disputas com mais Inteligência e regeneração acelerada.
3. **Tropa de Elite Veterana**: +25% de Vida e Dano para todos os soldados da facção.
4. **Bonde Inicial Armado**: Já inicia novos territórios com soldados prontos no local.
5. **Tributo do Sindicato Central**: Multiplica os Emblemas de Hegemonia ganhos em futuros resets.

---

## 8. MAPA DOS TERRITÓRIOS E ESCALADA URBANA

1. **Território 1: Beco dos Descalços (Periferia)** (20 Abates)
2. **Território 2: Praça da Feira & Linha do Trem** (40 Abates)
3. **Território 3: Avenida das Oficinas & Galpões** (60 Abates)
4. **Território 4: Morro Alto (Reduto Fortificado)** (80 Abates)
5. **Território 5: Mansões da Orla & Condomínios** (120 Abates)
6. **Território 6: Complexo Central (Quartel-General Rival)** (200 Abates)

---
*Fim do Documento de Design de Jogo — Versão Urbana 1.0 PT-BR*
