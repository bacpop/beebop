import axios from "axios";
import Redis from "ioredis";

const fullUrl = (url: string) => `http://localhost:4000/${url}`;
const redisUrl = "redis://localhost:6379";

// Do not fail on error status - let individual tests deal with error cases
const validateStatus = () => true;
const standardHeaders = { "Content-Type": "application/json" };

export const get = async (url: string) => {
    return axios.get(fullUrl(url), { headers: standardHeaders, validateStatus });
};

export const post = (url: string, payload: any, cookie: string) => {
    const headers = { ...standardHeaders, "Cookie": cookie };
    return axios.post(fullUrl(url), payload, {headers, validateStatus });
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

export const getRedisValues = async (key: string) => {
    return await withRedis(async (redis: Redis) => {
        return await redis.hgetall(key);
    });
}