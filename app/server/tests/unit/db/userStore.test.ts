import {UserStore} from "../../../src/db/userStore";

describe("UserStore", () => {
  const mockChainableCommander = {
    hset: jest.fn(),
    exec: jest.fn().mockResolvedValue(true)
  }
    const mockRedis = {
        hset: jest.fn(),
        lpush: jest.fn(),
        sadd: jest.fn(),
        hget: jest.fn(),
        hgetall: jest.fn().mockImplementation((key: string) => {
            const valueNames = ["id", "name", "samples", "timestamp", "hash", "status", ...(key === "beebop:project:789" ? ["deletedAt"] : [])];
            return valueNames.reduce((acc, v) => ({...acc, [v]: (v === "timestamp" || v === "deletedAt") ? 1687879913811 : `${v} for ${key}`}), {});
        }),
        lrange: jest.fn().mockImplementation(() => ["123", "456", "789"]),
        scard: jest.fn().mockImplementation(() => 2),
        smembers: jest.fn(),
        srem: jest.fn(),
        del: jest.fn(),
        multi: jest.fn().mockReturnValue(mockChainableCommander)
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

    it("does not rename a project if it has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.renameProject(mockRequest, "789", "new proj name")).rejects.toThrow("This project has been deleted");
        expect(mockRedis.hset).not.toHaveBeenCalled();
    });

    it("saves project hash and samples hasRun flag", async () => {
        const sut = new UserStore(mockRedis);
        const sampleNames = {"sampleHash": "sampleFileName"}
        await sut.saveHashAndSamplesRun(mockRequest, "testProjectId", "testProjectHash", sampleNames);

        expect(mockRedis.multi).toHaveBeenCalledTimes(1);
        expect(mockChainableCommander.exec).toHaveBeenCalledTimes(1);
        expect(mockChainableCommander.hset.mock.calls[0]).toEqual(["beebop:project:testProjectId:sample:sampleHash:sampleFileName", "hasRun", 1]);
        expect(mockChainableCommander.hset.mock.calls[1]).toEqual(["beebop:project:testProjectId", "hash", "testProjectHash"]);
    });

    it("does not save project hash if it has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.saveHashAndSamplesRun(mockRequest, "789", "testProjectHash", {})).rejects.toThrow("This project has been deleted");
        expect(mockRedis.hset).not.toHaveBeenCalled();
    });

    it("deletes project", async () => {
        const sut = new UserStore(mockRedis);
        await sut.deleteProject(mockRequest, "testProjectId");
        expect(mockRedis.hset).toHaveBeenCalledWith("beebop:project:testProjectId", "deletedAt", 1687879913811);
    });

    it("gets user projects, excluding deleted projects", async () => {
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

    it("does not save amr data if the project has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.saveAMR("789", "1234", {filename: "testfile.fa", Penicillin: 0.1} as any)).rejects.toThrow("This project has been deleted");
        expect(mockRedis.sadd).not.toHaveBeenCalled();
        expect(mockRedis.hset).not.toHaveBeenCalled();
    });

    it("gets AMR data", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const fileName = "test.fa";
        const expectedSampleId = (sut as any)._sampleId(sampleHash, fileName);
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, expectedSampleId);
        const expectedAMRString = JSON.stringify({ key: "value" });
        const expectedAMR = JSON.parse(expectedAMRString);

        mockRedis.hget.mockImplementation(() => expectedAMRString);

        const result = await sut.getAMR(projectId, sampleHash, fileName);

        expect(mockRedis.hget).toHaveBeenCalledTimes(1);
        expect(mockRedis.hget.mock.calls[0][0]).toBe(expectedProjectSampleKey);
        expect(mockRedis.hget.mock.calls[0][1]).toBe("amr");
        expect(result).toStrictEqual(expectedAMR);
    });

    it("does not get amr data if the project has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.getAMR("789", "1234", "test.fa")).rejects.toThrow("This project has been deleted");
        expect(mockRedis.hget).not.toHaveBeenCalled();
    });

    it("gets project samples", async() => {
        mockRedis.smembers = jest.fn().mockImplementation(() => ["1234:test1.fa", "5678:test2.fa"])
        const sut = new UserStore(mockRedis);
        const result = await sut.getProjectSplitSampleIds("testProjectId");
        expect(mockRedis.smembers).toHaveBeenCalledWith("beebop:project:testProjectId:samples");
        expect(result).toStrictEqual([
            { hash: "1234", filename: "test1.fa" },
            { hash: "5678", filename: "test2.fa" }
        ]);
    });

    it("does not get project samples if the project has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.getProjectSplitSampleIds("789")).rejects.toThrow("This project has been deleted");
        expect(mockRedis.smembers).not.toHaveBeenCalled();
    });

    it("gets base project info", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const expectedProjectKey = `beebop:project:${projectId}`;

        const result = await sut.getBaseProjectInfo(projectId);

        expect(mockRedis.hgetall).toHaveBeenCalledTimes(1);
        expect(mockRedis.hgetall.mock.calls[0][0]).toBe(expectedProjectKey);
        expect(result).toStrictEqual({
            "hash": "hash for beebop:project:testProjectId",
            "id": "id for beebop:project:testProjectId",
            "name": "name for beebop:project:testProjectId",
            "samples": "samples for beebop:project:testProjectId",
            "status": "status for beebop:project:testProjectId",
            "timestamp": 1687879913811,
        });
    });

    it("does not get base project info if the project has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.getBaseProjectInfo("789")).rejects.toThrow("This project has been deleted");
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
        const expectedSketchString = JSON.stringify(sketch);

        await sut.saveSketch(projectId, sampleHash, filename, sketch);

        expect(mockRedis.sadd).toHaveBeenCalledTimes(1);
        expect(mockRedis.sadd.mock.calls[0][0]).toBe(expectedProjectSamplesKey);
        expect(mockRedis.sadd.mock.calls[0][1]).toBe(sampleId);

        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis.hset.mock.calls[0][0]).toBe(expectedProjectSampleKey);
        expect(mockRedis.hset.mock.calls[0][1]).toBe("sketch");
        expect(mockRedis.hset.mock.calls[0][2]).toBe(expectedSketchString);
    });

    it("does not save sketch data if the project has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.saveSketch("789", "1234", "test.fa", { key: "value" })).rejects.toThrow("This project has been deleted");
        expect(mockRedis.sadd).not.toHaveBeenCalled();
        expect(mockRedis.hset).not.toHaveBeenCalled();
    });

    it("gets sketch data", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const fileName = "test.fa";
        const expectedSampleId = (sut as any)._sampleId(sampleHash, fileName);
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, expectedSampleId);
        const expectedSketchString = JSON.stringify({ key: "value" });
        const expectedSketch = JSON.parse(expectedSketchString);

        mockRedis.hget.mockImplementation(() => expectedSketchString);

        const result = await sut.getSketch(projectId, sampleHash, fileName);

        expect(mockRedis.hget).toHaveBeenCalledTimes(1);
        expect(mockRedis.hget.mock.calls[0][0]).toBe(expectedProjectSampleKey);
        expect(mockRedis.hget.mock.calls[0][1]).toBe("sketch");
        expect(result).toStrictEqual(expectedSketch);
    });

    it("does not get sketch data if the project has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.getSketch("789", "1234", "test.fa")).rejects.toThrow("This project has been deleted");
        expect(mockRedis.hget).not.toHaveBeenCalled();
    });

    it("gets sample data", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const fileName = "test.fa";
        const expectedProjectKey = `beebop:project:${projectId}`;
        const expectedSampleId = (sut as any)._sampleId(sampleHash, fileName);
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, expectedSampleId);
        const expectedSketchString = JSON.stringify({ key: "value" });
        const expectedAMRString = JSON.stringify({ key: "value" });
        const expectedSketch = JSON.parse(expectedSketchString);
        const expectedAMR = JSON.parse(expectedAMRString);
        const expectedHasRun = 1;

        mockRedis.hgetall
            .mockImplementationOnce(() => ({ id: projectId, name: "testProjectName" }))
            .mockImplementationOnce(() => ({ sketch: expectedSketchString, amr: expectedAMRString , hasRun: expectedHasRun}));

        const result = await sut.getSample(projectId, sampleHash, fileName);

        expect(mockRedis.hgetall).toHaveBeenCalledTimes(2);
        expect(mockRedis.hgetall.mock.calls[0][0]).toBe(expectedProjectKey);
        expect(mockRedis.hgetall.mock.calls[1][0]).toBe(expectedProjectSampleKey);

        expect(result).toStrictEqual({ sketch: expectedSketch, amr: expectedAMR, hasRun: true });
    });

    it("does not get sample data if the project has been deleted", async () => {
        const sut = new UserStore(mockRedis);
        await expect(sut.getSample("789", "1234", "test.fa")).rejects.toThrow("This project has been deleted");
    });

    it("deletes sample ", async () => {
        const sut = new UserStore(mockRedis);
        const projectId = "testProjectId";
        const sampleHash = "testSampleHash";
        const filename = "test.fa";
        const expectedProjectSamplesKey = (sut as any)._projectSamplesKey(projectId);
        const expectedSampleId = `${sampleHash}:${filename}`;
        const expectedProjectSampleKey = (sut as any)._projectSampleKey(projectId, expectedSampleId);

        await sut.deleteSample(projectId, sampleHash, filename);

        expect(mockRedis.srem).toHaveBeenCalledWith(expectedProjectSamplesKey, expectedSampleId);
        expect(mockRedis.del).toHaveBeenCalledWith(expectedProjectSampleKey);
    })
});