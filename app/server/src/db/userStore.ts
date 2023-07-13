import Redis from "ioredis";
import {uid} from "uid";
import {AMR} from "../types/models";

const BEEBOP_PREFIX = "beebop:";

export class UserStore {
    private readonly _redis: Redis;

    constructor(redis: Redis) {
        this._redis = redis;
    }

    private _userIdFromRequest = (request) => `${request.user.provider}:${request.user.id}`;
    private _userProjectsKey = (userId: string) => `${BEEBOP_PREFIX}userprojects:${userId}`;
    private _projectKey = (projectId: string) => `${BEEBOP_PREFIX}project:${projectId}`;
    private _projectSamplesKey = (projectId: string) => `${this._projectKey(projectId)}:samples`;
    private _projectSampleKey = (projectId: string, sampleId: string) => `${this._projectKey(projectId)}:sample:${sampleId}`;

    private _newProjectId = () => uid(32);
    private _sampleId = (sampleHash: string, fileName: string) => `${sampleHash}:${fileName}`;

    private async _setProjectName (projectId: string, newProjectName: string) {
        await this._redis.hset(this._projectKey(projectId), "name", newProjectName);
    }

    async saveNewProject(request, projectName: string) {
        const user = this._userIdFromRequest(request);
        const projectId = this._newProjectId();
        await this._redis.lpush(this._userProjectsKey(user), projectId);
        await this._setProjectName(projectId, projectName);
        await this._redis.hset(this._projectKey(projectId), "timestamp", Date.now());
        return projectId;
    }

    async renameProject(request, projectId: string, newProjectName: string) {
        // TODO: verify that this project belongs to the request user:
        // https://mrc-ide.myjetbrains.com/youtrack/issue/bacpop-96
        await this._setProjectName(projectId, newProjectName);
    }

    async saveProjectHash(request, projectId: string, projectHash: string) {
        // TODO: verify that this project belongs to the request user:
        // https://mrc-ide.myjetbrains.com/youtrack/issue/bacpop-96
        await this._redis.hset(this._projectKey(projectId), "hash", projectHash);
    }

    async getProjectHash(request, projectId: string) {
         return await this._redis.hget(this._projectKey(projectId), "hash")
    }

    async getUserProjects(request) {
        // Get all project ids for the user
        const user = this._userIdFromRequest(request);
        const projectIdsKey = this._userProjectsKey(user);
        const projectIds = await this._redis.lrange(projectIdsKey, 0, -1);

        const result = [];
        await Promise.all(projectIds.map(async (projectId: string) => {
            const values = await this._redis.hmget(this._projectKey(projectId), "name", "hash", "timestamp");
            result.push({
                id: projectId,
                name: values[0],
                hash: values[1],
                timestamp: parseInt(values[2])
            });
        }));

        return result;
    }

    async saveAMR(projectId: string, sampleHash: string, amr: AMR) {
        const sampleId = this._sampleId(sampleHash, amr.filename);
        await this._redis.sadd(this._projectSamplesKey(projectId), sampleId);
        await this._redis.hset(this._projectSampleKey(projectId, sampleId), "amr", JSON.stringify(amr));
    }

    async getAMR(projectId: string, sampleHash: string, fileName: string) {
         const sampleId = this._sampleId(sampleHash, fileName);
         const amrString = await this._redis.hget(this._projectSampleKey(projectId, sampleId), "amr");
         return JSON.parse(amrString) as AMR;
    }

    async getProjectSamples(projectId: string) {
         const sampleIds = await this._redis.smembers(this._projectSamplesKey(projectId));
         return sampleIds.map((sampleId) => {
             const [hash, filename] = sampleId.split(":");
             return {hash, filename};
         });
    }
}

export const userStore = (redis: Redis) => new UserStore(redis);