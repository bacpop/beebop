import {BeebopError} from "./errors/beebopError";
import {APIResponse} from "./types/responseTypes";
import {AxiosError} from "axios";
import {handleError} from "./errors/handleError";

export function handleAPIError(request, response, error: AxiosError<any>) {
    let beebopError: BeebopError;
    if (error.response) {
        const apiResponse = error.response.data.error as APIResponse<any>;
        beebopError =  new BeebopError(apiResponse.errors[0].error, apiResponse.errors[0].detail, error.response.status);
    } else {
        beebopError = new BeebopError("Could not connect to API", error.toString());
    }
    handleError(beebopError, request, response, null);
}

export function sendSuccess(response, data) {
    response.json({
        status: 'success',
        errors: [],
        data
    });
}