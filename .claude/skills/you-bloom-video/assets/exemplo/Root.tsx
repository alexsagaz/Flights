import React from "react";
import { Composition } from "remotion";
import "./fontes";
import { ExemploReel } from "./scenes/ExemploReel";

export const Root: React.FC = () => (
  <Composition id="ExemploReel" component={ExemploReel} durationInFrames={180} fps={30} width={1080} height={1920} />
);
