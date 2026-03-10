// No-op rate limit middleware for serverless deployment
// The real middleware imports subscription/stripe/redis which causes bundle hang
export const rateLimitMiddleware = async () => {};
