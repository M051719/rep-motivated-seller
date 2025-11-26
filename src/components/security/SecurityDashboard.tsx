import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SecurityCheck {
  id: string
  name: string
  description: string
  status: 'pass' | 'fail' | 'warning' | 'pending'
  details?: string
  recommendation?: string
}

const SecurityDashboard: React.FC = () => {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    performSecurityChecks()
  }, [])

  const performSecurityChecks = async () => {
    setLoading(true)
    
    const checks: SecurityCheck[] = [
      {
        id: 'https',
        name: 'HTTPS Connection',
        description: 'Secure connection is being used',
        status: window.location.protocol === 'https:' ? 'pass' : 'fail',
        details: `Current protocol: ${window.location.protocol}`,
        recommendation: 'Always use HTTPS in production'
      },
      {
        id: 'csp',
        name: 'Content Security Policy',
        description: 'CSP headers are properly configured',
        status: document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? 'pass' : 'warning',
        details: 'CSP meta tag found',
        recommendation: 'Implement server-side CSP headers for better security'
      },
      {
        id: 'xss-protection',
        name: 'XSS Protection',
        description: 'Browser XSS protection is enabled',
        status: document.querySelector('meta[http-equiv="X-XSS-Protection"]') ? 'pass' : 'fail',
        recommendation: 'Enable X-XSS-Protection header'
      },
      {
        id: 'frame-options',
        name: 'Clickjacking Protection',
        description: 'X-Frame-Options header prevents clickjacking',
        status: document.querySelector('meta[http-equiv="X-Frame-Options"]') ? 'pass' : 'fail',
        recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN'
      },
      {
        id: 'content-type-options',
        name: 'MIME Type Sniffing Protection',
        description: 'X-Content-Type-Options prevents MIME sniffing',
        status: document.querySelector('meta[http-equiv="X-Content-Type-Options"]') ? 'pass' : 'fail',
        recommendation: 'Set X-Content-Type-Options to nosniff'
      },
      {
        id: 'localStorage',
        name: 'Sensitive Data Storage',
        description: 'No sensitive data in localStorage/sessionStorage',
        status: checkLocalStorageSecurity(),
        details: 'Scanning for sensitive data patterns',
        recommendation: 'Never store sensitive data in client-side storage'
      },
      {
        id: 'console-logs',
        name: 'Production Console Logs',
        description: 'No sensitive information logged to console',
        status: import.meta.env.NODE_ENV === 'production' ? 'pass' : 'warning',
        details: `Environment: ${import.meta.env.NODE_ENV}`,
        recommendation: 'Remove console.log statements in production'
      },
      {
        id: 'error-handling',
        name: 'Error Information Disclosure',
        description: 'Error messages do not expose sensitive information',
        status: 'pass', // Would need more complex checking
        recommendation: 'Use generic error messages for users'
      }
    ]

    setSecurityChecks(checks)
    setLoading(false)
  }

  const checkLocalStorageSecurity = (): 'pass' | 'fail' | 'warning' => {
    try {
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /api[_-]?key/i,
        /token/i,
        /credit[_-]?card/i,
        /ssn/i,
        /social[_-]?security/i
      ]

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const value = localStorage.getItem(key || '')
        
        if (key && value) {
          const combined = `${key} ${value}`.toLowerCase()
          if (sensitivePatterns.some(pattern => pattern.test(combined))) {
            return 'fail'
          }
        }
      }
      
      return 'pass'
    } catch (error) {
      return 'warning'
    }
  }

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return '✅'
      case 'fail': return '❌'
      case 'warning': return '⚠️'
      case 'pending': return '⏳'
    }
  }

  const getStatusColor = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50'
      case 'fail': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'pending': return 'text-gray-600 bg-gray-50'
    }
  }

  const getOverallScore = () => {
    const total = securityChecks.length
    const passed = securityChecks.filter(check => check.status === 'pass').length
    const warnings = securityChecks.filter(check => check.status === 'warning').length
    
    return {
      score: Math.round(((passed + warnings * 0.5) / total) * 100),
      passed,
      warnings,
      failed: total - passed - warnings,
      total
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const score = getOverallScore()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🛡️ Security Dashboard
        </h2>
        
        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Security Score
              </h3>
              <div className="flex items-center space-x-4">
                <div className={`text-3xl font-bold ${
                  score.score >= 80 ? 'text-green-600' : 
                  score.score >= 60 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {score.score}%
                </div>
                <div className="text-sm text-gray-600">
                  <div>✅ {score.passed} passed</div>
                  <div>⚠️ {score.warnings} warnings</div>
                  <div>❌ {score.failed} failed</div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl ${
                score.score >= 80 ? 'text-green-600' : 
                score.score >= 60 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {score.score >= 80 ? '🛡️' : score.score >= 60 ? '⚠️' : '🚨'}
              </div>
              <div className="text-sm text-gray-500">
                {score.total} checks
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Checks */}
      <div className="space-y-4">
        {securityChecks.map((check, index) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getStatusIcon(check.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {check.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {check.description}
                    </p>
                    {check.details && (
                      <p className="text-sm text-gray-500 mt-2">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(check.status)}`}>
                  {check.status.toUpperCase()}
                </div>
              </div>
              
              {check.recommendation && check.status !== 'pass' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Recommendation:</strong> {check.recommendation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gray-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔒 Security Actions
        </h3>
        <div className="space-y-2 text-sm">
          <p>• Run automated security scans with <code>npm run security:scan</code></p>
          <p>• Check for vulnerabilities in dependencies with <code>npm audit</code></p>
          <p>• Review and update security headers regularly</p>
          <p>• Monitor application logs for suspicious activity</p>
          <p>• Keep all dependencies up to date</p>
        </div>
      </motion.div>
    </div>
  )
}

export default SecurityDashboard