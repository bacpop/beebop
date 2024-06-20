type ProbabilityWord =
  | "Almost certainly"
  | "Highly likely"
  | "Very good chance"
  | "Probably"
  | "Unsure"
  | "Probably not"
  | "Unlikely"
  | "Highly unlikely";
const antibioticProbabilityMap: Record<
  string,
  {
    threshold: number;
    word: ProbabilityWord;
  }[]
> = {
  Penicillin: [
    { threshold: 0.9, word: "Highly likely" },
    { threshold: 0.75, word: "Very good chance" },
    { threshold: 0.5, word: "Probably" },
    { threshold: 0.4, word: "Probably not" },
    { threshold: 0.2, word: "Unlikely" },
    { threshold: 0, word: "Highly unlikely" }
  ],
  Chloramphenicol: [
    { threshold: 0.55, word: "Probably" },
    { threshold: 0.5, word: "Unsure" },
    { threshold: 0, word: "Highly unlikely" }
  ],
  Erythromycin: [
    { threshold: 0.5, word: "Almost certainly" },
    { threshold: 0.2, word: "Probably not" },
    { threshold: 0, word: "Highly unlikely" }
  ],
  Tetracycline: [
    { threshold: 0.5, word: "Almost certainly" },
    { threshold: 0, word: "Highly unlikely" }
  ],
  Cotrim: [
    { threshold: 0.8, word: "Almost certainly" },
    { threshold: 0.7, word: "Highly likely" },
    { threshold: 0.5, word: "Very good chance" },
    { threshold: 0.2, word: "Probably not" },
    { threshold: 0, word: "Unlikely" }
  ]
};
const probabilityTransparencies: Record<ProbabilityWord, number> = {
  "Almost certainly": 1,
  "Highly likely": 0.9,
  "Very good chance": 0.8,
  Probably: 0.7,
  Unsure: 0.5,
  "Probably not": 0.3,
  Unlikely: 0.2,
  "Highly unlikely": 0.1
};

export const convertProbabilityToWord = (
  probability: number | string,
  antibiotic: keyof typeof antibioticProbabilityMap
) => {
  if (typeof probability !== "number") {
    return "Unsure";
  }
  const thresholds = antibioticProbabilityMap[antibiotic];
  for (const { threshold, word } of thresholds) {
    if (probability >= threshold) {
      return word;
    }
  }
  return "Unsure";
};

export const getProbabilityColor = (probabilityWord: ProbabilityWord) => {
  // --primary-yellow color
  return `rgb(129, 142, 161, ${probabilityTransparencies[probabilityWord]})`;
};
