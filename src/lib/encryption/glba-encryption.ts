/**
 * GLBA Encryption Library
 * Provides AES-256-GCM encryption for sensitive financial data
 * Compliant with GLBA Safeguards Rule and FIPS 140-2 standards
 */

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  algorithm: "aes-256-gcm";
  keyId?: string;
  timestamp: string;
}

export interface EncryptionMetadata {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  authTagLength: number;
  fipsCompliant: boolean;
}

export class GLBAEncryption {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;
  private static readonly PBKDF2_ITERATIONS = 100000;

  private static toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  }

  private static getMasterKey(): string {
    const key =
      import.meta.env?.VITE_GLBA_MASTER_KEY ||
      process.env?.GLBA_MASTER_KEY ||
      process.env?.VITE_GLBA_MASTER_KEY;

    if (!key) {
      throw new Error("GLBA_MASTER_KEY not configured");
    }

    try {
      const decoded = this.base64ToBuffer(key);
      if (decoded.length !== this.KEY_LENGTH) {
        throw new Error(
          `Invalid key length: expected ${this.KEY_LENGTH}, got ${decoded.length}`,
        );
      }
      return key;
    } catch (error) {
      throw new Error(
        `Invalid GLBA_MASTER_KEY format: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }

  public static isEnabled(): boolean {
    const enabled =
      import.meta.env?.VITE_GLBA_ENCRYPTION_ENABLED ||
      process.env?.GLBA_ENCRYPTION_ENABLED;
    return enabled === "true" || enabled === true;
  }

  public static async encryptNPI(
    plaintext: string,
    keyId?: string,
  ): Promise<EncryptedData> {
    if (!this.isEnabled()) throw new Error("GLBA encryption not enabled");

    try {
      const keyBytes = this.base64ToBuffer(this.getMasterKey()) as Uint8Array;
      const key = this.toArrayBuffer(keyBytes);
      const iv = new Uint8Array(this.IV_LENGTH);
      crypto.getRandomValues(iv);
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["encrypt"],
      );
      const plaintextBuffer = new TextEncoder().encode(plaintext);
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: this.toArrayBuffer(iv),
          tagLength: this.AUTH_TAG_LENGTH * 8,
        },
        cryptoKey,
        plaintextBuffer,
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);
      const ciphertext = encryptedArray.slice(0, -this.AUTH_TAG_LENGTH);
      const authTag = encryptedArray.slice(-this.AUTH_TAG_LENGTH);

      return {
        ciphertext: this.bufferToBase64(ciphertext),
        iv: this.bufferToBase64(iv),
        authTag: this.bufferToBase64(authTag),
        algorithm: this.ALGORITHM,
        keyId: keyId || "master",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }

  public static async decryptNPI(
    encryptedData: EncryptedData,
  ): Promise<string> {
    if (!this.isEnabled()) throw new Error("GLBA encryption not enabled");
    if (encryptedData.algorithm !== this.ALGORITHM)
      throw new Error(`Unsupported algorithm: ${encryptedData.algorithm}`);

    try {
      const keyBytes = this.base64ToBuffer(this.getMasterKey()) as Uint8Array;
      const key = this.toArrayBuffer(keyBytes);
      const ciphertext = this.base64ToBuffer(encryptedData.ciphertext) as Uint8Array;
      const iv = this.base64ToBuffer(encryptedData.iv) as Uint8Array;
      const authTag = this.base64ToBuffer(encryptedData.authTag) as Uint8Array;

      const combined = new Uint8Array(ciphertext.length + authTag.length);
      combined.set(ciphertext, 0);
      combined.set(authTag, ciphertext.length);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["decrypt"],
      );
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: this.toArrayBuffer(iv),
          tagLength: this.AUTH_TAG_LENGTH * 8,
        },
        cryptoKey,
        combined,
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "authentication failed"}`,
      );
    }
  }

  public static async hashForIndex(
    data: string,
    salt?: string,
  ): Promise<{ hash: string; salt: string }> {
    const saltBuffer = salt
      ? this.base64ToBuffer(salt)
      : crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(data),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: this.toArrayBuffer(saltBuffer as Uint8Array),
        iterations: this.PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    );

    return {
      hash: this.bufferToBase64(new Uint8Array(hashBuffer)),
      salt: this.bufferToBase64(saltBuffer),
    };
  }

  public static async deriveKey(info: string, length = 32): Promise<string> {
    const masterKey = this.base64ToBuffer(this.getMasterKey());
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      masterKey as BufferSource,
      "HKDF",
      false,
      ["deriveBits"],
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array(0),
        info: new TextEncoder().encode(info),
      },
      keyMaterial,
      length * 8,
    );
    return this.bufferToBase64(new Uint8Array(derivedBits));
  }

  public static validateCompliance(): EncryptionMetadata {
    try {
      this.getMasterKey();
    } catch {
      throw new Error("GLBA_MASTER_KEY not configured");
    }
    if (!this.isEnabled()) throw new Error("GLBA encryption not enabled");

    return {
      algorithm: this.ALGORITHM,
      keyLength: this.KEY_LENGTH,
      ivLength: this.IV_LENGTH,
      authTagLength: this.AUTH_TAG_LENGTH,
      fipsCompliant: true,
    };
  }

  public static getComplianceInfo() {
    return {
      enabled: this.isEnabled(),
      algorithm: this.ALGORITHM,
      keyRotationDays: parseInt(
        import.meta.env?.VITE_GLBA_KEY_ROTATION_DAYS ||
          process.env?.GLBA_KEY_ROTATION_DAYS ||
          "90",
      ),
      auditRetentionDays: parseInt(
        import.meta.env?.VITE_GLBA_AUDIT_RETENTION_DAYS ||
          process.env?.GLBA_AUDIT_RETENTION_DAYS ||
          "2555",
      ),
      tlsMinVersion:
        import.meta.env?.VITE_TLS_MIN_VERSION ||
        process.env?.TLS_MIN_VERSION ||
        "1.3",
    };
  }

  private static bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  private static base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}

export async function encryptSSN(ssn: string): Promise<EncryptedData> {
  if (!/^\d{3}-?\d{2}-?\d{4}$/.test(ssn)) throw new Error("Invalid SSN format");
  return GLBAEncryption.encryptNPI(ssn, "ssn");
}

export async function encryptBankAccount(
  accountNumber: string,
): Promise<EncryptedData> {
  return GLBAEncryption.encryptNPI(accountNumber, "bank_account");
}

export async function encryptCreditCard(
  cardNumber: string,
): Promise<EncryptedData> {
  const cleanCard = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleanCard))
    throw new Error("Invalid credit card format");
  return GLBAEncryption.encryptNPI(cleanCard, "credit_card");
}

export async function encryptFinancialData(
  data: object,
): Promise<EncryptedData> {
  return GLBAEncryption.encryptNPI(JSON.stringify(data), "financial_data");
}
