import { Application, Request, Response } from "express";

import morgan from "morgan";

interface RequestWithError {
    errorType: string,
    errorDetail: string,
    errorStack: string | undefined
}

export const reqWithError = (req: Request) => (req as unknown) as RequestWithError;

export const initialiseLogging = (app: Application) => {
    morgan.token("error-type", (req: Request) => reqWithError(req).errorType);
    morgan.token("error-detail", (req: Request) => reqWithError(req).errorDetail);
    morgan.token("error-stack", (req: Request) => reqWithError(req).errorStack);

    const customFormat = (tokens: any, req: Request, res: Response) => {
        return [
            tokens["remote-addr"](req, res),
            tokens["remote-user"](req, res),
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, "content-length"), "-",
            tokens["response-time"](req, res), "ms",
            tokens["error-type"](req),
            tokens["error-detail"](req),
            tokens["error-stack"](req)
        ].join(" ");
    };

    app.use(morgan(customFormat));
};