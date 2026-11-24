# Motion da marca — componentes, ritmo, som, checklist

Componentes prontos em `assets/components/YouBloom.tsx`; tokens em `assets/theme.ts`.
Exemplo verificado em `assets/exemplo/` (folha de contato: `exemplo/folha_de_contato.png`).

## Conteúdo
1. Os dois regimes de movimento
2. Componentes
3. Tempos e ritmo
4. Transições
5. Som
6. Receitas de cena
7. Checklist antes de entregar

---

## 1. Os dois regimes de movimento
Os 6 Reels de referência da Alex misturam duas texturas de movimento. Fluidez
de verdade aqui é **contraste** entre elas, não tudo deslizando liso.

| Regime | Para quê | Como |
|---|---|---|
| **Stop motion (8 fps)** | papel, recorte, etiqueta, washi, selo, laço | `modo="stop"`: o quadro segura 125 ms e pula; ao parar, tremor sutil ("boil") de ±0,6° e ±1,2 px |
| **Fluido (30 fps)** | texto, vídeo dela, zoom do fundo | spring/bezier com o easing da marca; leitura lisa |

- Easing de entrada: `cubic-bezier(.2,.9,.3,1.2)` — leve passada, o papel "assenta".
- Easing de saída: `cubic-bezier(.6,0,.8,.2)` — sai rápido, sem passada.
- **Nunca linear** (regra herdada da skill genérica). Exceção: o salto discreto do
  stop motion, que é intencional.
- Entradas com 3 propriedades juntas (posição + giro + escala) e stagger.
- Holds: depois de um elemento assentar, 15–20 quadros parados antes do próximo.

## 2. Componentes
| Componente | Camada | Uso |
|---|---|---|
| `PapelFundo` | 1 | `textura="fundos/X3_..."` (prefira); sem textura desenha papel procedural na cor do campo (placeholder) |
| `Bruto` | 2 | vídeo dela em tela cheia, já puxado pro quente |
| `VideoNoObjeto` | 2 | vídeo dela dentro da TV/câmera/caderno; passe o retângulo da tela vazia do PNG |
| `Recorte` | 2–5 | qualquer coisa colada. Props: `id` (semente), `entraMs`, `saiMs`, `modo`, `de`, `sombra`, `tremor`, `girar` |
| `PalavraPorPalavra` | 6 | 120 ms por palavra, força minúsculas, `destaque` = índice da única palavra em cor viva |
| `Etiqueta` | 4/6 | Nunito 900 caixa alta: numeração, data, @ |
| `Costura` | 6 | pesponto framboesa sendo "costurado" ao longo de um `d` SVG (use o traço dela em `desenho_a_mao/vetor/`) |
| `contornoRetangulo(w,h)` | — | caminho de costura em volta de um suporte de tamanho FIXO |
| `SeloFinal` | 5 | selo + @youbloom_studio no último segundo |
| `Acabamento` | 7 | `LuzUnica` + `GradeQuente` + `Grao`, sempre por último |
| `AreaSegura` | debug | contorno da área segura; tirar antes do render final |
| `useFrameStop`, `useMs`, `giroColado` | — | utilitários de tempo e semente |

**Texto e vídeo não giram** (`girar={false}`); só papel/objeto colado gira.

## 3. Tempos e ritmo
| Token | Valor |
|---|---|
| palavra entra | 120 ms |
| elemento entra | 180 ms (+125 ms no regime stop) |
| quadro de stop motion | 125 ms (8 fps) |
| gancho: texto na tela até | 1000 ms |
| plano de gancho/lista | 0,8–1,2 s |
| plano de tutorial | 2,5–7,5 s, com algo novo entrando a cada ~1 s |
| duração do Reel | 10–35 s |

Estrutura de Reel (adaptada da skill genérica ao arco da marca):
```
0–1 s     GANCHO     conflito ou promessa em texto + primeiro corte do processo
1–3 s     PROCESSO   mãos, material, "isso aqui era..."
3–N s     CONFLITO   o erro, o desmanche, a dúvida (é o que segura a pessoa)
N–fim-1   RESOLUÇÃO  a peça pronta — maior movimento do vídeo
último 1 s SELO      selo + @youbloom_studio
```

## 4. Transições
1. **Corte seco** — padrão.
2. **Papel rasgado filmado pela Alex** — quando existir em `public/transicoes/`.
3. CapCut / YouTube CC BY / bibliotecas com **uso comercial confirmado e registrado**.
4. Feitas em código, sempre materiais: uma folha de papel (recorte) atravessa o
   quadro em stop motion e o corte acontece escondido atrás dela.

Nunca: wipe digital liso, zoom com blur de app, glitch, transição de "slide" genérica.

## 5. Som
- Trilha ou voz contínua em **~−14 LUFS**, pico **≤ −1 dBTP**.
- Sons pontuais (papel, click, plop, tesoura, linha puxada) sincronizados com cada
  elemento que entra, **2–3 quadros antes** de o visual assentar.
- Trilha só com licença registrada. Sem trilha licenciada, entregue o vídeo
  dizendo que está sem som e por quê — não invente trilha.
- Medir/normalizar no fim:
  ```bash
  ffmpeg -i out/video.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy out/video_-14lufs.mp4
  ```

## 6. Receitas de cena
**Gancho com texto:** `PapelFundo` (campo) → `PalavraPorPalavra papel="bolha"` no
terço superior com 1 palavra em framboesa → corte para o bruto em ≤ 1 s.

**Vídeo dentro de objeto:** `PapelFundo` creme → `Recorte modo="fluido" sombra="objetoGrosso"`
contendo `VideoNoObjeto` (TV G3) → washi segurando (`Recorte modo="stop"`) →
anotação na Caligrafia com seta em `Costura`.

**Lista/passo a passo:** suporte creme por passo, cada um em `Recorte` com stagger
de 4–6 quadros, numeração em `Etiqueta` "01 / 05", corte seco entre passos.

## 7. Checklist antes de entregar
- [ ] Renderizado, quadros extraídos do MP4, folha de contato inspecionada, corrigido, re-renderizado
- [ ] Gancho com texto em ≤ 1 s, terço superior/centro
- [ ] Tudo dentro da área segura (Reels: topo 250, dir. 160, base 420, esq. 64)
- [ ] Todo texto em minúsculas (exceto etiqueta) e sem palavra proibida
- [ ] Máx. 3 papéis tipográficos; caligrafia ≤ 8 palavras
- [ ] 1 campo de cor + 1 viva dominante; nenhum par proibido; nada preto/azul/roxo/neon
- [ ] Fundo com textura, nunca liso nem degradê digital
- [ ] Elementos colados girando ±3–8°, ângulos diferentes; texto e vídeo sem giro
- [ ] Sombra em tinta vinda de cima à esquerda; nenhum brilho/glow
- [ ] Grão único por último
- [ ] Papel em stop motion, texto/vídeo fluidos; nada linear além do salto de stop motion
- [ ] Saídas mais rápidas que entradas; holds presentes
- [ ] Logo só no último segundo, com selo + @youbloom_studio
- [ ] Bruto dela como imagem principal (ou a peça está marcada como rascunho)
- [ ] Som em ~−14 LUFS / ≤ −1 dBTP, ou "sem som" dito explicitamente
- [ ] Lista de elementos externos e trilhas para `creditos.json`
