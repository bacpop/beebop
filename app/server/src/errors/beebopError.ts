import { ErrorType } from "./errorType";

export class BeebopError extends Error {
    status: number;

    errorType: ErrorType;

    constructor(message: string, status: number, errorType: ErrorType) {
        super(message);

        this.name = "BeebopError";
        this.status = status;
        this.errorType = errorType;
    }
}