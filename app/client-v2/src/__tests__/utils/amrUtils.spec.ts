import { convertProbabilityToWord, generateRGBForAmr } from "@/utils/amrUtils";

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
      [0.05, "Cotrim", "Unlikely"]
    ])("should return the correct word for given probability %d for %s", (probability, antibiotic, expected) => {
      expect(convertProbabilityToWord(probability, antibiotic as any)).toBe(expected);
    });
  });
  describe("generateRGBForAmr", () => {
    it.each([
      [0.95, "Penicillin", "rgb(66,152,141)"],
      [0.5, "Chloramphenicol", "rgb(95,177,166)"],
      [0.1, "Erythromycin", "rgb(151,225,215)"],
      [0.6, "Tetracycline", "rgb(28,119,107)"],
      [0.7, "Cotrim", "rgb(87,170,159)"]
    ])("should return the correct RGB value for given value %d and antibiotic %s", (value, antibiotic, expected) => {
      expect(generateRGBForAmr(value, antibiotic as any)).toBe(expected);
    });
  });
});
