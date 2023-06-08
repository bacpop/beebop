import {BeebopError} from "./errors/beebopError";
import {APIResponse} from "./types/responseTypes";
import {AxiosError} from "axios";

export function throwAPIError(response, error: AxiosError<any>) {
    if (error.response) {
        const apiResponse = error.response.data.error as APIResponse<any>;
        throw new BeebopError(apiResponse.errors[0].error, apiResponse.errors[0].detail, error.response.status);
    } else {
        throw new BeebopError("Could not connect to API", error.toString(), 500);
    }
}

export function sendSuccess(response, data) {
    response.json({
        status: 'success',
        errors: [],
        data
    });
}