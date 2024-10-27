export class RateLimiterError extends Error {
  constructor(message: string) {
    super(message);
  }
}
