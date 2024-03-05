// FILEPATH: /home/athapar/code/beebop/app/client-v2/src/config.test.ts

import { getApiUrl } from "@/config";

describe("getApiUrl", () => {
  it("should return localhost url when in development mode", () => {
    // Setup
    const originalEnv = process.env;
    process.env = { ...originalEnv, MODE: "development" };

    // Exercise
    const result = getApiUrl();

    // Verify
    expect(result).toEqual("http://localhost:4000");

    // Teardown
    process.env = originalEnv;
  });

  it("should return empty string when in test mode", () => {
    // Setup
    const originalEnv = process.env;
    process.env = { ...originalEnv, MODE: "test" };

    // Exercise
    const result = getApiUrl();

    // Verify
    expect(result).toEqual("");

    // Teardown
    process.env = originalEnv;
  });

  it("should return api url when in production mode", () => {
    // Setup
    const originalEnv = process.env;
    process.env = { ...originalEnv, MODE: "production" };
    Object.defineProperty(window, "location", {
      value: {
        host: "example.com"
      },
      writable: true
    });

    // Exercise
    const result = getApiUrl();

    // Verify
    expect(result).toEqual("https://example.com/api");

    // Teardown
    process.env = originalEnv;
  });
});
