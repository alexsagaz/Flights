---
name: you-bloom-video
description: Edição de vídeo, motion graphics e design de peças do You Bloom Studio (marca de artesanato da Alex) — Reels, stories, carrosséis animados, capas, intros, legendas e qualquer animação com a marca. Use SEMPRE que o pedido envolver vídeo, Reel, animação, Remotion, motion, edição do material bruto da Alex, ou design de peça da You Bloom. Esta skill fica POR CIMA de remotion-motion-graphics: use o fluxo técnico de lá, mas quando as duas discordarem, a regra daqui vence. Leia antes de escrever qualquer código de vídeo.
---

# You Bloom Studio · vídeo e motion

A base técnica é a skill `remotion-motion-graphics` (render, verificação, padrões de
movimento). A **marca** é o Manual de Identidade Visual v1.2.3 (2026-11-24) e o
`tokens.json`, resumidos em `references/`. O manual é a fonte da verdade: se ele
mudar, atualize `assets/theme.ts` e as referências juntos.

**Protagonismo analógico.** O vídeo é um ateliê na mesa: papel de verdade colado,
mão que rabisca, linha que costura, o processo real com erro e tudo. Nunca um
template digital, nunca "estética de app".

## Ordem de leitura
1. Este arquivo inteiro.
2. A skill `remotion-motion-graphics` (no Claude Code: `../remotion-motion-graphics/SKILL.md`) — workflow técnico (setup, render, verificação).
3. `references/regras-de-marca.md` — cor, tipo, voz, elementos, camadas.
4. `references/motion-da-marca.md` — componentes, ritmo, som, checklist final.

## O que a marca SUBSTITUI na skill genérica

| Skill genérica diz | You Bloom faz | Por quê (manual) |
|---|---|---|
| Fundo com gradiente mesh animado | Papel com grão (X3), seda amassada (X5) ou foto do processo — `PapelFundo` | §4.5 proíbe degradê digital; P6 fundo nunca liso |
| Glow/brilho no elemento herói | **Nunca brilho.** Hierarquia por tamanho (P4) e sombra de contato em tinta | §3.5 sem sombra/brilho/efeito; P4 "nunca por neon" |
| Vinheta preta | `LuzUnica`: uma luz de cima à esquerda, sombra em tinta | P5 nada preto; §6.3 luz única |
| Paletas dark tech / roxo / ciano | Só as 9 cores da paleta, 1 campo + 1 viva por peça | §4.1–4.4; azul, lilás, roxo e neon proibidos |
| Clash Display, peso 600–800, tracking −0.03 | Bolha / Fraunces / Caligrafia / Nunito, máx. 3 papéis por peça, minúsculas | §5 |
| Spring/bezier em tudo, sempre liso | **Dois regimes:** recortes de papel em stop motion a 8 fps; texto e vídeo fluidos | §7 (6 Reels de referência) |
| Ken Burns em toda foto | Zoom lento só no fundo; foto/vídeo dela entra **dentro de objeto** ou colada | P2 conteúdo mora num objeto |
| Motion blur em movimento rápido | Não usar: stop motion de papel não tem blur | coerência analógica |
| Grão 5% overlay com flicker | Grão único, 1 px a 4%, por último | §6.3 |
| Exits ~10 frames | Mantém: sai mais rápido do que entra (easing `sair`) | igual |
| Emoji/ícones | Nunca. Rabisco, costura, ponto cruz, selo, laço **dela** | P1, §6.1 |

O que a skill genérica traz e **continua valendo**: entradas com 2–3 propriedades,
stagger, nada entra junto, holds (pausas) como ferramenta, tempo derivado do `fps`,
um `theme.ts` único, e o loop **render → extrair quadros → olhar → corrigir →
renderizar de novo**. Esse loop é obrigatório aqui também.

## Fluxo

### 1 · Escopo
- **Formato:** Reels 1080×1920 (padrão), stories 1080×1920, carrossel 1080×1350.
  30 fps. Duração de Reel 10–35 s.
- **Roteiro com arco processo → conflito → resolução.** Conteúdo com processo,
  conflito e resolução performa ~3× melhor no perfil dela (hipótese forte, não lei).
- **Gancho em ≤ 1 s**, texto no terço superior ou centro, nunca na faixa de baixo.
- **Material:** pergunte/procure o bruto dela (fotos e vídeos do processo). Ele é
  SEMPRE a imagem principal (P7). Sem bruto, deixe claro que a peça é rascunho.
- **Texto na tela:** minúsculas, frases curtas, emoção antes de informação. Rode a
  lista de palavras proibidas (`regras-de-marca.md` §voz) em todo texto.

### 2 · Setup
```bash
npm install remotion @remotion/cli react react-dom
```
Copie desta skill para o projeto:
- `assets/theme.ts` → `src/theme.ts`
- `assets/fontes.ts` → `src/fontes.ts` (importe no Root)
- `assets/components/YouBloom.tsx` → `src/components/YouBloom.tsx`
- `assets/exemplo/` → `src/` (`index.ts`, `Root.tsx`, `scenes/ExemploReel.tsx`); o resultado esperado está em `exemplo/folha_de_contato.png` e `exemplo/exemplo_reel.mp4`

Arquivos da Alex vão em `public/` (pasta do projeto dela: `Desktop\Claude\Identidade visual\entrega\`):
- `public/fontes/` ← `marca/fontes/` (Bolha, Caligrafia, Fraunces, Nunito)
- `public/fundos/` ← `banco_elementos/aprovados/fundo_papel/` e `fundo_seda/`
- `public/elementos/` ← `banco_elementos/aprovados/` (washi, laço, TV, câmera, doily…)
- `public/logo/selo_papel.png` ← `marca/logo/final/`
- `public/bruto/` ← fotos e vídeos do processo dela
- `public/sfx/`, `public/trilha/` ← só som com licença registrada

**Fontes são locais, não Google Fonts online.** O Chromium do render muitas vezes
não tem rede; com `@remotion/google-fonts` o render trava em timeout.

### 3 · Construção — 7 camadas, sempre nesta ordem
```
1 fundo        <PapelFundo textura="fundos/X3_papel_grao_algodao.jpg" />
2 herói        <Bruto/>, <VideoNoObjeto/> ou foto colada (um só herói)
3 suporte      papel creme, etiqueta, caderno, envelope  (<Recorte>)
4 fixação      washi, clipe, alfinete — máx. 2 por elemento (<Recorte>)
5 assinatura   selo, laço, ponto cruz — máx. 2 por peça
6 mão          <PalavraPorPalavra papel="mao">, <Costura>, rabiscos (3–8)
7 acabamento   <Acabamento/>  (luz única + grade quente + grão) — SEMPRE por último
```
Limite: ~8–10 elementos por cena, 1 herói, 1 título que manda.

### 4 · Render
```bash
npx remotion render src/index.ts <Id> out/video.mp4 --codec h264 --crf 16
```
Se o Chromium não for encontrado, passe `--browser-executable` (veja a skill
genérica). Em ambiente Playwright o binário que funciona é o **headless shell**:
`/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.

### 5 · Verificar (obrigatório)
Extraia quadros do MP4 final (gancho, meio de cada beat, saída, último segundo),
monte uma folha de contato e OLHE. Procure, nesta ordem:
1. Costura/contorno do tamanho errado em relação ao suporte (bug real já visto:
   dê altura fixa ao cartão e use `contornoRetangulo(w, h)`).
2. Texto fora da área segura do Reels (topo 250, direita 160, base 420, esquerda 64).
3. Par de cores proibido ou texto com contraste abaixo do aprovado.
4. Mais de 1 cor viva dominante; laranja como fundo; qualquer preto, azul, roxo.
5. Elemento colado com giro 0° ou dois com o mesmo ângulo.
6. Selo/logo aparecendo antes do último segundo.
Corrija → renderize → extraia de novo. Depois rode o checklist de
`references/motion-da-marca.md`.

## Relação com o motor oficial (importante)
O manual §7/§9 decidiu que Reels saem do **`motor/reels.py`** (Python + FFmpeg, a
partir de `roteiro.json`). Esta skill com Remotion é um **segundo caminho**, status
**Hipótese** até a Alex aprovar a troca ou a convivência. Não substitua o motor em
silêncio: diga qual dos dois está usando e por quê. Se a Alex aprovar o Remotion,
o manual, o `tokens.json` e esta skill precisam ser atualizados juntos (regra do
`$meta` do tokens.json).

Toda peça entregue deve listar os elementos externos e trilhas usados, para entrar
em `banco_elementos/creditos.json`.
