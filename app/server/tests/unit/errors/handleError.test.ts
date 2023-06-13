import {BeebopError} from "../../../src/errors/beebopError";
import {handleError} from "../../../src/errors/handleError";

describe("handleError", () => {
    const mockReq = {} as any;
    const mockRes = {
        status: jest.fn(),
        send: jest.fn()
    } as any;
    mockRes.status.mockImplementation(() => mockRes);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("handles BeebopError", () => {
        const error = new BeebopError("test error type", "test error msg", 400);
        error.stack = "test stack";
        handleError(error, mockReq, mockRes, jest.fn());
        expect(mockReq.errorType).toBe("test error type");
        expect(mockReq.errorDetail).toBe("test error msg");
        expect(mockReq.errorStack).toBe("test stack");

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
            status: "failure",
            errors: [
                {error: "test error type", detail: "test error msg"}
            ],
            data: null
        });
    });

    it("handles unexpected error", () => {
        const error = Error("oh no");
        error.stack = "test stack";
        handleError(error, mockReq, mockRes, jest.fn());
        expect(mockReq.errorType).toBe("Unexpected error");
        expect(mockReq.errorDetail).toMatch(/An unexpected error occurred. Please contact support and quote error code [a-z0-9]{11}/);
        expect(mockReq.errorStack).toBe("test stack");

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            status: "failure",
            errors: [
                {error: "Unexpected error", detail: mockReq.errorDetail}
            ],
            data: null
        });
    });
});