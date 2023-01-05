import {get, post, flushRedis, getRedisValues} from "./utils";
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
        const mapping = await getRedisValues("beebop:user:hash");
        expect(Object.keys(mapping).length).toBe(1);
        expect(mapping["mock:1234"]).toBe("9876");
        const nameMapping = await getRedisValues("beebop:userproject:name");
        expect(nameMapping["mock:1234:9876"]).toBe("test name");
    });
});