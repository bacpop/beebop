import Redis from "ioredis";

export function redisConnection(url: string, errorCallback: (err: Error) => void): Redis {
    const redis = new Redis(url);
    redis.on("error", (err: Error) => {
        console.log(err);
        redis.disconnect();
        errorCallback(err);
    });
    redis.on("connect", () => {
        console.log(`Connected to Redis server ${url}`);
    });
    return redis;
}
