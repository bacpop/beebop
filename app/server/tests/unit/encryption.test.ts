import encryption from "../../src/encryption";

describe("encryption", () => {
    it("can encrypt and decrypt text", () => {
        const testString = "some test text";
        const request = {
            app: {
                locals: {
                    encryptKey: "1234567890ABCDEF1234567890ABCDEF"
                }
            }
        } as any;
        const encrypted = encryption.encrypt(testString, request);
        expect(encrypted.length).toBe(16 + (testString.length * 2));
        const decrypted = encryption.decrypt(encrypted, request);
        expect(decrypted).toBe(testString);
    });
});