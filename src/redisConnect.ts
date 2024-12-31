import { createClient } from 'redis';

const redisClient = createClient();

redisClient.connect().then(() => {
  console.log('Connected to Redis');
}).catch((err) => {
  console.error('Redis connection error:', err);
});

export default redisClient;