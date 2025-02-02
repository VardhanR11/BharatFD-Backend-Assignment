const Redis = require('redis');
const { promisify } = require('util');

class CacheService {
    constructor() {
        try {
            this.client = Redis.createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.log('Redis connection failed, continuing without cache');
                            return false;
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });

            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.client = null;
            });

            this.client.connect().catch((err) => {
                console.error('Redis connection failed:', err);
                this.client = null;
            });
        } catch (error) {
            console.error('Redis initialization failed:', error);
            this.client = null;
        }
    }

    async get(key) {
        if (!this.client) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, expirySeconds = 3600) {
        if (!this.client) return;
        try {
            await this.client.set(key, JSON.stringify(value), {
                EX: expirySeconds
            });
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }
}

const cacheService = new CacheService();

const cacheMiddleware = async (req, res, next) => {
    if (!cacheService.client) {
        return next();
    }
    
    const lang = req.query.lang || 'en';
    const cacheKey = `faqs:${lang}`;

    try {
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        next();
    }
};

module.exports = { cacheMiddleware, cacheService };
