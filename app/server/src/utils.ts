import {BeebopError} from "./errors/beebopError";
import {APIResponse} from "./types/responseTypes";
import {AxiosError} from "axios";
import {handleError} from "./errors/handleError";

export function handleAPIError(request, response, error: AxiosError<any>) {
    let errorType: string;
    let errorMessage: string;
    let status: number;
    if (error.response) {
        status = error.response.status;
        const apiResponse = error.response.data.error as APIResponse<any>;
        const firstError = apiResponse?.errors && apiResponse.errors[0];
        errorType = firstError ? firstError.error : "Malformed response from API";
        errorMessage = firstError ? firstError.detail : "The API returned a response which could not be parsed";
    } else {
        status = 500;
        errorType = "Could not connect to API";
        errorMessage = error.toString();
    }
    handleError(new BeebopError(errorType, errorMessage, status), request, response, null);
}

export function sendSuccess(response, data) {
    response.json({
        status: 'success',
        errors: [],
        data
    });
}