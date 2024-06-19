import { convertProbabilityToWord, getProbabilityColor } from "@/utils/amrDisplayUtils";

describe("amrUtils", () => {
  describe("convertProbabilityToWord", () => {
    it.each([
      [0.95, "Penicillin", "Highly likely"],
      [0.75, "Penicillin", "Very good chance"],
      [0.6, "Penicillin", "Probably"],
      [0.4, "Penicillin", "Probably not"],
      [0.2, "Penicillin", "Unlikely"],
      [0.1, "Penicillin", "Highly unlikely"],

      [0.55, "Chloramphenicol", "Probably"],
      [0.53, "Chloramphenicol", "Unsure"],
      [0.3, "Chloramphenicol", "Highly unlikely"],

      [0.5, "Erythromycin", "Almost certainly"],
      [0.2, "Erythromycin", "Probably not"],
      [0.1, "Erythromycin", "Highly unlikely"],

      [0.55, "Tetracycline", "Almost certainly"],
      [0.2, "Tetracycline", "Highly unlikely"],

      [0.8, "Cotrim", "Almost certainly"],
      [0.7, "Cotrim", "Highly likely"],
      [0.5, "Cotrim", "Very good chance"],
      [0.2, "Cotrim", "Probably not"],
      [0.05, "Cotrim", "Unlikely"],
      ["not a number", "Cotrim", "Unsure"]
    ])("should return the correct word for given probability %d for %s", (probability, antibiotic, expected) => {
      expect(convertProbabilityToWord(probability, antibiotic as any)).toBe(expected);
    });
  });
  describe("getProbabilityColor", () => {
    it.each([
      ["Almost certainly", "rgb(129, 142, 161, 1)"],
      ["Highly likely", "rgb(129, 142, 161, 0.9)"],
      ["Very good chance", "rgb(129, 142, 161, 0.8)"],
      ["Probably", "rgb(129, 142, 161, 0.7)"],
      ["Unsure", "rgb(129, 142, 161, 0.5)"],
      ["Probably not", "rgb(129, 142, 161, 0.3)"],
      ["Unlikely", "rgb(129, 142, 161, 0.2)"],
      ["Highly unlikely", "rgb(129, 142, 161, 0.1)"]
    ])("for given probability word %s return rgb value: %s", (probabilityValue, expected) => {
      expect(getProbabilityColor(probabilityValue as any)).toBe(expected);
    });
  });
});
