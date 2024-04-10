import { server } from "@/mocks/server";
import "@testing-library/jest-dom/vitest";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

/**
 * PrimueVue components causing some issues with its components. thus ignoring this error
 * link to issue: https://github.com/primefaces/primevue/issues/4512
 **/
const originalConsoleError = console.error;
console.error = function (...data) {
  if (typeof data[0]?.toString === "function" && data[0].toString().includes("Error: Could not parse CSS stylesheet"))
    return;
  originalConsoleError(...data);
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vitest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vitest.fn(), // Deprecated
    removeListener: vitest.fn(), // Deprecated
    addEventListener: vitest.fn(),
    removeEventListener: vitest.fn(),
    dispatchEvent: vitest.fn()
  }))
});
