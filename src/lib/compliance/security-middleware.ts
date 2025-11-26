import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import rateLimit from 'express-rate-limit'

// PCI DSS Rate Limiting (Requirement 1)
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Payment endpoint rate limiting (stricter)
export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 10, // 10 payment attempts per 15 minutes
  message: 'Payment rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Session timeout (PCI DSS Requirement 8)
export const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes

// Strong password validation (PCI DSS Requirement 8)
export const validatePassword = (password: string) => {
  const minLength = 12
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSymbols,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase, 
      hasNumbers,
      hasSymbols
    }
  }
}

// Audit logging (PCI DSS Requirement 10)
export const auditLog = (action: string, userId: string, details: any) => {
  console.log({
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ip: details.ip,
    userAgent: details.userAgent
  })
  // Send to logging service
}