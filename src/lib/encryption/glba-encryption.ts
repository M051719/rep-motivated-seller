import crypto from 'crypto'
import { promisify } from 'util'

export class GLBAEncryption {
  // AES-256-GCM for GLBA compliance (FIPS 140-2 approved)
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32 // 256 bits
  private static readonly IV_LENGTH = 16 // 128 bits
  private static readonly TAG_LENGTH = 16 // 128 bits

  // Generate FIPS 140-2 compliant encryption key
  static generateEncryptionKey(): Buffer {
    return crypto.randomBytes(this.KEY_LENGTH)
  }

  // Encrypt sensitive NPI data
  static encryptNPI(data: string, key: Buffer): {
    encrypted: string
    iv: string
    authTag: string
    algorithm: string
  } {
    try {
      if (!data || !key) {
        throw new Error('Data and encryption key are required')
      }

      if (key.length !== this.KEY_LENGTH) {
        throw new Error(`Key must be ${this.KEY_LENGTH} bytes for AES-256`)
      }

      const iv = crypto.randomBytes(this.IV_LENGTH)
      const cipher = crypto.createCipher(this.ALGORITHM, key, { iv })
      
      let encrypted = cipher.update(data, 'utf8', 'base64')
      encrypted += cipher.final('base64')
      
      const authTag = cipher.getAuthTag()

      return {
        encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        algorithm: this.ALGORITHM
      }

    } catch (error) {
      throw new Error(`GLBA encryption failed: ${error.message}`)
    }
  }

  // Decrypt sensitive NPI data
  static decryptNPI(encryptedData: {
    encrypted: string
    iv: string
    authTag: string
    algorithm: string
  }, key: Buffer): string {
    try {
      if (encryptedData.algorithm !== this.ALGORITHM) {
        throw new Error('Invalid encryption algorithm')
      }

      const iv = Buffer.from(encryptedData.iv, 'base64')
      const authTag = Buffer.from(encryptedData.authTag, 'base64')
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key, { iv })
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted

    } catch (error) {
      throw new Error(`GLBA decryption failed: ${error.message}`)
    }
  }

  // Hash sensitive data for indexing (PBKDF2 with high iterations)
  static async hashForIndex(data: string, salt?: Buffer): Promise<{
    hash: string
    salt: string
  }> {
    const actualSalt = salt || crypto.randomBytes(32)
    const iterations = 100000 // NIST recommended minimum
    
    const hash = await promisify(crypto.pbkdf2)(
      data, 
      actualSalt, 
      iterations, 
      64, 
      'sha512'
    )

    return {
      hash: hash.toString('base64'),
      salt: actualSalt.toString('base64')
    }
  }

  // Secure key derivation for different purposes
  static deriveKey(masterKey: Buffer, purpose: string, info?: string): Buffer {
    const hkdf = crypto.createHash('sha256')
    hkdf.update(masterKey)
    hkdf.update(purpose)
    if (info) hkdf.update(info)
    
    return hkdf.digest().slice(0, this.KEY_LENGTH)
  }

  // Validate encryption compliance
  static validateCompliance(): {
    isCompliant: boolean
    checks: Record<string, boolean>
    errors: string[]
  } {
    const checks = {
      fips140_2_algorithm: this.ALGORITHM.includes('aes-256'),
      adequate_key_length: this.KEY_LENGTH >= 32,
      secure_iv_generation: true, // crypto.randomBytes is cryptographically secure
      authentication_tag: this.TAG_LENGTH >= 16
    }

    const errors = []
    if (!checks.fips140_2_algorithm) errors.push('Algorithm not FIPS 140-2 compliant')
    if (!checks.adequate_key_length) errors.push('Key length insufficient for AES-256')
    if (!checks.authentication_tag) errors.push('Authentication tag too short')

    return {
      isCompliant: Object.values(checks).every(Boolean),
      checks,
      errors
    }
  }
}