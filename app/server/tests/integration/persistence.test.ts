import {get, post, flushRedis, getRedisHash, getRedisList, saveRedisHash, saveRedisList} from "./utils";
describe("User persistence", () => {
    let connectionCookie = "";
    beforeEach(async () => {
        await flushRedis();

        const response = await get("login/mock");
        connectionCookie = response.headers["set-cookie"][0];
    });

    it("adds user - project hash - project name mappings to redis", async () => {
        const payload = {
            projectHash: "9876",
            projectName: "test name"
        };
        await post("poppunk", payload, connectionCookie);
        const userHashes = await getRedisList("beebop:user:hashes:mock:1234");
        expect(userHashes).toStrictEqual(["9876"]);
        const projectDetails = await getRedisHash("beebop:userproject:mock:1234:9876");
        expect(projectDetails).toStrictEqual({name: "test name"});
    });

    it("gets user project details from redis", async () => {
        await saveRedisList("beebop:user:hashes:mock:1234", ["abcd", "efgh"]);
        await saveRedisHash("beebop:userproject:mock:1234:abcd", {name: "test save 1"});
        await saveRedisHash("beebop:userproject:mock:1234:efgh", {name: "test save 2"});

        const response = await get("projects", connectionCookie);
        expect(response.status).toBe(200);
        expect(response.data).toStrictEqual({
            status: "success",
            data: [
                {hash: "abcd", name: "test save 1"},
                {hash: "efgh", name: "test save 2"}
            ],
            errors: []
        });
    });
});