import { userStore } from "./../../src/db/userStore";
import {
  get,
  post,
  deleteRequest,
  flushRedis,
  getRedisHash,
  getRedisList,
  getRedisSet,
  saveRedisHash,
  saveRedisList,
  saveRedisSet,
  withRedis,
} from "./utils";
import { UserStore } from "../../src/db/userStore";
import { AMR } from "../../src/types/models";
describe("User persistence", () => {
  let connectionCookie = "";
  beforeEach(async () => {
    await flushRedis();

    const response = await get("login/mock");
    connectionCookie = response.headers["set-cookie"][0];
  });

  const expectTimestampIsSoonAfter = (timestamp: number, now: number) => {
    expect(timestamp).toBeGreaterThanOrEqual(now);
    expect(timestamp).toBeLessThan(now + 1000);
  };

  it("adds user project to redis", async () => {
    const payload = {
      name: "test name",
    };
    const now = Date.now();
    await post("project", payload, connectionCookie);
    const userProjects = await getRedisList("beebop:userprojects:mock:1234");
    expect(userProjects.length).toBe(1);
    const projectId = userProjects[0];
    expect(projectId.length).toBe(32);
    const projectDetails = await getRedisHash(`beebop:project:${projectId}`);
    expect(projectDetails.name).toStrictEqual("test name");
    const timestamp = parseInt(projectDetails.timestamp);
    expectTimestampIsSoonAfter(timestamp, now);
  });

  it("adds project's hash to redis", async () => {
    await saveRedisHash("beebop:project:test-project-id", {
      name: "test project name",
    });
    const payload = {
      projectHash: "9876",
      projectId: "test-project-id",
    };
    await post("poppunk", payload, connectionCookie);
    const projectDetails = await getRedisHash("beebop:project:test-project-id");
    expect(projectDetails).toStrictEqual({
      name: "test project name",
      hash: "9876",
    });
  });

  it("gets user project details from redis", async () => {
    await saveRedisList("beebop:userprojects:mock:1234", ["abcd", "efgh"]);
    await saveRedisHash("beebop:project:abcd", {
      name: "test save 1",
      timestamp: "1689070004473",
    });
    await saveRedisHash("beebop:project:efgh", {
      name: "test save 2",
      hash: "1234",
      timestamp: "1689070004573",
    });
    await saveRedisSet("beebop:project:abcd:samples", ["a1b1"]);
    await saveRedisSet("beebop:project:efgh:samples", ["c2d2", "e3f3"]);

    const response = await get("projects", connectionCookie);
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({
      status: "success",
      data: [
        {
          id: "abcd",
          name: "test save 1",
          timestamp: 1689070004473,
          samplesCount: 1,
        },
        {
          id: "efgh",
          name: "test save 2",
          hash: "1234",
          timestamp: 1689070004573,
          samplesCount: 2,
        },
      ],
      errors: [],
    });
  });

  it("renames project", async () => {
    await saveRedisList("beebop:userprojects:mock:1234", ["abcd"]);
    await saveRedisHash("beebop:project:abcd", {
      name: "old name",
      timestamp: "1689070004473",
    });
    await saveRedisSet("beebop:project:abcd:samples", ["a1b1"]);
    const response = await post(
      "project/abcd/rename",
      { name: "new name" },
      connectionCookie
    );

    expect(response.status).toBe(200);
    // can get user projects with new name
    const projectsResponse = await get("projects", connectionCookie);

    expect(projectsResponse.data).toStrictEqual({
      status: "success",
      data: [
        {
          id: "abcd",
          name: "new name",
          timestamp: 1689070004473,
          samplesCount: 1,
        },
      ],
      errors: [],
    });
  });

  it("tags a project as having been deleted", async () => {
    const now = Date.now();

    const projectId = "test-delete-project-id";
    await saveRedisList("beebop:userprojects:mock:1234", [
      projectId,
      "other-project-id",
    ]);
    await saveRedisHash(`beebop:project:${projectId}`, {
      name: "project to delete",
      timestamp: now.toString(),
    });
    await saveRedisHash("beebop:project:other-project-id", {
      name: "other project",
      timestamp: now.toString(),
    });

    const projectDetailsBeforeDelete = await getRedisHash(
      `beebop:project:${projectId}`
    );
    expect(projectDetailsBeforeDelete.deletedAt).toBeUndefined();

    const deleteResponse = await deleteRequest(
      `project/${projectId}/delete`,
      connectionCookie
    );
    expect(deleteResponse.status).toBe(200);

    const projectDetailsAfterDelete = await getRedisHash(
      `beebop:project:${projectId}`
    );
    const deletedAt = parseInt(projectDetailsAfterDelete.deletedAt);
    expectTimestampIsSoonAfter(deletedAt, now);

    const getProjectsResponse = await get("projects", connectionCookie);
    expect(getProjectsResponse.status).toBe(200);
    expect(getProjectsResponse.data).toStrictEqual({
      status: "success",
      data: [
        {
          id: "other-project-id",
          name: "other project",
          timestamp: now,
          samplesCount: 0,
        },
      ],
      errors: [],
    });
  });

  it("saves amr data to redis", async () => {
    const testAMR = { filename: "test.fa", Penicillin: 0.5 };
    await post("project/testProjectId/amr/1234", testAMR, connectionCookie);
    const persistedSampleIds = await getRedisSet(
      "beebop:project:testProjectId:samples"
    );
    expect(persistedSampleIds).toStrictEqual(["1234:test.fa"]);
    const persisted = await getRedisHash(
      "beebop:project:testProjectId:sample:1234:test.fa"
    );
    expect(persisted).toStrictEqual({ amr: JSON.stringify(testAMR) });
  });

  it("gets amr data from redis", async () => {
    await saveRedisHash("beebop:project:abcd:sample:1234:test.fa", {
      amr: '{"Penicillin": 0.5}',
    });
    await withRedis(async (redis) => {
      const userStore = new UserStore(redis);
      const result = await userStore.getAMR("abcd", "1234", "test.fa");
      expect(result).toStrictEqual({ Penicillin: 0.5 });
    });
  });

  it("gets project samples from redis", async () => {
    await saveRedisSet("beebop:project:abcd:samples", [
      "1234:test1.fa",
      "5678:test2.fa",
    ]);
    await withRedis(async (redis) => {
      const userStore = new UserStore(redis);
      const result = await userStore.getProjectSplitSampleIds("abcd");
      // sample results are not in a defined order as saved in set - may not be order uploaded
      result.sort((a, b) => (a.hash < b.hash ? -1 : 1));
      expect(result).toStrictEqual([
        { hash: "1234", filename: "test1.fa" },
        { hash: "5678", filename: "test2.fa" },
      ]);
    });
  });

  it("saves samples to redis with sketch and amr data", async () => {
    const testSamples = [
      {
        sketch: { data: "sketchData" },
        hash: "sampleHash1",
        amr: { filename: "amrFile1", data: "amrData1" } as unknown as AMR,
        filename: "sampleFile1",
      },
      {
        sketch: { data: "sketchData2" },
        hash: "sampleHash2",
        amr: { filename: "amrFile2", data: "amrData2" } as unknown as AMR,
        filename: "sampleFile2",
      },
    ];
    await post("project/testProjectId/sample", testSamples, connectionCookie);

    const persistedSampleIds: string[] = await getRedisSet(
      "beebop:project:testProjectId:samples"
    );
    expect(persistedSampleIds.sort()).toEqual([
      "sampleHash1:sampleFile1",
      "sampleHash2:sampleFile2",
    ]);

    const persistedSample1 = await getRedisHash(
      "beebop:project:testProjectId:sample:sampleHash1:sampleFile1"
    );
    expect(persistedSample1).toEqual({
      amr: JSON.stringify(testSamples[0].amr),
      sketch: JSON.stringify(testSamples[0].sketch),
    });
    const persistedSample2 = await getRedisHash(
      "beebop:project:testProjectId:sample:sampleHash2:sampleFile2"
    );
    expect(persistedSample2).toEqual({
      amr: JSON.stringify(testSamples[1].amr),
      sketch: JSON.stringify(testSamples[1].sketch),
    });
  });
});
