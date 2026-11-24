// YouBloom.tsx — componentes de motion da marca You Bloom Studio para Remotion.
// Copie para src/components/ junto com src/theme.ts.
// Regras de origem: MANUAL_IDENTIDADE_VISUAL v1.2.3 (§1 P1–P7, §4, §5, §6.3, §7).
import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { alfa, theme, type Cor } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPO
// ─────────────────────────────────────────────────────────────────────────────

/** ms -> frames, sempre a partir do fps real (nunca número mágico). */
export const useMs = () => {
  const { fps } = useVideoConfig();
  return (ms: number) => Math.round((ms / 1000) * fps);
};

/** Frame "segurado" a 8 fps: o salto de stop motion de recorte (manual §7). */
export const useFrameStop = (fpsStop: number = theme.stopMotionFps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const passo = fps / fpsStop;
  return Math.floor(frame / passo) * passo;
};

/** Giro de colagem: ±3–8°, nunca 0°, determinístico pela semente (nº da peça + id). */
export const giroColado = (semente: string) => {
  const g = interpolate(random(`giro-${semente}`), [0, 1], [theme.giro.min, theme.giro.max]);
  return random(`lado-${semente}`) > 0.5 ? g : -g;
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMADA 1 · FUNDO — nunca liso, nunca degradê digital (P6, §4.5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fundo de papel. PREFIRA a textura real aprovada (X3 papel com grão, X5 seda)
 * passando `textura="fundos/X3_papel_grao_creme.jpg"` (arquivo em public/).
 * Sem textura, desenha um papel procedural na cor do campo (placeholder honesto:
 * fibras de papel, não degradê).
 */
export const PapelFundo: React.FC<{ cor?: Cor; textura?: string }> = ({
  cor = "creme",
  textura,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // deriva lenta, quase imperceptível: a câmera "respira" sobre a mesa
  const escala = interpolate(frame, [0, durationInFrames], [1.02, 1.06], {
    easing: theme.ease.mover,
  });
  if (textura) {
    return (
      <AbsoluteFill style={{ overflow: "hidden", background: theme.cor[cor] }}>
        <Img
          src={staticFile(textura)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${escala})` }}
        />
      </AbsoluteFill>
    );
  }
  const fibras = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.09' numOctaves='4' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.23 0 0 0 0 0.05 0 0 0 0.9 -0.35'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23p)'/%3E%3C/svg%3E")`;
  const manchas = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='900'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.004' numOctaves='3' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.23 0 0 0 0 0.05 0 0 0 0.7 -0.3'/%3E%3C/filter%3E%3Crect width='900' height='900' filter='url(%23m)'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ background: theme.cor[cor], overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${escala})`,
          backgroundImage: `${fibras}, ${manchas}`,
          backgroundSize: "600px, 900px",
          opacity: 0.16,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMADAS 2–5 · RECORTE COLADO (herói, suporte, fixação, assinatura)
// ─────────────────────────────────────────────────────────────────────────────

type RecorteProps = {
  /** id estável: vira semente do giro e do tremor */
  id: string;
  /** em que ms ele entra */
  entraMs?: number;
  /** em que ms ele sai (opcional) */
  saiMs?: number;
  /** "stop" = recorte de papel a 8 fps (padrão da marca); "fluido" = objeto/vídeo */
  modo?: "stop" | "fluido";
  /** de onde vem: desliza de fora para o lugar */
  de?: "cima" | "baixo" | "esquerda" | "direita";
  sombra?: "papelFino" | "objetoGrosso";
  /** tremor de stop motion enquanto parado (papel vivo na mesa) */
  tremor?: boolean;
  /** false para texto e vídeo: só papel/objeto colado gira (§6.3) */
  girar?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * O workhorse da marca. Entra com 3 propriedades juntas (posição + giro + escala),
 * assenta com a leve passada do easing "entrar", ganha sombra de contato em TINTA
 * vinda de cima à esquerda, e fica com um tremor sutil de stop motion.
 */
export const Recorte: React.FC<RecorteProps> = ({
  id,
  entraMs = 0,
  saiMs,
  modo = "stop",
  de = "baixo",
  sombra = "papelFino",
  tremor = true,
  girar = true,
  style,
  children,
}) => {
  const frameReal = useCurrentFrame();
  const frameStop = useFrameStop();
  const ms = useMs();
  const frame = modo === "stop" ? frameStop : frameReal;

  const ini = ms(entraMs);
  const dur = ms(theme.ms.elemento) + (modo === "stop" ? ms(theme.ms.stopMotionFrame) : 0);
  const p = interpolate(frame, [ini, ini + dur], [0, 1], { ...clamp, easing: theme.ease.entrar });

  const giroFinal = girar ? giroColado(id) : 0;
  const dist = 140;
  const direcoes: Record<NonNullable<RecorteProps["de"]>, [number, number]> = {
    cima: [0, -dist], baixo: [0, dist], esquerda: [-dist, 0], direita: [dist, 0],
  };
  const [dx, dy] = direcoes[de];

  let saida = 0;
  if (saiMs !== undefined) {
    const s = ms(saiMs);
    saida = interpolate(frame, [s, s + Math.round(dur * 0.6)], [0, 1], { ...clamp, easing: theme.ease.sair });
  }

  // tremor: passos a 8 fps, ±0,6° e ±1,2 px (o "boil" de animação de papel)
  const passo = Math.floor(frameReal / (useVideoConfig().fps / theme.stopMotionFps));
  const tr = tremor && p >= 1 ? 1 : 0;
  const tg = tr * interpolate(random(`tg-${id}-${passo}`), [0, 1], [-0.6, 0.6]);
  const tx = tr * interpolate(random(`tx-${id}-${passo}`), [0, 1], [-1.2, 1.2]);

  const visivel = Math.min(1, p * 2.5) * (1 - saida);
  const x = interpolate(p, [0, 1], [dx, 0]) + dx * saida * 0.6 + tx;
  const y = interpolate(p, [0, 1], [dy, 0]) + dy * saida * 0.6;
  const giro = interpolate(p, [0, 1], [giroFinal * 2.2, giroFinal]) + tg;
  const escala = interpolate(p, [0, 1], [0.9, 1]) * (1 - saida * 0.06);

  return (
    <div
      style={{
        position: "absolute",
        opacity: visivel,
        transform: `translate(${x}px, ${y}px) rotate(${giro}deg) scale(${escala})`,
        filter: theme.sombra[sombra === "papelFino" ? "papelFinoDrop" : "objetoGrossoDrop"],
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXTO · palavra por palavra, 120 ms, minúsculas (§2, §7)
// ─────────────────────────────────────────────────────────────────────────────

type Papel = "bolha" | "titulo" | "mao" | "corpo";

const estiloPapel = (papel: Papel, usarAlt: boolean): React.CSSProperties => {
  const f = theme.fonte;
  switch (papel) {
    case "bolha":
      return { fontFamily: `'${f.bolha}', '${f.bolhaAlt}'`, fontSize: theme.tamanho.bolha.px, lineHeight: theme.tamanho.bolha.entrelinha, ...(usarAlt ? { fontFamily: `'${f.bolhaAlt}'` } : {}) };
    case "titulo":
      return { fontFamily: `'${f.titulo}'`, fontWeight: 900, fontVariationSettings: theme.eixo.titulo, fontSize: theme.tamanho.titulo.px, lineHeight: theme.tamanho.titulo.entrelinha, letterSpacing: "-0.01em" };
    case "mao":
      return { fontFamily: `'${f.mao}', '${f.maoAlt}'`, fontSize: theme.tamanho.mao.px, lineHeight: theme.tamanho.mao.entrelinha, ...(usarAlt ? { fontFamily: `'${f.maoAlt}'` } : {}) };
    case "corpo":
      return { fontFamily: `'${f.corpo}'`, fontWeight: 400, fontVariationSettings: theme.eixo.corpo, fontSize: theme.tamanho.corpo.px, lineHeight: theme.tamanho.corpo.entrelinha };
  }
};

/**
 * Texto entrando palavra por palavra a 120 ms (fluido, não stop motion: texto
 * é a voz, precisa ler liso). Força minúsculas: é a assinatura da marca.
 * `destaque` = índice da ÚNICA palavra em cor viva (P4: um título manda).
 */
export const PalavraPorPalavra: React.FC<{
  texto: string;
  entraMs?: number;
  papel?: Papel;
  cor?: Cor;
  destaque?: number;
  corDestaque?: Cor;
  usarFonteAlt?: boolean;
  style?: React.CSSProperties;
}> = ({ texto, entraMs = 0, papel = "titulo", cor = "tinta", destaque, corDestaque = "framboesa", usarFonteAlt = false, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = useMs();
  const palavras = texto.toLocaleLowerCase("pt-BR").split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: 18, rowGap: 4, color: theme.cor[cor], ...estiloPapel(papel, usarFonteAlt), ...style }}>
      {palavras.map((w, i) => {
        const p = spring({ frame: frame - ms(entraMs + i * theme.ms.palavra), fps, config: theme.spring.palavra });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
              transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
              color: i === destaque ? theme.cor[corDestaque] : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Etiqueta em Nunito Black, CAIXA ALTA espaçada (única exceção às minúsculas). */
export const Etiqueta: React.FC<{ texto: string; fundo?: Cor; cor?: Cor; style?: React.CSSProperties }> = ({
  texto,
  fundo = "creme",
  cor = "tinta",
  style,
}) => (
  <div
    style={{
      display: "inline-block",
      background: theme.cor[fundo],
      color: theme.cor[cor],
      fontFamily: `'${theme.fonte.etiqueta}'`,
      fontWeight: 900,
      fontSize: theme.tamanho.etiqueta.px,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      padding: "14px 22px 12px 26px",
      borderRadius: 12,
      ...style,
    }}
  >
    {texto}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CAMADA 6 · MÃO — linha de costura sendo "costurada" (P1, P3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pesponto em framboesa que vai aparecendo ponto a ponto ao longo de um caminho.
 * Use o traço DA ALEX quando possível (desenho_a_mao/vetor/*.svg: copie o `d`).
 * Nunca `border: dashed` de CSS (tokens.json › borda.costura.nunca).
 */
export const Costura: React.FC<{
  d: string;
  largura: number;
  altura: number;
  entraMs?: number;
  duracaoMs?: number;
  cor?: Cor;
  espessura?: number;
  style?: React.CSSProperties;
}> = ({ d, largura, altura, entraMs = 0, duracaoMs = 700, cor = "framboesa", espessura = 5, style }) => {
  const frame = useFrameStop(12); // costura anda em "pontos", 12 fps
  const ms = useMs();
  const p = interpolate(frame, [ms(entraMs), ms(entraMs + duracaoMs)], [0, 1], { ...clamp, easing: theme.ease.mover });
  const id = `m-${d.length}-${entraMs}`;
  return (
    <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} style={{ position: "absolute", overflow: "visible", ...style }}>
      <defs>
        <mask id={id}>
          <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={espessura * 4} strokeDasharray={`${p} 1`} strokeLinecap="round" />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={theme.cor[cor]} strokeWidth={espessura} strokeLinecap="round" strokeDasharray={`${espessura * 3.4} ${espessura * 2.6}`} mask={`url(#${id})`} />
    </svg>
  );
};

/**
 * Caminho de pesponto em volta de um retângulo de w×h, recuado `recuo` px.
 * Use SEMPRE com o mesmo w×h do suporte (dê altura fixa ao cartão), senão a
 * costura sobra para fora — bug real encontrado na verificação do exemplo.
 */
export const contornoRetangulo = (w: number, h: number, recuo = 18) =>
  `M ${recuo} ${recuo} L ${w - recuo} ${recuo} L ${w - recuo} ${h - recuo} L ${recuo} ${h - recuo} Z`;

// ─────────────────────────────────────────────────────────────────────────────
// VÍDEO DENTRO DE OBJETO (P2, §7)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O vídeo dela dentro de um objeto real (TV G3, câmera G13, caderno, prato).
 * `objeto` = PNG recortado; `tela` = retângulo da área vazia em px do PNG.
 */
export const VideoNoObjeto: React.FC<{
  video: string;
  objeto: string;
  largura: number;
  altura: number;
  tela: { x: number; y: number; w: number; h: number; raio?: number };
  inicioS?: number;
}> = ({ video, objeto, largura, altura, tela, inicioS = 0 }) => {
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", width: largura, height: altura }}>
      <div style={{ position: "absolute", left: tela.x, top: tela.y, width: tela.w, height: tela.h, borderRadius: tela.raio ?? 18, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile(video)} startFrom={Math.round(inicioS * fps)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <Img src={staticFile(objeto)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
};

/** Material bruto da Alex em tela cheia, puxado pro quente (+5 a +10 de temperatura). */
export const Bruto: React.FC<{ video: string; inicioS?: number }> = ({ video, inicioS = 0 }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(video)}
        startFrom={Math.round(inicioS * fps)}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.06) sepia(0.06)" }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMADA 7 · ACABAMENTO — luz única, grade quente, grão (§6.3)
// ─────────────────────────────────────────────────────────────────────────────

/** Uma só luz, de cima à esquerda. Substitui a vinheta preta da skill genérica. */
export const LuzUnica: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(120% 90% at 18% 8%, ${alfa("creme", 0.18)} 0%, transparent 45%, ${alfa("tinta", 0.1)} 100%)`,
    }}
  />
);

/** Grade quente: +temperatura, nunca azulado. Fica acima do conteúdo, abaixo do grão. */
export const GradeQuente: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundColor: theme.gradeQuente.cor,
      mixBlendMode: theme.gradeQuente.blend,
      opacity: theme.gradeQuente.opacidade,
    }}
  />
);

/** Um grão só, 1 px a 4%, sobre a peça inteira, por último. */
export const Grao: React.FC = () => {
  const frame = useCurrentFrame();
  const ruido = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='1'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: ruido,
        backgroundSize: "256px",
        backgroundPosition: `${(frame * 37) % 256}px ${(frame * 61) % 256}px`,
        opacity: theme.grao.opacidade,
        mixBlendMode: "multiply",
      }}
    />
  );
};

/** Pilha de acabamento na ordem certa. Coloque SEMPRE como último filho da cena. */
export const Acabamento: React.FC = () => (
  <>
    <LuzUnica />
    <GradeQuente />
    <Grao />
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// ASSINATURA FINAL e DEPURAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Último segundo do Reel: selo + @youbloom_studio em Nunito (§8).
 * O logo nunca fica por cima do vídeo todo. `selo` = selo_papel.png em public/.
 */
export const SeloFinal: React.FC<{ selo?: string; tamanho?: number }> = ({ selo, tamanho = 300 }) => {
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const ini = durationInFrames - fps; // último 1 s
  if (frame < ini - 2) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height }}>
      <Recorte id="selo-final" entraMs={((ini - 0) / fps) * 1000} modo="stop" de="cima" sombra="objetoGrosso" style={{ left: width / 2 - tamanho / 2, top: height * 0.38 }}>
        {selo ? (
          <Img src={staticFile(selo)} style={{ width: tamanho, height: tamanho }} />
        ) : (
          // placeholder: troque por selo_papel.png assim que estiver em public/
          <div style={{ position: "relative", width: tamanho, height: tamanho, borderRadius: "50%", background: theme.cor.algodao, display: "grid", placeItems: "center", color: theme.cor.tinta, fontFamily: `'${theme.fonte.etiqueta}'`, fontWeight: 900, fontSize: 22, letterSpacing: "0.15em" }}>
            <Costura
              largura={tamanho}
              altura={tamanho}
              d={`M ${tamanho / 2} 22 A ${tamanho / 2 - 22} ${tamanho / 2 - 22} 0 1 1 ${tamanho / 2 - 0.1} 22`}
              entraMs={((ini + 3) / fps) * 1000}
              duracaoMs={500}
              style={{ left: 0, top: 0 }}
            />
            SELO
          </div>
        )}
      </Recorte>
      <Recorte id="arroba-final" entraMs={((ini + fps * 0.18) / fps) * 1000} modo="fluido" de="baixo" tremor={false} style={{ left: 0, width, top: height * 0.38 + tamanho + 48, display: "flex", justifyContent: "center" }}>
        <Etiqueta texto="@youbloom_studio" />
      </Recorte>
    </div>
  );
};

/** Liga em desenvolvimento para ver a área segura do Reels/Stories. Nunca no render final. */
export const AreaSegura: React.FC<{ formato?: keyof typeof theme.seguro }> = ({ formato = "reels" }) => {
  const s = theme.seguro[formato];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: s.left, top: s.top, right: s.right, bottom: s.bottom, outline: `3px solid ${alfa("framboesa", 0.7)}` }} />
    </AbsoluteFill>
  );
};
