import Redis from "ioredis";

const USER_PREFIX = "beebop:user:";
const USER_PROJECT_PREFIX = "beebop:userproject:";

export class UserStore {
    private readonly _redis: Redis;

    constructor(redis: Redis) {
        this._redis = redis;
    }

    // We store all project hashes for a user in a list with key beebop:user:hashes:[userId]
    private _userHashesKey = (userId) => `${USER_PREFIX}hashes:${userId}`;
    // We store all details for a user project in a hash with key beebop:userproject:[userid]:[projectHash] (the same
    // project has may be associated with multiple users if they use identical files, but they will have different project
    // details.
    private _userProjectKey = (userId: string, projectHash: string) => `${USER_PROJECT_PREFIX}${userId}:${projectHash}`;
    private _userIdFromRequest = (request) => `${request.user.provider}:${request.user.id}`;

     async saveNewProject(request, projectHash: string, projectName: string) {
        const user = this._userIdFromRequest(request);
        await this._redis.lpush(this._userHashesKey(user), projectHash);
        await this._redis.hset(this._userProjectKey(user, projectHash), "name", projectName);
    }

    async getUserProjects(request) {
        // Get all hashes for the user
        const user = this._userIdFromRequest(request);
        const hashesKey = this._userHashesKey(user);
        const count = await this._redis.llen(hashesKey);
        const allHashes = await this._redis.lrange(hashesKey, 0, count-1);

        const result = [];
        for (const projectHash of allHashes) {
            const name = await this._redis.hget(this._userProjectKey(user, projectHash), "name");
            const project = {
                hash: projectHash,
                name
            };
            result.push(project);
        }

        return result;
    }
}

export const userStore = (redis: Redis) => new UserStore(redis);