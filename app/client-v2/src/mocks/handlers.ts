import { HttpHandler, HttpResponse, http } from "msw";
import { userHandlers } from "./handlers/userHandlers";
import { projectHandlers } from "./handlers/projectHandlers";

// catch any missed requests in tests
const defaultHandlers = [http.all("*", () => new HttpResponse(null, { status: 200 }))];

export const handlers: HttpHandler[] = [...userHandlers, ...projectHandlers, ...defaultHandlers];
