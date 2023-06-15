import * as handleErrorModule from "../src/errors/handleError";
import {BeebopError} from "../src/errors/beebopError";
import {handleAPIError} from "../src/utils";
import {mockResponse} from "./unit/utils";

describe("handleAPIError", () => {
    const handleErrorSpy = jest.spyOn(handleErrorModule, "handleError");

    const req = {} as any;
    const res = mockResponse();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectHandledError = (errorType: string, errorMessage: string, status: number, expectBeebopError: boolean) => {
        const handledError = handleErrorSpy.mock.calls[0][0] as any;
        expect(handledError instanceof BeebopError).toBe(expectBeebopError);
        expect(handledError.errorType).toBe(errorType);
        expect(handledError.message).toBe(errorMessage);
        expect(handledError.status).toBe(status);

        expect(handleErrorSpy.mock.calls[0][1]).toBe(req);
        expect(handleErrorSpy.mock.calls[0][2]).toBe(res);
        expect(handleErrorSpy.mock.calls[0][3]).toBe(null);
    };

    it("Handles well-formed error from API", () => {
        const error = {
            response: {
                status: 400,
                data: {
                    error: {
                        errors: [
                            {error: "Bad request", detail: "Requested data does not exist"}
                        ]
                    }
                }
            }
        } as any;

        handleAPIError(req, res, error);
        expectHandledError("Bad request", "Requested data does not exist", 400, true);
    });


    it("Handles malformed error from API", () => {
        const error = {
            response: {
                status: 400,
                data: "some nonsense"
            }
        } as any;

        handleAPIError(req, res, error);
        expectHandledError("Malformed response from API", "The API returned a response which could not be parsed", 400, true);
    });

    it("Handles API connection error", () => {
        const error = {
            response: null,
            toString: () => "Connection refused"
        } as any;
        handleAPIError(req, res, error);
        expectHandledError(undefined, "Could not connect to API: Connection refused", undefined, false);
    });
});
