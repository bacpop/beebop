import { convertToRoundedPercent } from "@/utils/math";

describe("convertToRoundedPercent", () => {
  it("should round the value to the nearest percent", () => {
    expect(convertToRoundedPercent(0.123)).toBe(12);
    expect(convertToRoundedPercent(0.456)).toBe(46);
    expect(convertToRoundedPercent(0.789)).toBe(79);
  });

  it("should handle negative values", () => {
    expect(convertToRoundedPercent(-0.123)).toBe(-12);
    expect(convertToRoundedPercent(-0.456)).toBe(-46);
    expect(convertToRoundedPercent(-0.789)).toBe(-79);
  });

  it("should handle zero", () => {
    expect(convertToRoundedPercent(0)).toBe(0);
  });
});
