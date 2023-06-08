// TODO: use handleError instead of sendAPIError
export function sendAPIError(response, error) {
    const responseError = error.response ?
        {error: error.response.data.error.errors[0].error, detail: error.response.data.error.errors[0].detail} :
        {error: 'Could not connect to API', detail: error};
    sendError(response, responseError);
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