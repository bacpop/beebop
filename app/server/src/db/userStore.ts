import Redis from "ioredis";

const USER_PREFIX = "beebop:user:";

export class UserStore {
    private readonly _redis: Redis;

    constructor(redis: Redis) {
        this._redis = redis;
    }

    private _userKey = (name: string) => `${USER_PREFIX}${name}`;
    private _userIdFromRequest = (request) => `${request.user.provider}:${request.user.id}`;

     async saveProjectHash(request, projectHash: string) {
        const user = this._userIdFromRequest(request);
        await this._redis.hset(this._userKey("hash"), user, projectHash);
    }
}

export const userStore = (redis: Redis) => new UserStore(redis);