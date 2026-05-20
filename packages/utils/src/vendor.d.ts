declare module "sm-crypto" {
  export const sm4: {
    encrypt(
      input: string,
      key: string,
      options?: {
        mode?: "cbc" | "ecb";
        iv?: string;
        padding?: "pkcs#5" | "pkcs#7";
      }
    ): string;
    decrypt(
      input: string,
      key: string,
      options?: {
        mode?: "cbc" | "ecb";
        iv?: string;
        output?: "string" | "array";
        padding?: "pkcs#5" | "pkcs#7";
      }
    ): string;
  };
}
