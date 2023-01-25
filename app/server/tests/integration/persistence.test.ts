import {get, post, flushRedis, getRedisHash, getRedisList, saveRedisHash, saveRedisList} from "./utils";
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
        await post("project", payload, connectionCookie);
        const userProjects = await getRedisList("beebop:userprojects:mock:1234")
        expect(userProjects.length).toBe(1);
        const projectId = userProjects[0];
        expect(projectId.length).toBe(32);
        const projectDetails = await getRedisHash(`beebop:project:${projectId}`);
        expect(projectDetails).toStrictEqual({
            name: "test name"
        });
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
});