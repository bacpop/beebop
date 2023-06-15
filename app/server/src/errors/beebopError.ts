export class BeebopError extends Error {
    status: number;

    errorType: string;

    constructor(errorType: string, message: string, status = 500) {
        super(message);

        this.name = "BeebopError";
        this.status = status;
        this.errorType = errorType;
    }
}