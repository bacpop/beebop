export class BeebopError extends Error {
    status: number;

    errorType: string;

    writeToResponse: boolean;

    constructor(errorType: string, message: string, status = 500, writeToResponse = false) {
        super(message);

        this.name = "BeebopError";
        this.status = status;
        this.errorType = errorType;
        this.writeToResponse = writeToResponse;
    }
}