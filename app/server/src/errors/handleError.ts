import { Request, Response } from "express";
import { uid } from "uid";
import { reqWithError } from "../logging";
import { BeebopError } from "./beebopError";

function sendError(response: Response, error: {error: string, detail: string}, status: number) {
    response.status(status).json({
        status: "failure",
        errors: [error],
        data: null
    });
}

// Need to include the unused next var for this to be used correctly as an error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleError = (err: Error, req: Request, res: Response, _: () => void) => {
    const beebopError = err instanceof BeebopError;

    const status = beebopError ? err.status : 500;
    const type = beebopError ? err.errorType : "Unexpected error";

    // Do not return raw messages from unexpected errors
    const detail = beebopError ? err.message
        : `An unexpected error occurred. Please contact support and quote error code ${uid()}`;

    // Set error type, detail and stack on req so morgan logs them
    reqWithError(req).errorType = type;
    reqWithError(req).errorDetail = detail;
    reqWithError(req).errorStack = err.stack;

    sendError(res, {error: type, detail}, status);
};
