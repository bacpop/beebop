import {UserStore} from "../../../src/db/userStore";

describe("UserStore", () => {
    const mockRedis = {
        hset: jest.fn()
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("saves project hash", async () => {
        const mockRequest = {
            user: {
                provider: "testProvider",
                id: "testId"
            }
        } as any;

        const sut = new UserStore(mockRedis);
        await sut.saveNewProject(mockRequest, "testProjectHash");
        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        const params = mockRedis.hset.mock.calls[0];
        expect(params[0]).toBe("beebop:user:hash");
        expect(params[1]).toBe("testProvider:testId");
        expect(params[2]).toBe("testProjectHash");
    });

});