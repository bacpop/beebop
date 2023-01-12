import Redis from "ioredis";

const USER_PREFIX = "beebop:user:";
const USER_PROJECT_PREFIX = "beebop:userproject:";

export class UserStore {
    private readonly _redis: Redis;

    constructor(redis: Redis) {
        this._redis = redis;
    }

    private _userKey = (name: string) => `${USER_PREFIX}${name}`;
    private _userProjectKey = (name: string) => `${USER_PROJECT_PREFIX}${name}`;
    private _userIdFromRequest = (request) => `${request.user.provider}:${request.user.id}`;
    private _userProjectId = (userId, projectHash) => `${userId}:${projectHash}`

     async saveNewProject(request, projectHash: string, projectName: string) {
        const user = this._userIdFromRequest(request);
        await this._redis.hset(this._userKey("hash"), user, projectHash);
        // Associate the project name with both the user and project hash, since in theory two users could get the same
        // project hash if they used identical files
        const userProjectId = this._userProjectId(user, projectHash);
        await this._redis.hset(this._userProjectKey("name"), userProjectId, projectName);
    }

    async getUserProjects(request) {
        const user = this._userIdFromRequest(request);
        // get all hashes
        const result = await this._redis.hget(this._userKey("hash"), user);
        console.log("got user hashes:" +  JSON.stringify(result));

        return result;
    }
}

export const userStore = (redis: Redis) => new UserStore(redis);