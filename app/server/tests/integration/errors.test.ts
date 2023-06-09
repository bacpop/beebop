import {flushRedis, get, post} from "./utils";

describe("Error handling", () => {
    let connectionCookie = "";
    beforeEach(async () => {
        await flushRedis();

        const response = await get("login/mock");
        connectionCookie = response.headers["set-cookie"][0];
    });

    it("Hides API error responses from user, logs details to console", async () => {
        // Send rubbish to poppunk request - API should respond with error
        const junk = {
            projectHash: "123",
            projectId: "nonexistent",
            names: {name1: "rubbish", name2: "rubbish"},
            sketches: {sketchy: "rubbish"}
        };

        const response = await post("poppunk", junk, connectionCookie);
        expect(response.status).toBe(500);
    });
});