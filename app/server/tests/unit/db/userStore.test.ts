import {UserStore} from "../../../src/db/userStore";

describe("UserStore", () => {
    const mockRedis = {
        hset: jest.fn(),
        lpush: jest.fn(),
        sadd: jest.fn(),
        lrange: jest.fn().mockImplementation(() => ["123", "456"]),
        hmget: jest.fn().mockImplementation((key: string, ...valueNames: string[]) => {
            return valueNames.map((valueName) => `${valueName} for ${key}`);
        })
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
        await sut.saveNewProject(mockRequest, "test project name");
        expect(mockRedis.lpush).toHaveBeenCalledTimes(1);
        expect(mockRedis.lpush.mock.calls[0][0]).toBe("beebop:userprojects:testProvider:testId");
        const projectId = mockRedis.lpush.mock.calls[0][1];
        expect(projectId.length).toBe(32);

        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis.hset.mock.calls[0][0]).toBe(`beebop:project:${projectId}`);
        expect(mockRedis.hset.mock.calls[0][1]).toBe("name");
        expect(mockRedis.hset.mock.calls[0][2]).toBe("test project name");
    });

    it("saves project hash", async () => {
        const sut = new UserStore(mockRedis);
        await sut.saveProjectHash(mockRequest, "testProjectId", "testProjectHash");
        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis.hset.mock.calls[0][0]).toBe("beebop:project:testProjectId");
        expect(mockRedis.hset.mock.calls[0][1]).toBe("hash");
        expect(mockRedis.hset.mock.calls[0][2]).toBe("testProjectHash");
    });

    it("gets user projects", async () => {
        const sut = new UserStore(mockRedis);
        const result = await sut.getUserProjects(mockRequest);
        expect(result).toStrictEqual([
            {id: "123", name: "name for beebop:project:123", hash: "hash for beebop:project:123"},
            {id: "456", name: "name for beebop:project:456", hash: "hash for beebop:project:456"}
        ]);

        expect(mockRedis.lrange).toHaveBeenCalledTimes(1);
        expect(mockRedis.lrange.mock.calls[0][0]).toBe("beebop:userprojects:testProvider:testId");
        expect(mockRedis.lrange.mock.calls[0][1]).toBe(0);
        expect(mockRedis.lrange.mock.calls[0][2]).toBe(-1);
    });

    it("saves amr data", async () => {
        const sut = new UserStore(mockRedis);
        const testAMR = {
            filename: "testfile.fa",
            Penicillin: 0.1,
        };

        const expectedSamplesKey = "beebop:project:testProjectId:samples";
        const expectedSampleId = "1234:testfile.fa";
        const expectedSampleKey = `beebop:project:testProjectId:sample:${expectedSampleId}`;

        await sut.saveAMR("testProjectId", "1234", testAMR as any);
        expect(mockRedis.sadd).toHaveBeenCalledWith(expectedSamplesKey, expectedSampleId);
        expect(mockRedis.hset).toHaveBeenCalledWith(expectedSampleKey, "amr", JSON.stringify(testAMR));
    });

    it("gets amr data", async () => {
        const mockAMR = {Pencicillin: 0.5};
        const mockAMRRedis = {
            hget: jest.fn().mockImplementation(() => JSON.stringify(mockAMR))
        } as any;

        const sut = new UserStore(mockAMRRedis);
        const result = await sut.getAMR("testProjectId", "1234", "test.fa");
        expect(mockAMRRedis.hget).toHaveBeenCalledWith("beebop:project:testProjectId:sample:1234:test.fa", "amr");
        expect(result).toStrictEqual(mockAMR);
    });

    it("gets project samples", async() => {
        const mockProjectRedis = {
            smembers: jest.fn().mockImplementation(() => ["1234:test1.fa", "5678:test2.fa"])
        } as any;
        const sut = new UserStore(mockProjectRedis);
        const result = await sut.getProjectSamples("testProjectId");
        expect(mockProjectRedis.smembers).toHaveBeenCalledWith("beebop:project:testProjectId:samples");
        expect(result).toStrictEqual([
            { hash: "1234", filename: "test1.fa" },
            { hash: "5678", filename: "test2.fa" }
        ]);
    });
});