// import { createClient } from 'redis';

// const redisClient = createClient({
//     url: process.env.REDIS_URL || 'redis://:123@localhost:6379'
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));
// redisClient.on('connect', () => console.log('Đã kết nối thành công tới Redis!'));

// redisClient.connect();

// export default redisClient;

import Redis, { RedisOptions } from 'ioredis';

const sentinelHost = process.env.REDIS_SENTINEL_HOST || 'redis-prod.redis.svc.cluster.local';
const sentinelPort = parseInt(process.env.REDIS_SENTINEL_PORT || '26379', 10);
const redisPassword = process.env.REDIS_PASSWORD || 'redispsswd';
const masterName = process.env.REDIS_MASTER_NAME || 'mymaster';

// Khai báo cấu hình riêng cho ioredis
const redisConfig: RedisOptions = {
    sentinels: [
        { host: sentinelHost, port: sentinelPort }
    ],
    name: masterName,
    password: redisPassword,
    // Nếu Sentinel của bạn yêu cầu mật khẩu riêng để truy cập (hiếm khi xảy ra), dùng dòng dưới:
    // sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD, 
    sentinelPassword: redisPassword,
};

// Khởi tạo client
const redisClient = new Redis(redisConfig);

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Đã kết nối thành công tới Redis qua Sentinel (ioredis)!'));

export default redisClient;