import {UserStore} from "../../../src/db/userStore";

describe("UserStore", () => {
    const mockRedis = {
        hset: jest.fn()
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("saves new project data", async () => {
        const mockRequest = {
            user: {
                provider: "testProvider",
                id: "testId"
            }
        } as any;

        const sut = new UserStore(mockRedis);
        await sut.saveNewProject(mockRequest, "testProjectHash", "test project name");
        expect(mockRedis.hset).toHaveBeenCalledTimes(2);
        const setUserHashParams = mockRedis.hset.mock.calls[0];
        expect(setUserHashParams[0]).toBe("beebop:user:hash");
        expect(setUserHashParams[1]).toBe("testProvider:testId");
        expect(setUserHashParams[2]).toBe("testProjectHash")
        const setProjectNameParams = mockRedis.hset.mock.calls[1];
        expect(setProjectNameParams[0]).toBe("beebop:userproject:name");
        expect(setProjectNameParams[1]).toBe("testProvider:testId:testProjectHash");
        expect(setProjectNameParams[2]).toBe("test project name");
    });

});