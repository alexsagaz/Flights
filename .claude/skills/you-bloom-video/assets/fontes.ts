// fontes.ts — carrega as fontes da marca a partir de public/fontes/ (arquivos locais).
// Importe uma vez no Root.tsx: `import "./fontes";`
//
// Por que local e não Google Fonts online: o render roda num Chromium que muitas
// vezes não tem rede (sandbox, offline), e o manual já guarda as fontes em
// entrega/marca/fontes/. Local = render determinístico e eixos SOFT/WONK certos.
//
// Copie para public/fontes/ (nomes abaixo; ajuste se os seus forem outros):
//   YouBloomBolha-Regular.otf        <- entrega/marca/fontes/
//   YouBloomCaligrafia-Regular.otf   <- entrega/marca/fontes/
//   Fraunces-Variavel.ttf            <- Fraunces[SOFT,WONK,opsz,wght].ttf (OFL)
//   Nunito-Variavel.ttf              <- Nunito[wght].ttf (OFL)
//   Sniglet-ExtraBold.ttf, PatrickHand-Regular.ttf  <- alternativas gratuitas (OFL)
// Arquivo que faltar só gera um aviso no console; o componente cai na alternativa.
import { continueRender, delayRender, staticFile } from "remotion";

type Def = { familia: string; arquivo: string; descritores?: FontFaceDescriptors };

export const FONTES: Def[] = [
  // próprias da Alex
  { familia: "YouBloom Bolha", arquivo: "YouBloomBolha-Regular.otf" },
  { familia: "YouBloom Caligrafia", arquivo: "YouBloomCaligrafia-Regular.otf" },
  // terceiros (OFL) — variáveis, cobrem 400 e 900 e os eixos SOFT/WONK/opsz
  { familia: "Fraunces", arquivo: "Fraunces-Variavel.ttf", descritores: { weight: "100 900" } },
  { familia: "Nunito", arquivo: "Nunito-Variavel.ttf", descritores: { weight: "200 1000" } },
  // alternativas gratuitas das próprias
  { familia: "Sniglet", arquivo: "Sniglet-ExtraBold.ttf" },
  { familia: "Patrick Hand", arquivo: "PatrickHand-Regular.ttf" },
];

const handle = delayRender("fontes You Bloom");
Promise.all(
  FONTES.map(async ({ familia, arquivo, descritores }) => {
    try {
      const f = new FontFace(familia, `url(${staticFile(`fontes/${arquivo}`)})`, descritores);
      await f.load();
      document.fonts.add(f);
    } catch {
      console.warn(`[fontes] ${arquivo} não está em public/fontes/ — usando alternativa para "${familia}"`);
    }
  }),
).finally(() => continueRender(handle));
