/* eslint-disable no-console */
import { api } from "../../src/apiService";
import {
    mockAxios, mockError, mockFailure, mockSuccess, mockRootState
} from "../mocks";
import Mock = jest.Mock;

const rootState = mockRootState();

describe("ApiService", () => {
    const TEST_ROUTE = "/test";
    const TEST_BODY = "test body";

    beforeEach(() => {
        console.log = jest.fn();
        console.warn = jest.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as jest.Mock).mockClear();
        (console.warn as jest.Mock).mockClear();
        jest.clearAllMocks();
    });

    const expectNoErrorHandlerMsgLogged = () => {
        expect((console.warn as jest.Mock).mock.calls[0][0])
            .toBe(`No error handler registered for request ${TEST_ROUTE}.`);
    };

    const expectCommitsErrorMessage = (commit: Mock, errorMessage: string) => {
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "addError",
            payload: mockError(errorMessage)
        });
    };

    const expectCommitsDefaultErrorMessage = (commit: Mock) => {
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "addError",
            payload: {
                error: "MALFORMED_RESPONSE",
                detail: "API response failed but did not contain any error information. Please contact support."
            }
        });
    };

    it("console logs error on get", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        await api({ commit: jest.fn(), rootState } as any)
            .get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();

        expect((console.log as jest.Mock).mock.calls[0][0].errors[0].detail)
            .toBe("some error message");
    });

    it("console logs error on post", async () => {
        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(500, mockFailure("some error message"));

        await api({ commit: jest.fn(), rootState } as any)
            .post(TEST_ROUTE, TEST_BODY);

        expectNoErrorHandlerMsgLogged();

        expect((console.log as jest.Mock).mock.calls[0][0].errors[0].detail)
            .toBe("some error message");
    });

    it("commits the the first error message to errors module by default on get", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();

        await api({ commit, rootState } as any)
            .get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();
        expectCommitsErrorMessage(commit, "some error message");
    });

    it("commits the the first error message to errors module by default on post", async () => {
        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();

        await api({ commit, rootState } as any)
            .post(TEST_ROUTE, TEST_BODY);

        expectNoErrorHandlerMsgLogged();
        expectCommitsErrorMessage(commit, "some error message");
    });

    it("if no first error message, commits a default error message to errors module by default on get", async () => {
        const failure = {
            data: {},
            status: "failure",
            errors: []
        };
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, failure);

        const commit = jest.fn();

        await api({ commit, rootState } as any)
            .get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();
        expectCommitsDefaultErrorMessage(commit);
    });

    it("if no first error message, commits a default error message to errors module by default on post", async () => {
        const failure = {
            data: {},
            status: "failure",
            errors: []
        };
        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(500, failure);

        const commit = jest.fn();

        await api({ commit, rootState } as any)
            .post(TEST_ROUTE, TEST_BODY);

        expectNoErrorHandlerMsgLogged();
        expectCommitsDefaultErrorMessage(commit);
    });

    it("commits the first error with the specified type if well formatted on get", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();

        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR", detail: "some error message" });
    });

    it("commits the first error with the specified type if well formatted on post", async () => {
        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();

        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR", detail: "some error message" });
    });

    it("commits the error type if the error detail is missing on get", async () => {
        const mockFailureNoDetail = {
            data: null,
            status: "failure",
            errors: [{ error: "OTHER_ERROR" }]
        };

        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailureNoDetail);

        console.log(mockFailure(null as any));

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR" });
    });

    it("commits the error type if the error detail is missing on post", async () => {
        const mockFailureNoDetail = {
            data: null,
            status: "failure",
            errors: [{ error: "OTHER_ERROR" }]
        };

        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(500, mockFailureNoDetail);

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR" });
    });

    it('resets microreact Token if receiving "Wrong Token" Error', async () => {
        const mockFailureNoDetail = {
            data: null,
            status: "failure",
            errors: [{ error: "Wrong Token" }]
        };

        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(500, mockFailureNoDetail);

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(commit.mock.calls[0][0]).toBe("setToken");
        expect(commit.mock.calls[0][1]).toStrictEqual(null);
        expect(commit.mock.calls[1][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[1][1]).toStrictEqual({ error: "Wrong Token" });
    });

    it("commits the success response with the specified type on get", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess("test data"));

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
    });

    it("commits the success response with the specified type on post", async () => {
        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(200, mockSuccess("test data"));

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
    });

    it("commits the success response with the specified type with root true", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess("test data"));

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
    });

    it("commits the error response with the specified type with root true", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("TEST ERROR"));

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1].detail).toBe("TEST ERROR");
    });

    it("get returns the response object", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess("TEST"));

        const commit = jest.fn();
        const response = await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(response).toStrictEqual({ data: "TEST", errors: null, status: "success" });
    });

    it("post returns the response object", async () => {
        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(200, mockSuccess("TEST"));

        const commit = jest.fn();
        const response = await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(response).toStrictEqual({ data: "TEST", errors: null, status: "success" });
    });

    it("post sets Content-Type header", async () => {
        mockAxios.onPost(TEST_ROUTE, TEST_BODY)
            .reply(200, mockSuccess("TEST"));
        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(mockAxios.history.post[0].headers!["Content-Type"]).toBe("application/json");
    });

    async function expectCouldNotParseAPIResponseError() {
        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .get(TEST_ROUTE);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "addError",
            payload: {
                error: "MALFORMED_RESPONSE",
                detail: "Could not parse API response. Please contact support."
            }
        });
    }

    it("commits parse error if API response is null", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500);

        await expectCouldNotParseAPIResponseError();
    });

    it("commits parse error if API response status is missing", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, { data: {}, errors: [] });

        await expectCouldNotParseAPIResponseError();
    });

    it("commits parse error if API response errors are missing", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, { data: {}, status: "failure" });

        await expectCouldNotParseAPIResponseError();
    });

    it("commits parse error if API response is valid BeebopResponse format", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, { data: {}, status: "failure", errors: [{ error: "error text", detail: "detail text" }] });

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .get(TEST_ROUTE);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "addError",
            payload: {
                error: "error text",
                detail: "detail text"
            }
        });
    });

    it("does nothing on error if ignoreErrors is true", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();
        await api({ commit, rootState } as any)
            .withSuccess("whatever")
            .ignoreErrors()
            .get(TEST_ROUTE);

        expect((console.warn as jest.Mock).mock.calls.length).toBe(0);
        expect(commit.mock.calls.length).toBe(0);
    });

    it("warns if error and success handlers are not set", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess(true));

        await api({ commit: jest.fn(), rootState } as any)
            .get(TEST_ROUTE);

        const warnings = (console.warn as jest.Mock).mock.calls;

        expectNoErrorHandlerMsgLogged();
        expect(warnings[1][0]).toBe(`No success handler registered for request ${TEST_ROUTE}.`);
    });
});
