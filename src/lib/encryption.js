import * as Crypto from "crypto";

export default class Encryption {
    static algorithm = "aes-192-cbc";
    static key = Crypto.scryptSync("6edc284745c7273f56ab68fc6299eb8a", "salt", 24);
    static iv = Buffer.alloc(16, 0);

    static encrypt(value) {
        let cipher = Crypto.createCipheriv(Encryption.algorithm, Buffer.from(Encryption.key), Encryption.iv);
        let encrypted = cipher.update(value);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return encrypted.toString("hex");
    }

    static decrypt(value) {
        let decipher = Crypto.createDecipheriv(Encryption.algorithm, Buffer.from(Encryption.key), Encryption.iv);
        let decrypted = decipher.update(Buffer.from(value, "hex"));

        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
       }
}
