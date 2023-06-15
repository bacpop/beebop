// mock morgan before import logging
const mockMorganResult = {};
const mockMorgan = jest.fn().mockReturnValue(mockMorganResult);
const mockMorganToken = jest.fn();
(mockMorgan as any).token = mockMorganToken;
jest.mock("morgan", () => mockMorgan);

import { initialiseLogging } from "../src/logging";

describe("initialiseLogging", () => {
    it("initialises morgan", () => {
        const mockApp = { use: jest.fn() } as any;
        initialiseLogging(mockApp);

        // Test custom tokens have been registered
        const testRequest = {
            errorType: "TEST ERROR TYPE",
            errorDetail: "TEST ERROR DETAIL",
            errorStack: "TEST ERROR STACK"
        };

        expect(mockMorganToken.mock.calls[0][0]).toBe("error-type");
        const errorTypeFn = mockMorganToken.mock.calls[0][1];
        expect(errorTypeFn(testRequest)).toBe("TEST ERROR TYPE");

        expect(mockMorganToken.mock.calls[1][0]).toBe("error-detail");
        const errorDetailFn = mockMorganToken.mock.calls[1][1];
        expect(errorDetailFn(testRequest)).toBe("TEST ERROR DETAIL");

        expect(mockMorganToken.mock.calls[2][0]).toBe("error-stack");
        const errorStackFn = mockMorganToken.mock.calls[2][1];
        expect(errorStackFn(testRequest)).toBe("TEST ERROR STACK");

        // Test expected custom format has been registered
        expect(mockApp.use.mock.calls[0][0]).toBe(mockMorganResult);
        const customFormatFn = mockMorgan.mock.calls[0][0];

        const testReq = {
            remoteAddr: "remoteReq",
            remoteUser: "remoteUReq",
            method: "methodReq",
            url: "urlReq",
            status: "statusReq",
            res: "resReq",
            time: "timeReq",
            errorType: "errTypeReq",
            errorDetail: "errDetailReq",
            errorStack: "errStackReq"
        };

        const testRes = {
            remoteAddr: "remoteRes",
            remoteUser: "remoteURes",
            method: "methodRes",
            url: "urlRes",
            status: "statusRes",
            res: "resRes",
            time: "timeRes"
        };

        const tokens = {
            "remote-addr": (req: any, res: any) => `${req.remoteAddr}:${res.remoteAddr}`,
            "remote-user": (req: any, res: any) => `${req.remoteUser}:${res.remoteUser}`,
            method: (req: any, res: any) => `${req.method}:${res.method}`,
            url: (req: any, res: any) => `${req.url}:${res.url}`,
            status: (req: any, res: any) => `${req.status}:${res.status}`,
            res: (req: any, res: any, name: string) => `${req.res}:${res.res}:${name}`,
            "response-time": (req: any, res: any) => `${req.time}:${res.time}`,
            "error-type": (req: any) => req.errorType,
            "error-detail": (req: any) => req.errorDetail,
            "error-stack": (req: any) => req.errorStack
        };

        const expectedLog = "remoteReq:remoteRes remoteUReq:remoteURes methodReq:methodRes urlReq:urlRes "
            + "statusReq:statusRes resReq:resRes:content-length - timeReq:timeRes ms "
            + "errTypeReq errDetailReq errStackReq";
        const customLog = customFormatFn(tokens, testReq, testRes);
        expect(customLog).toEqual(expectedLog);
    });
});