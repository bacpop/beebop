import asyncHandler from "../../../src/errors/asyncHandler";

describe("asyncControllerHandler", () => {
    it("calls method", async () => {
        const method = jest.fn();
        const next = jest.fn();
        await asyncHandler(next, method);
        expect(method).toHaveBeenCalledTimes(1);
        expect(next).not.toHaveBeenCalled();
    });

    it("handles error by calling next", async () => {
        const error = { message: "test error" };
        const method = jest.fn().mockImplementation(() => { throw error; });
        const next = jest.fn();
        await asyncHandler(next, method);
        expect(next).toHaveBeenCalledWith(error);
    });
});