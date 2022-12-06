import {get, post, flushRedis, getRedisValues} from "./utils";
describe("User persistence", () => {
    let connectionCookie = "";
    beforeEach(async () => {
        await flushRedis();

        const response = await get("login/mock");
        connectionCookie = response.headers["set-cookie"][0];
    });

    it("adds user - project hash mapping to redis", async () => {
        const payload = {
            projectHash: "9876"
        };
        await post("poppunk", payload, connectionCookie);
        const mapping = await getRedisValues("beebop:user:hash");
        expect(Object.keys(mapping).length).toBe(1);
        expect(mapping["mock:1234"]).toBe("9876");
    });
});