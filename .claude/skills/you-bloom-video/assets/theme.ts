// theme.ts — You Bloom Studio · fonte única de verdade para todo projeto Remotion.
// Traduzido de tokens.json v1.2.3 (2026-11-24). Se o manual mudar, mude aqui junto.
// NUNCA escreva hex, easing ou spring direto num componente: importe daqui.
import { Easing } from "remotion";

const paleta = {
  creme: "#FFF4DE", // papel, respiro, texto sobre escuro
  algodao: "#FFC8D7", // campo de cor
  chiclete: "#FB78A5", // viva
  framboesa: "#E0245E", // viva, título, linha de costura
  amarelo: "#FFC21A", // viva, acento
  laranja: "#FF7F1F", // acento: nunca dominante, nunca fundo de página
  oliva: "#7A840B", // campo de cor, STUDIO, caseado
  broto: "#BAC841", // campo de cor
  tinta: "#2B3A0E", // texto e logo; substitui o preto
} as const;

type Cor = keyof typeof paleta;

// Hex + alfa sem sair da paleta: alfa("tinta", 0.25) -> "rgba(43,58,14,0.25)"
export const alfa = (cor: Cor, a: number) => {
  const h = paleta[cor];
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

export const theme = {
  cor: paleta,

  // Por peça: 1 campo de cor + 1 viva dominante; a outra viva só em detalhe.
  // Pares com contraste aprovado (WCAG). Use SÓ estes para texto.
  texto: {
    // >= 4,5:1 — qualquer tamanho
    ok: [
      ["tinta", "creme"], ["tinta", "algodao"], ["tinta", "amarelo"],
      ["tinta", "broto"], ["tinta", "chiclete"], ["tinta", "laranja"],
    ] as [Cor, Cor][],
    // >= 3:1 — só título >= 24 px
    soTitulo: [["framboesa", "creme"], ["creme", "oliva"], ["framboesa", "algodao"]] as [Cor, Cor][],
    // nunca, nem como cor sobre cor
    proibido: [
      ["framboesa", "oliva"], ["chiclete", "laranja"], ["amarelo", "broto"],
      ["amarelo", "creme"], ["framboesa", "tinta"], ["chiclete", "creme"], ["oliva", "broto"],
    ] as [Cor, Cor][],
  },

  fonte: {
    // Próprias da Alex (arquivos em entrega/marca/fontes/). Carregar com @font-face + staticFile.
    bolha: "YouBloom Bolha", // capa, chamada 1–4 palavras, minúsculas
    mao: "YouBloom Caligrafia", // anotação curta, até 8 palavras / 2 linhas, nunca caixa alta
    // Alternativas gratuitas (Google Fonts) quando os .otf não estiverem em public/fontes/
    bolhaAlt: "Sniglet",
    maoAlt: "Patrick Hand",
    // Terceiros (OFL)
    titulo: "Fraunces", // peso 900, SOFT 100, WONK 1, opsz 144
    corpo: "Fraunces", // peso 400, SOFT 50, opsz 12 — sempre sobre papel creme
    etiqueta: "Nunito", // peso 900, CAIXA ALTA, letterSpacing 0.12–0.28em
  },

  // Variações de eixo para usar em fontVariationSettings
  eixo: {
    titulo: "'SOFT' 100, 'WONK' 1, 'opsz' 144",
    corpo: "'SOFT' 50, 'WONK' 0, 'opsz' 12",
  },

  // Tamanhos a 1080 px de largura: [padrão, mínimo]
  tamanho: {
    bolha: { px: 150, min: 96, entrelinha: 0.92 },
    titulo: { px: 88, min: 64, entrelinha: 1.0 },
    mao: { px: 56, min: 36, entrelinha: 1.1 },
    corpo: { px: 34, min: 28, entrelinha: 1.4 },
    etiqueta: { px: 26, min: 22, entrelinha: 1.2 },
    reelsTela: { px: 72, min: 56, entrelinha: 1.05 },
    legendaReels: { px: 54, min: 46, contorno: 5, y: [1380, 1480], maxCaracteres: 32 },
  },

  espaco: { base: 8, escala: [8, 16, 24, 32, 48, 64, 96, 128], margemLamina: 72, margemStories: 64 },

  // Áreas seguras validadas com print do app (manual 1.2.2)
  seguro: {
    reels: { w: 1080, h: 1920, top: 250, right: 160, bottom: 420, left: 64 },
    stories: { w: 1080, h: 1920, top: 250, right: 64, bottom: 340, left: 64 },
    carrossel: { w: 1080, h: 1350, top: 72, right: 72, bottom: 96, left: 72 },
    quadrado: { w: 1080, h: 1080, top: 64, right: 64, bottom: 64, left: 64 },
  },

  // Luz única de cima à esquerda -> sombra vai para baixo/direita, sempre em TINTA
  sombra: {
    papelFino: `4px 8px 12px ${alfa("tinta", 0.25)}`,
    objetoGrosso: `8px 14px 22px ${alfa("tinta", 0.3)}`,
    // para filter: drop-shadow() em PNG recortado
    papelFinoDrop: `drop-shadow(4px 8px 6px ${alfa("tinta", 0.25)})`,
    objetoGrossoDrop: `drop-shadow(8px 14px 11px ${alfa("tinta", 0.3)})`,
  },

  grao: { tamanhoPx: 1, opacidade: 0.04 },
  giro: { min: 3, max: 8 }, // graus; nunca 0°, nunca repetir ângulo na peça

  // MOTION — tokens.json › motion
  ms: { palavra: 120, elemento: 180, stopMotionFrame: 125, ganchoAte: 1000 },
  stopMotionFps: 8,
  ease: {
    // cubic-bezier(.2,.9,.3,1.2): entra com leve passada (o papel "assenta")
    entrar: Easing.bezier(0.2, 0.9, 0.3, 1.2),
    // cubic-bezier(.6,0,.8,.2): sai rápido, sem passada
    sair: Easing.bezier(0.6, 0, 0.8, 0.2),
    // movimentos longos (zoom lento, deriva)
    mover: Easing.bezier(0.45, 0, 0.55, 1),
  },
  // Springs para quando o elemento precisa de "peso" (papel, objeto).
  // Calibráveis: o padrão é o bezier acima; spring é alternativa equivalente.
  spring: {
    papel: { damping: 15, stiffness: 140, mass: 0.7 }, // recorte leve assentando
    objeto: { damping: 20, stiffness: 100, mass: 1 }, // TV, câmera, caderno
    palavra: { damping: 16, stiffness: 190, mass: 0.5 }, // texto palavra por palavra
  },
  ritmo: {
    planoGancho: [0.8, 1.2], // s
    planoTutorial: [2.5, 7.5], // s
    novidadeACada: 1.0, // s
    duracaoReel: [10, 35], // s
  },
  // Cor de vídeo: +5 a +10 de temperatura (puxar pro quente, nunca azulado)
  gradeQuente: { cor: paleta.amarelo, opacidade: 0.08, blend: "soft-light" as const },

  som: { lufs: -14, picoDbtp: -1 },
} as const;

export type Theme = typeof theme;
export type { Cor };
