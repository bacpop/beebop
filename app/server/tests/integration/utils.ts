import axios from "axios";
import Redis from "ioredis";

const fullUrl = (url: string) => `http://localhost:4000/${url}`;
const redisUrl = "redis://localhost:6379";

// Do not fail on error status - let individual tests deal with error cases
const validateStatus = () => true;
const standardHeaders = { "Content-Type": "application/json" };

const headers = (cookie?: string) => {
    const result = {...standardHeaders};
    if (cookie) {
        result["Cookie"] = cookie;
    }
    return result;
}

export const get = async (url: string, cookie?: string) => {
    return axios.get(fullUrl(url), { headers: headers(cookie), validateStatus });
};

export const post = (url: string, payload: any, cookie: string) => {
    return axios.post(fullUrl(url), payload, {headers: headers(cookie), validateStatus });
};

const withRedis = async (func: (redis: Redis) => any) => {
    const redis = new Redis(redisUrl);
    try {
        return await func(redis);
    } finally {
        redis.disconnect();
    }
};

export const flushRedis = async () => {
    await withRedis(async (redis: Redis) => {
        await redis.flushdb();
    });
};

export const getRedisList = async (key: string) => {
    return await withRedis(async (redis: Redis) => {
        const count = await redis.llen(key);
        return redis.lrange(key, 0, count - 1);
    });
}

export const getRedisHash = async (key: string) => {
    return await withRedis(async (redis: Redis) => {
       return redis.hgetall(key);
    });
}

export const getRedisSet = async (key: string) => {
    return await withRedis(async (redis: Redis) => {
        return redis.smembers(key);
    });
}

export const saveRedisList = async (key: string, listData: string[]) => {
    await withRedis(async (redis: Redis) => {
        await redis.rpush(key, ...listData);
    });
}

export const saveRedisHash = async (key: string, hash: Record<string, string>) => {
    await withRedis(async (redis: Redis) => {
        const args: string[] = [];
        Object.keys(hash).forEach((hashKey: string) => {
            args.push(hashKey);
            args.push(hash[hashKey]);
        });
        await redis.hmset(key, args);
    });
}