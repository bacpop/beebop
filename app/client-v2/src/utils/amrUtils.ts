const antibioticProbabilityMap = {
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

export const convertProbabilityToWord = (probability: number, antibiotic: keyof typeof antibioticProbabilityMap) => {
  // Translate probabilities into words, depending on antibiotic
  const thresholds = antibioticProbabilityMap[antibiotic];
  for (const { threshold, word } of thresholds) {
    if (probability >= threshold) {
      return word;
    }
  }
};

export const generateRGBForAmr = (value: number, antibiotic: keyof typeof antibioticProbabilityMap) => {
  // Translate probabilities into colours, depending on antibiotic
  let probability = 0;
  if (antibiotic === "Penicillin" || antibiotic === "Cotrim") {
    // achieve more color changes towards the extremes 0&1
    probability = 0.07 * Math.log((Number(value) + 0.0008) / (1 - 0.9992 * Number(value))) + 0.499944067;
  } else if (antibiotic === "Chloramphenicol" || antibiotic === "Tetracycline") {
    // achieve more changes around .5
    probability = Math.exp(40 * Number(value) - 20) / (1 + Math.exp(40 * Number(value) - 20));
  } else {
    probability = value;
  }
  // set targeted colours for values 0 and 1
  const target0 = { r: 165, g: 237, b: 227 }; // light primary color
  const target1 = { r: 25, g: 117, b: 105 }; // dark primary color
  const r = Math.round(target0.r - probability * (target0.r - target1.r));
  const g = Math.round(target0.g - probability * (target0.g - target1.g));
  const b = Math.round(target0.b - probability * (target0.b - target1.b));
  return `rgb(${r},${g},${b},0.8)`;
};
