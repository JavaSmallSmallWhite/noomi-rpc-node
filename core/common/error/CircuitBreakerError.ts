export class CircuitBreakerError extends Error{
    constructor(message: string) {
        super(message);
    }
}
