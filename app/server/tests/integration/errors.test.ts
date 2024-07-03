import {flushRedis, get, post, saveRedisHash, saveRedisSet, saveRedisList } from "./utils";
import {uid} from "uid";
import {setTimeout} from "timers/promises";
import {testSample} from "./testSample";

describe("Error handling", () => {
    let connectionCookie = "";
    beforeEach(async () => {
        await flushRedis();

        const response = await get("login/mock");
        connectionCookie = response.headers["set-cookie"][0];
    });

    const names = testSample("" ,"").names;
    const sampleHash = Object.keys(names)[0];
    const sampleFileName = names[sampleHash] ;
    const sampleId = `${sampleHash}:${sampleFileName}`;

    const newProject = async () => {
        const newProjectRes = await post("project", {name: "test project"}, connectionCookie);
        expect(newProjectRes.status).toBe(200);
        return newProjectRes.data.data;
    };

    const runProjectToCompletion = async () => {
        // 1. Create project
        const projectId = await newProject();

        // 2. Post sample AMR
        const amr = {
            filename: sampleFileName,
            Penicillin: 0.944,
            Chloramphenicol: 0.39,
            Erythromycin: 0.151,
            Tetracycline: 0.453,
            Trim_sulfa: 0.98,
            length: true,
            species: true
        };
        const amrRes = await post(`project/${projectId}/amr/${sampleHash}`, amr, connectionCookie);
        expect(amrRes.status).toBe(200);

        // 3. Run poppunk and wait til it finishes
        const fakeProjectHash = `${projectId}ABC`;
        const projectData = testSample(fakeProjectHash, projectId);
        const poppunkRes = await post(`poppunk`, projectData, connectionCookie);
        expect(poppunkRes.status).toBe(200);
        expect(poppunkRes.data.data.assign).not.toBe("")
        let counter = 0;
        let finished = false;
        while (!finished && counter < 100) {
            await setTimeout(2000);
            const statusRes = await post("status", {hash: fakeProjectHash}, connectionCookie);
            expect(statusRes.status).toBe(200);
            const statusValues = statusRes.data.data;
            if (statusValues && statusValues.assign === "finished" && statusValues.microreact === "finished" && statusValues.network === "finished") {
                finished = true;
                break;
            }
            counter = counter + 1;
        }
        expect(finished).toBe(true);
        return projectId;
    };

    it("Returns well-formed API error", async () => {
        // Request status for a project hash which does not exist
        const nonexistentHash = uid();
        const response = await post("status", {hash: nonexistentHash}, connectionCookie);
        expect(response.status).toBe(500);
        const responseData = response.data;
        expect(responseData.status).toBe("failure");
        expect(responseData.data).toBe(null);
        expect(responseData.errors).toStrictEqual([
            {
                error: "Unknown project hash",
                detail: ""
            }
        ]);
    });

    it("Returns expected response for malformed API error", async () => {
        // Send rubbish to poppunk request - API responds with a 400 response, but unfortunately an HTML one -
        // should be logged as a 400 response and error message returned indicating malformed response
        const junk = {
            projectHash: "123",
            projectId: "nonexistent",
            names: {name1: "rubbish", name2: "rubbish"},
            sketches: {sketchy: "rubbish"}
        };

        const response = await post("poppunk", junk, connectionCookie);
        expect(response.status).toBe(400);
        const responseData = response.data;
        expect(responseData.status).toBe("failure");
        expect(responseData.data).toBe(null);
        expect(responseData.errors).toStrictEqual([
            {
                error: "Malformed response from API",
                detail: "The API returned a response which could not be parsed"
            }
        ]);
    });

    it("Returns error on unexpected sample when get project", async () => {
        // run a standard project but add an extra sample id to redis which won't be found in the response from
        // beebop_py
        const projectId = await runProjectToCompletion();

        // insert rogue extra sample id to redis
        const fakeSampleId = `1234:fakeSample.fa`
        await saveRedisSet(`beebop:project:${projectId}:samples`, [sampleId, fakeSampleId]);

        // get project data - should get error
        const projectRes = await get(`project/${projectId}`, connectionCookie);
        expect(projectRes.status).toBe(500);
        expect(projectRes.data.data).toBe(null);
    });

    it("Omits unexpected error detail from response", async () => {
        // Run a project then sabotage its AMR in the database so we get an unexpected JSON parse error
        const projectId = await runProjectToCompletion();
        const redisKey = `beebop:project:${projectId}:sample:${sampleId}`
        await saveRedisHash(redisKey, {"amr": "{{{{nope"});

        const projectRes = await get(`project/${projectId}`, connectionCookie);

        expect(projectRes.status).toBe(500);
        expect(projectRes.data.data).toBe(null);
        expect(projectRes.data.errors.length).toBe(1);
        const error = projectRes.data.errors[0];
        expect(error.error).toBe("Unexpected error");
        expect(error.detail).toMatch(/An unexpected error occurred. Please contact support and quote error code [a-z0-9]{11}/);
    });

    describe("validation errors for operations relating to deleted projects", () => {
        const projectId = "deleted-project-id";

        beforeEach(async () => {
            const now = Date.now();
            await saveRedisList("beebop:userprojects:mock:1234", [projectId]);
            await saveRedisHash(`beebop:project:${projectId}`, {
                name: "project to delete",
                timestamp: now.toString(),
                deletedAt: (now + 1).toString(),
            });
        })

        it("returns expected response for project not found", async () => {
            const projectRes = await get(`project/${projectId}`, connectionCookie);
            expect(projectRes.status).toBe(404);
            expect(projectRes.data.status).toBe("failure");
            expect(projectRes.data.data).toBe(null);
            expect(projectRes.data.errors).toStrictEqual([
                {
                    error: "Deleted project",
                    detail: "This project has been deleted"
                }
            ]);
        });

        it("returns 'not found' response for renaming a deleted project", async () => {
            const response = await post(`project/${projectId}/rename`, { name: "new name" }, connectionCookie);
            expect(response.status).toBe(404);
            expect(response.data.status).toBe("failure");
            expect(response.data.data).toBe(null);
            expect(response.data.errors).toStrictEqual([
                {
                    error: "Deleted project",
                    detail: "This project has been deleted"
                }
            ]);
        });
    });
});

