export class NetworkError extends Error {
    constructor(message?: string) {
        if (!message) {
            super();
        } else {
            super(message);
        }
    }
}
