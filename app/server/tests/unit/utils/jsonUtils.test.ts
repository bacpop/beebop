import { JSONUtils } from "../../../src/utils/jsonUtils";

describe("JSONUtils", () => {
  describe("safeParseJSON", () => {
    it("should parse a valid JSON string", () => {
      const jsonString = '{"key": "value"}';
      const result = JSONUtils.safeParseJSON(jsonString);
      expect(result).toEqual({ key: "value" });
    });

    it("should throw error for an invalid JSON string", () => {
      const jsonString = "{key: value}";
      expect(() => {
        JSONUtils.safeParseJSON(jsonString);
      }).toThrow();
    });
  });

  describe("safeStringify", () => {
    it("should stringify a valid object", () => {
      const obj = { key: "value" };
      const result = JSONUtils.safeStringify(obj);
      expect(result).toBe('{"key":"value"}');
    });

    it("should throw error for an object that throws an error when stringified", () => {
      const obj = {};
      (obj as any).self = obj;
      expect(() => {
        JSONUtils.safeStringify(obj);
      }).toThrow();
    });
  });
});
