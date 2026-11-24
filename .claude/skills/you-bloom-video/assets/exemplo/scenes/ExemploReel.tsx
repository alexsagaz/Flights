// ExemploReel.tsx — Reel de referência (6 s, 1080×1920, 30 fps) montado nas 7 camadas.
// Gancho do manual §2: "o ponto que eu errei". Sem material bruto ainda, o "herói"
// é um cartão de papel; numa peça real, o herói é a foto/vídeo do processo dela (P7).
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { theme } from "../theme";
import {
  Acabamento,
  Costura,
  Etiqueta,
  PalavraPorPalavra,
  PapelFundo,
  Recorte,
  SeloFinal,
  contornoRetangulo,
} from "../components/YouBloom";

export const ExemploReel: React.FC = () => {
  const { width, durationInFrames, fps } = useVideoConfig();
  // tudo sai (mais rápido do que entrou) logo antes do último segundo, que é do selo
  const SAI = ((durationInFrames - fps) / fps) * 1000 - 320;
  const s = theme.seguro.reels;
  const CARTAO_H = 250; // altura fixa: a costura usa o mesmo tamanho
  const larguraUtil = width - s.left - s.right; // 856 px

  return (
    <AbsoluteFill>
      {/* 1 · fundo: campo de cor algodão, nunca liso */}
      <PapelFundo cor="algodao" />

      {/* 6 · mão (gancho): texto em ≤ 1 s, terço superior, dentro da área segura */}
      <Recorte id="gancho" modo="fluido" tremor={false} girar={false} entraMs={0} saiMs={SAI} de="cima" style={{ left: s.left + 8, top: s.top + 40, width: larguraUtil, filter: "none" }}>
        <PalavraPorPalavra texto="o ponto que eu errei" papel="bolha" usarFonteAlt cor="tinta" destaque={4} entraMs={100} />
      </Recorte>

      {/* 3 · suporte do texto: papel creme colado, entra em stop motion */}
      <Recorte id="cartao" entraMs={1200} saiMs={SAI} de="baixo" style={{ left: s.left + 30, top: 820, width: 760 }}>
        <div style={{ background: theme.cor.creme, borderRadius: 4, width: 760, height: CARTAO_H, boxSizing: "border-box", padding: "56px 60px", position: "relative" }}>
          <PalavraPorPalavra texto="desmanchei três vezes antes de entender a linha" papel="mao" usarFonteAlt cor="tinta" entraMs={1650} />
          {/* pesponto em volta do cartão (P3: a borda assina) */}
          <Costura largura={760} altura={CARTAO_H} d={contornoRetangulo(760, CARTAO_H)} entraMs={2600} duracaoMs={900} style={{ left: 0, top: 0 }} />
        </div>
      </Recorte>

      {/* 4 · fixação: etiqueta de numeração "presa" por cima */}
      <Recorte id="etiqueta" entraMs={2100} saiMs={SAI - 60} de="direita" style={{ left: 600, top: 780 }}>
        <Etiqueta texto="01 / 03" fundo="amarelo" />
      </Recorte>

      {/* 6 · mão: rabisco sublinhando, em costura */}
      <Recorte id="rabisco" modo="fluido" tremor={false} entraMs={3300} saiMs={SAI} de="baixo" style={{ left: s.left + 20, top: 1250, width: 520, height: 60, filter: "none" }}>
        <Costura largura={520} altura={60} d="M 10 40 C 120 10, 260 58, 510 22" entraMs={3300} duracaoMs={600} style={{ left: 0, top: 0 }} />
      </Recorte>

      {/* 5 · assinatura: selo + @ no último segundo */}
      <SeloFinal />

      {/* 7 · luz única, grade quente, grão — sempre por último */}
      <Acabamento />
    </AbsoluteFill>
  );
};
