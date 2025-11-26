import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY! // 32 bytes key
const ALGORITHM = 'aes-256-gcm'

// Encrypt sensitive data (PCI DSS Requirement 3)
export const encryptSensitiveData = (text: string): string => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  cipher.setAAD(Buffer.from('rep-motivated-seller', 'utf8'))
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

// Decrypt sensitive data
export const decryptSensitiveData = (encryptedText: string): string => {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  
  decipher.setAuthTag(authTag)
  decipher.setAAD(Buffer.from('rep-motivated-seller', 'utf8'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Hash PII for GLBA compliance
export const hashPII = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex')
}