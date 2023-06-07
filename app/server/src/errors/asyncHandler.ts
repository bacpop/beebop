import { NextFunction } from "express";

// This method should be used to wrap any async JSON endpoint methods to ensure error handling is applied
// eslint-disable-next-line @typescript-eslint/ban-types
export default async (next: Function, method: NextFunction) => {
    try {
        await method();
    } catch (error) {
        next(error);
    }
};