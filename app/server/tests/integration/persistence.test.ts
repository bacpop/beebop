import {
    get,
    post,
    flushRedis,
    getRedisHash,
    getRedisList,
    getRedisSet,
    saveRedisHash,
    saveRedisList,
    saveRedisSet,
    withRedis
} from "./utils";
import {UserStore} from "../../src/db/userStore";
describe("User persistence", () => {
    let connectionCookie = "";
    beforeEach(async () => {
        await flushRedis();

        const response = await get("login/mock");
        connectionCookie = response.headers["set-cookie"][0];
    });

    it("adds user project to redis", async () => {
        const payload = {
            name: "test name"
        };
        const now = Date.now();
        await post("project", payload, connectionCookie);
        const userProjects = await getRedisList("beebop:userprojects:mock:1234")
        expect(userProjects.length).toBe(1);
        const projectId = userProjects[0];
        expect(projectId.length).toBe(32);
        const projectDetails = await getRedisHash(`beebop:project:${projectId}`);
        expect(projectDetails.name).toStrictEqual("test name");
        const timestamp = parseInt(projectDetails.timestamp);
        expect(timestamp).toBeGreaterThanOrEqual(now);
        expect(timestamp).toBeLessThan(now + 1000);
    });

    it("adds project's hash to redis", async () => {
        await saveRedisHash("beebop:project:test-project-id", {name: "test project name"});
        const payload = {
            projectHash: "9876",
            projectId: "test-project-id"
        };
        await post("poppunk", payload, connectionCookie);
        const projectDetails = await getRedisHash("beebop:project:test-project-id");
        expect(projectDetails).toStrictEqual({name: "test project name", hash: "9876"});
    });

    it("gets user project details from redis", async () => {
        await saveRedisList("beebop:userprojects:mock:1234", ["abcd", "efgh"]);
        await saveRedisHash("beebop:project:abcd", {name: "test save 1"});
        await saveRedisHash("beebop:project:efgh", {name: "test save 2", hash: "1234"});

        const response = await get("projects", connectionCookie);
        expect(response.status).toBe(200);
        expect(response.data).toStrictEqual({
            status: "success",
            data: [
                {id: "abcd", name: "test save 1", hash: null},
                {id: "efgh", name: "test save 2", hash: "1234"}
            ],
            errors: []
        });
    });

    it("saves amr data to redis", async () => {
        const testAMR = {filename: "test.fa", Penicillin: 0.5};
        await post("project/testProjectId/amr/1234", testAMR, connectionCookie);
        const persistedSampleIds = await getRedisSet("beebop:project:testProjectId:samples");
        expect(persistedSampleIds).toStrictEqual(["1234:test.fa"]);
        const persisted = await getRedisHash("beebop:project:testProjectId:sample:1234:test.fa");
        expect(persisted).toStrictEqual({"amr": JSON.stringify(testAMR)});
    });

    it("gets amr data from redis", async () => {
        await saveRedisHash("beebop:project:abcd:sample:1234:test.fa", {amr: "{\"Penicillin\": 0.5}"});
        await withRedis(async (redis) => {
                const userStore = new UserStore(redis);
                const result = await userStore.getAMR("abcd", "1234", "test.fa");
                expect(result).toStrictEqual({Penicillin: 0.5});
            }
        );
    });

    it("gets project samples from redis", async () => {
        await saveRedisSet("beebop:project:abcd:samples", ["1234:test1.fa", "5678:test2.fa"]);
        await withRedis(async (redis) => {
            const userStore = new UserStore(redis);
            const result = await userStore.getProjectSamples("abcd");
            // sample results are not in a defined order as saved in set - may not be order uploaded
            result.sort((a, b) => a.hash < b.hash ? -1 : 1);
            expect(result).toStrictEqual([
                {hash: "1234", filename: "test1.fa"},
                {hash: "5678", filename: "test2.fa"}
            ]);
        });
    });
});