import {BeebopError} from "./errors/beebopError";
import {APIResponse} from "./types/responseTypes";

export function throwAPIError(response, error: any) {
    if (error.response) {
        const apiResponse = error.response.data.error as APIResponse<any>;
        throw new BeebopError(apiResponse.errors[0].error, apiResponse.errors[0].detail, error.response.status);
    } else {
        throw new BeebopError("Could not connect to API", error.toString(), 500);
    }
}

export function sendError(response, error, status = 500) {
    response.status(status).send({
        status: "failure",
        errors: [error],
        data: null
    });
}

export function sendSuccess(response, data) {
    response.json({
        status: 'success',
        errors: [],
        data
    });
}