export class JSONUtils {
  public static safeParseJSON(jsonString?: string) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error("Error parsing JSON:", error);
    }
  }

  public static safeStringify(obj): string | null {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      throw new Error("Error stringifying object:", error);
    }
  }
}
