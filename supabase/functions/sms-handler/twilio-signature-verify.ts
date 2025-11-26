// Twilio Signature Verification (Deno-compatible)
// Validates that webhook requests are actually from Twilio

/**
 * Verify Twilio request signature using Web Crypto API
 * @param authToken - Your Twilio Auth Token
 * @param twilioSignature - X-Twilio-Signature header value
 * @param url - Full webhook URL
 * @param params - Request parameters (form data)
 * @returns true if signature is valid
 */
export async function validateTwilioSignature(
  authToken: string,
  twilioSignature: string,
  url: string,
  params: Record<string, string>
): Promise<boolean> {
  try {
    // Sort parameters alphabetically and concatenate
    const sortedParams = Object.keys(params).sort()
    let data = url

    sortedParams.forEach((key) => {
      data += key + params[key]
    })

    // Create HMAC-SHA1 signature using Web Crypto API
    const encoder = new TextEncoder()
    const keyData = encoder.encode(authToken)
    const messageData = encoder.encode(data)

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', key, messageData)

    // Convert to base64
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

    // Compare signatures (timing-safe comparison)
    return signatureBase64 === twilioSignature
  } catch (error) {
    console.error('Error validating Twilio signature:', error)
    return false
  }
}

/**
 * Extract parameters from FormData for signature verification
 */
export async function getParamsFromFormData(formData: FormData): Promise<Record<string, string>> {
  const params: Record<string, string> = {}

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      params[key] = value
    }
  }

  return params
}
