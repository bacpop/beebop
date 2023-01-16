import {UserStore} from "../../../src/db/userStore";

describe("UserStore", () => {
    const mockRedis = {
        hset: jest.fn(),
        lpush: jest.fn(),
        llen: jest.fn().mockImplementation(() => 2),
        lrange: jest.fn().mockImplementation(() => ["123", "456"]),
        hget: jest.fn().mockImplementation((key: string, valueName: string) => `${valueName} for ${key}`)
    } as any;

    const mockRequest = {
        user: {
            provider: "testProvider",
            id: "testId"
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("saves new project data", async () => {
        const sut = new UserStore(mockRedis);
        await sut.saveNewProject(mockRequest, "testProjectHash", "test project name");
        expect(mockRedis.lpush).toHaveBeenCalledTimes(1);
        expect(mockRedis.lpush.mock.calls[0][0]).toBe("beebop:user:hashes:testProvider:testId");
        expect(mockRedis.lpush.mock.calls[0][1]).toBe("testProjectHash");

        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis.hset.mock.calls[0][0]).toBe("beebop:userproject:testProvider:testId:testProjectHash");
        expect(mockRedis.hset.mock.calls[0][1]).toBe("name");
        expect(mockRedis.hset.mock.calls[0][2]).toBe("test project name");
    });

    it("gets user projects", async () => {
        const sut = new UserStore(mockRedis);
        const result = await sut.getUserProjects(mockRequest);
        expect(result).toStrictEqual([
            {hash: "123", name: "name for beebop:userproject:testProvider:testId:123"},
            {hash: "456", name: "name for beebop:userproject:testProvider:testId:456"}
        ]);

        expect(mockRedis.llen).toHaveBeenCalledTimes(1);
        expect(mockRedis.llen.mock.calls[0][0]).toBe("beebop:user:hashes:testProvider:testId");
        expect(mockRedis.lrange).toHaveBeenCalledTimes(1);
        expect(mockRedis.lrange.mock.calls[0][0]).toBe("beebop:user:hashes:testProvider:testId");
        expect(mockRedis.lrange.mock.calls[0][1]).toBe(0);
        expect(mockRedis.lrange.mock.calls[0][2]).toBe(1);
    });

});