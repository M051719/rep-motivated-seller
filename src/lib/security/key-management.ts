/**
 * GLBA Key Management
 * Handles encryption key generation and management for GLBA compliance
 */

export class GLBAKeyManagement {
  private static instance: GLBAKeyManagement;

  private constructor() {}

  static getInstance(): GLBAKeyManagement {
    if (!GLBAKeyManagement.instance) {
      GLBAKeyManagement.instance = new GLBAKeyManagement();
    }
    return GLBAKeyManagement.instance;
  }

  static async getActiveKey(): Promise<{
    id: string;
    key_data: string;
    cryptoKey: CryptoKey;
  }> {
    const instance = GLBAKeyManagement.getInstance();
    const cryptoKey = await instance.getActiveKey();
    const key_data = await instance.exportKey(cryptoKey);
    return { id: "active", key_data, cryptoKey };
  }

  async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  async importKey(keyData: string): Promise<CryptoKey> {
    const decoded = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
      'raw',
      decoded,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async getActiveKey(): Promise<CryptoKey> {
    return await this.generateKey();
  }
}

export default GLBAKeyManagement;
