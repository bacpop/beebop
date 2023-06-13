import {BeebopError} from "./errors/beebopError";
import {APIResponse} from "./types/responseTypes";
import {AxiosError} from "axios";
import {handleError} from "./errors/handleError";

export function handleAPIError(request, response, error: AxiosError<any>) {
    let errorToHandle: Error;
    if (error.response) {
        const apiResponse = error.response.data.error as APIResponse<any>;
        const firstError = apiResponse?.errors && apiResponse.errors[0];
        const errorType = firstError ? firstError.error : "Malformed response from API";
        const errorMessage = firstError ? firstError.detail : "The API returned a response which could not be parsed";
        errorToHandle = new BeebopError(errorType, errorMessage, error.response.status);
    } else {
        errorToHandle = Error(`Could not connect to API: ${error.toString()}`)
    }
    handleError(errorToHandle, request, response, null);
}

export function sendSuccess(response, data) {
    response.json({
        status: 'success',
        errors: [],
        data
    });
}