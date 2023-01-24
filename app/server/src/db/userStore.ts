import Redis from "ioredis";
import {uid} from "uid";

const BEEBOP_PREFIX = "beebop:";

export class UserStore {
    private readonly _redis: Redis;

    constructor(redis: Redis) {
        this._redis = redis;
    }

    private _userIdFromRequest = (request) => `${request.user.provider}:${request.user.id}`;
    private _userProjectsKey = (userId: string) => `${BEEBOP_PREFIX}userprojects:${userId}`;
    private _projectKey = (projectId: string) => `${BEEBOP_PREFIX}project:${projectId}`;

    private _newProjectId = () => uid(32);

     async saveNewProject(request, projectName: string) {
        const user = this._userIdFromRequest(request);
        const projectId = this._newProjectId();
        await this._redis.lpush(this._userProjectsKey(user), projectId);
        await this._redis.hset(this._projectKey(projectId), "name", projectName);
        return projectId;
    }

    async saveProjectHash(request, projectId: string, projectHash: string) {
        // TODO: could verify that this project belongs to the request user
        await this._redis.hset(this._projectKey(projectId), "hash", projectHash);
    }

    async getUserProjects(request) {
        // Get all project ids for the user
        const user = this._userIdFromRequest(request);
        const projectIdsKey = this._userProjectsKey(user);
        const count = await this._redis.llen(projectIdsKey);
        const projectIds = await this._redis.lrange(projectIdsKey, 0, count-1);

        const result = [];
        // TODO: pipeline this?
        for (const projectId of projectIds) {
            const values = await this._redis.hmget(this._projectKey(projectId), "name", "hash");
            result.push({
                id: projectId,
                name: values[0],
                hash: values[1]
            });
        }

        return result;
    }
}

export const userStore = (redis: Redis) => new UserStore(redis);