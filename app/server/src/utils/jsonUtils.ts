
export class JSONUtils {
    public static safeParseJSON(jsonString?: string) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return null;
        }
    }

    public static safeStringify(obj): string | null {
        try {
            return JSON.stringify(obj);
        } catch (error) {
            console.error("Error stringifying object:", error);
            return null;
        }
    }
}
