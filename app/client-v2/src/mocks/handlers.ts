import { HttpHandler, HttpResponse, http } from "msw";
import { userHandlers } from "./handlers/userHandlers";
import { projectHandlers } from "./handlers/projectHandlers";
import { configHandlers } from "./handlers/configHandlers";

// catch any missed requests in tests
const defaultHandlers = [http.all("*", () => new HttpResponse(null, { status: 200 }))];

export const handlers: HttpHandler[] = [...userHandlers, ...projectHandlers, ...configHandlers, ...defaultHandlers];
