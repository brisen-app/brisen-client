

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}
export class NotImplementedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotImplementedError";
    }
}