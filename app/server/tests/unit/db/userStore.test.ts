import {UserStore} from "../../../src/db/userStore";
import { JSONUtils } from "../../../src/utils/jsonUtils";

describe("UserStore", () => {
    const mockRedis = {
        hset: jest.fn(),
        lpush: jest.fn(),
        sadd: jest.fn(),
        hget: jest.fn(),
        hgetall: jest.fn(),
        lrange: jest.fn().mockImplementation(() => ["123", "456"]),
        hmget: jest.fn().mockImplementation((key: string, ...valueNames: string[]) => {
            return valueNames.map((valueName) => valueName === "timestamp" ? 1687879913811 : `${valueName} for ${key}`);
        }),
        scard: jest.fn().mockImplementation(() => 2)
    } as any;

    const mockRequest = {
        user: {
            provider: "testProvider",
            id: "testId"
        }
    } as any;

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date(1687879913811));
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it("saves new project data", async () => {
        const sut = new UserStore(mockRedis);
        await sut.saveNewProject(mockRequest, "test project name");
        expect(mockRedis.lpush).toHaveBeenCalledTimes(1);
        expect(mockRedis.lpush.mock.calls[0][0]).toBe("beebop:userprojects:testProvider:testId");
        const projectId = mockRedis.lpush.mock.calls[0][1];
        expect(projectId.length).toBe(32);

        expect(mockRedis.hset).toHaveBeenCalledTimes(2);
        expect(mockRedis.hset).toHaveBeenNthCalledWith(1, `beebop:project:${projectId}`, "name", "test project name");
        expect(mockRedis.hset).toHaveBeenNthCalledWith(2, `beebop:project:${projectId}`, "timestamp", 1687879913811);
    });

    it("renames project", async () => {
        const sut = new UserStore(mockRedis);
        await sut.renameProject(mockRequest, "testProjectId", "new proj name");
        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis.hset.mock.calls[0][0]).toBe("beebop:project:testProjectId");
        expect(mockRedis.hset.mock.calls[0][1]).toBe("name");
        expect(mockRedis.hset.mock.calls[0][2]).toBe("new proj name");
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
            {
                id: "123",
                name: "name for beebop:project:123",
                hash: "hash for beebop:project:123",
                timestamp: 1687879913811,
                samplesCount: 2
            },
            {
                id: "456",
                name: "name for beebop:project:456",
                hash: "hash for beebop:project:456",
                timestamp: 1687879913811,
                samplesCount: 2
            }
        ]);

        expect(mockRedis.lrange).toHaveBeenCalledTimes(1);
        expect(mockRedis.lrange.mock.calls[0][0]).toBe("beebop:userprojects:testProvider:testId");
        expect(mockRedis.lrange.mock.calls[0][1]).toBe(0);
        expect(mockRedis.lrange.mock.calls[0][2]).toBe(-1);
        expect(mockRedis.scard).toHaveBeenCalledTimes(2);
        expect(mockRedis.scard).toHaveBeenNthCalledWith(1, "beebop:project:123:samples");
        expect(mockRedis.scard).toHaveBeenNthCalledWith(2, "beebop:project:456:samples");
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

    it("gets AMR data", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const fileName = "test.fa";
        const expectedSampleId = (sut as any)._sampleId(sampleHash, fileName);
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, expectedSampleId);
        const expectedAMRString = JSON.stringify({ key: "value" });
        const expectedAMR = JSONUtils.safeParseJSON(expectedAMRString);
    
        mockRedis.hget.mockImplementation(() => expectedAMRString);
    
        const result = await sut.getAMR(projectId, sampleHash, fileName);
    
        expect(mockRedis.hget).toHaveBeenCalledTimes(1);
        expect(mockRedis.hget.mock.calls[0][0]).toBe(expectedProjectSampleKey);
        expect(mockRedis.hget.mock.calls[0][1]).toBe("amr");
        expect(result).toStrictEqual(expectedAMR);
    });

    it("gets project samples", async() => {
        const mockProjectRedis = {
            smembers: jest.fn().mockImplementation(() => ["1234:test1.fa", "5678:test2.fa"])
        } as any;
        const sut = new UserStore(mockProjectRedis);
        const result = await sut.getProjectSplitSampleIds("testProjectId");
        expect(mockProjectRedis.smembers).toHaveBeenCalledWith("beebop:project:testProjectId:samples");
        expect(result).toStrictEqual([
            { hash: "1234", filename: "test1.fa" },
            { hash: "5678", filename: "test2.fa" }
        ]);
    });

    it("gets base project info", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const expectedProjectKey = `beebop:project:${projectId}`;
        const expectedProjectInfo = {
            name: "Test Project",
            hash: "testHash",
            timestamp: "1687879913811"
        };
    
        mockRedis.hgetall.mockImplementation(() => expectedProjectInfo);
    
        const result = await sut.getBaseProjectInfo(projectId);
    
        expect(mockRedis.hgetall).toHaveBeenCalledTimes(1);
        expect(mockRedis.hgetall.mock.calls[0][0]).toBe(expectedProjectKey);
        expect(result).toStrictEqual(expectedProjectInfo);
    });

    it("saves sketch data", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const filename = "test.fa";
        const sketch = { key: "value" };
        const sampleId = (sut as any)._sampleId(sampleHash, filename);
        const expectedProjectSamplesKey = (sut as any)._projectSamplesKey(projectId);
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, sampleId);
        const expectedSketchString = JSONUtils.safeStringify(sketch);
    
        await sut.saveSketch(projectId, sampleHash, filename, sketch);
    
        expect(mockRedis.sadd).toHaveBeenCalledTimes(1);
        expect(mockRedis.sadd.mock.calls[0][0]).toBe(expectedProjectSamplesKey);
        expect(mockRedis.sadd.mock.calls[0][1]).toBe(sampleId);
    
        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis.hset.mock.calls[0][0]).toBe(expectedProjectSampleKey);
        expect(mockRedis.hset.mock.calls[0][1]).toBe("sketch");
        expect(mockRedis.hset.mock.calls[0][2]).toBe(expectedSketchString);
    });

    it("gets sketch data", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const fileName = "test.fa";
        const expectedSampleId = (sut as any)._sampleId(sampleHash, fileName);
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, expectedSampleId);
        const expectedSketchString = JSON.stringify({ key: "value" });
        const expectedSketch = JSONUtils.safeParseJSON(expectedSketchString);
    
        mockRedis.hget.mockImplementation(() => expectedSketchString);
    
        const result = await sut.getSketch(projectId, sampleHash, fileName);
    
        expect(mockRedis.hget).toHaveBeenCalledTimes(1);
        expect(mockRedis.hget.mock.calls[0][0]).toBe(expectedProjectSampleKey);
        expect(mockRedis.hget.mock.calls[0][1]).toBe("sketch");
        expect(result).toStrictEqual(expectedSketch);
    });

    it("gets sample data", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const fileName = "test.fa";
        const expectedSampleId = (sut as any)._sampleId(sampleHash, fileName);
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, expectedSampleId);
        const expectedSketchString = JSON.stringify({ key: "value" });
        const expectedAMRString = JSON.stringify({ key: "value" });
        const expectedSketch = JSONUtils.safeParseJSON(expectedSketchString);
        const expectedAMR = JSONUtils.safeParseJSON(expectedAMRString);
    
        mockRedis.hgetall.mockImplementation(() => ({ sketch: expectedSketchString, amr: expectedAMRString }));
    
        const result = await sut.getSample(projectId, sampleHash, fileName);
    
        expect(mockRedis.hgetall).toHaveBeenCalledTimes(1);
        expect(mockRedis.hgetall.mock.calls[0][0]).toBe(expectedProjectSampleKey);
        expect(result).toStrictEqual({ sketch: expectedSketch, amr: expectedAMR });
    });
});