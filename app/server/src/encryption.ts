import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { Request } from "express";

const algorithm = 'aes-256-ctr'
const encoding = "utf16le";
const ivLength = 16;

const initVector = () => randomBytes(ivLength);
const encryptKey = (request: Request) => request.app.locals.encryptKey;

export default {
    encrypt: (text: string, request: Request): Buffer => {
        const iv = initVector();
        const cipher = createCipheriv(algorithm, encryptKey(request), iv);
        const encrypted = cipher.update(text, encoding);
        return Buffer.concat([iv, encrypted, cipher.final()])
    },
    decrypt: (buffer: Buffer, request: Request): string => {
        const iv = buffer.slice(0, ivLength);
        const encrypted = buffer.slice(ivLength);
        const decipher = createDecipheriv(algorithm, encryptKey(request), iv);
        let decrypted = decipher.update(encrypted, undefined, encoding);
        decrypted += decipher.final(encoding);
        return decrypted;
    }
}