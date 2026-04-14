import { DESIGN_RESOURCE_DISPLAY } from "@/components/design/designResourcePaths";

export type DisplaySvgText = {
  src: string;
  width: number;
  height: number;
};

const svg = (name: string, width: number, height: number): DisplaySvgText => ({
  src: `${DESIGN_RESOURCE_DISPLAY}/${name}.svg`,
  width,
  height,
});

export const DISPLAY_TITLE = {
  homeMain: svg("text-title-7", 249, 92),
  step1: svg("text-title-4", 200, 32),
  step2: svg("text-title-5", 200, 32),
  step3: svg("text-title-6", 200, 32),
  step3Calculating: svg("text-title-3", 237, 80),
  resultComplete: svg("text-title-8", 150, 40),
  resultBalanced: svg("text-title-9", 257, 40),
  resultHigh: svg("text-title-10", 208, 40),
  resultLow: svg("text-title-11", 187, 40),
} as const;

export const DISPLAY_BUTTON = {
  start: svg("text-button-1", 81, 32),
  prev: svg("text-button-2", 54, 32),
  next: svg("text-button-3", 54, 32),
  result: svg("text-button-5", 86, 32),
  retry: svg("text-button-6", 86, 32),
  share: svg("text-button-5", 86, 32),
} as const;

export const DISPLAY_CARD = {
  foodAnalysis: svg("text-card-1", 103, 20),
  weightGuide: svg("text-card-2", 119, 20),
  activity: svg("text-card-3", 99, 20),
} as const;
