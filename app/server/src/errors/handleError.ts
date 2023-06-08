import { Request, Response } from "express";
import { uid } from "uid";
import { jsonResponseError } from "../jsonResponse";
import { reqWithError } from "../logging";
import { ErrorType } from "./errorType";
import { BeebopError } from "./beebopError";

// Need to include the unused next var for this to be used correctly as an error handler
export const handleError = (err: Error, req: Request, res: Response, _: Function) => {
    const beebopError = err instanceof BeebopError;

    const status = beebopError ? err.status : 500;
    const type = beebopError ? err.errorType : ErrorType.OTHER_ERROR;

    // Do not return raw messages from unexpected errors to the front end
    const detail = beebopError ? err.message
        : `An unexpected error occurred. Please contact support and quote error code ${uid()}`;

    // Set error type, detail and stack on req so morgan logs them
    reqWithError(req).errorType = type;
    reqWithError(req).errorDetail = detail;
    reqWithError(req).errorStack = err.stack;

    // Return JSON error response if request is for JSON, otherwise render error view
    const jsonRequest = req.headers.accept?.includes("application/json");
    if (jsonRequest) {
        jsonResponseError(status, type, detail, res);

    } else {
        res.status(status).render("error", { detail });
    }
};
