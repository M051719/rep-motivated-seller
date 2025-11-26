export interface PayPalOrder {
  id: string
  status: string
  purchase_units: Array<{
    amount: {
      currency_code: string
      value: string
    }
    description: string
  }>
  payer?: {
    name?: {
      given_name: string
      surname: string
    }
    email_address: string
  }
  create_time: string
  update_time: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

export interface PayPalSubscription {
  id: string
  plan_id: string
  status: string
  subscriber: {
    name: {
      given_name: string
      surname: string
    }
    email_address: string
  }
  create_time: string
  start_time: string
  billing_info: {
    outstanding_balance: {
      currency_code: string
      value: string
    }
    cycle_executions: Array<{
      tenure_type: string
      sequence: number
      cycles_completed: number
      cycles_remaining: number
    }>
  }
}

class PayPalService {
  private clientId: string
  private clientSecret: string
  private baseUrl: string

  constructor() {
    this.clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || ''
    this.clientSecret = import.meta.env.VITE_PAYPAL_CLIENT_SECRET || ''
    this.baseUrl = import.meta.env.NODE_ENV === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'
  }

  // Get access token
  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials'
      })
    })

    const data = await response.json()
    return data.access_token
  }

  // Create order for one-time payment
  async createOrder(amount: number, currency: string = 'USD', description: string = 'Consultation Payment'): Promise<PayPalOrder | null> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            },
            description: description
          }],
          payment_source: {
            paypal: {
              experience_context: {
                payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                brand_name: 'RepMotivatedSeller',
                locale: 'en-US',
                landing_page: 'LOGIN',
                user_action: 'PAY_NOW',
                return_url: `${window.location.origin}/payment/success`,
                cancel_url: `${window.location.origin}/payment/cancel`
              }
            }
          }
        })
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('PayPal create order error:', error)
      return null
    }
  }

  // Capture order payment
  async captureOrder(orderId: string): Promise<PayPalOrder | null> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('PayPal capture order error:', error)
      return null
    }
  }

  // Create subscription plan
  async createSubscriptionPlan(
    name: string,
    description: string,
    amount: number,
    interval: 'MONTH' | 'YEAR',
    currency: string = 'USD'
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v1/billing/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `plan-${Date.now()}` // Idempotency key
        },
        body: JSON.stringify({
          product_id: await this.createProduct(name, description),
          name: name,
          description: description,
          status: 'ACTIVE',
          billing_cycles: [{
            frequency: {
              interval_unit: interval,
              interval_count: 1
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0, // Infinite
            pricing_scheme: {
              fixed_price: {
                value: amount.toFixed(2),
                currency_code: currency
              }
            }
          }],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: 'CONTINUE',
            payment_failure_threshold: 3
          },
          taxes: {
            percentage: '0.00',
            inclusive: false
          }
        })
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('PayPal create subscription plan error:', error)
      return null
    }
  }

  // Create product (required for subscription plans)
  private async createProduct(name: string, description: string): Promise<string> {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: name,
        description: description,
        type: 'SERVICE',
        category: 'SOFTWARE',
        image_url: `${window.location.origin}/images/logo.png`,
        home_url: window.location.origin
      })
    })

    const data = await response.json()
    return data.id
  }

  // Create subscription
  async createSubscription(planId: string, subscriberName: string, subscriberEmail: string): Promise<PayPalSubscription | null> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `subscription-${Date.now()}`
        },
        body: JSON.stringify({
          plan_id: planId,
          subscriber: {
            name: {
              given_name: subscriberName.split(' ')[0] || 'User',
              surname: subscriberName.split(' ').slice(1).join(' ') || 'Name'
            },
            email_address: subscriberEmail
          },
          application_context: {
            brand_name: 'RepMotivatedSeller',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            payment_method: {
              payer_selected: 'PAYPAL',
              payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
            },
            return_url: `${window.location.origin}/subscription/success`,
            cancel_url: `${window.location.origin}/subscription/cancel`
          }
        })
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('PayPal create subscription error:', error)
      return null
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<PayPalSubscription | null> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('PayPal get subscription error:', error)
      return null
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, reason: string = 'User requested cancellation'): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reason: reason
        })
      })

      return response.ok
    } catch (error) {
      console.error('PayPal cancel subscription error:', error)
      return false
    }
  }

  // Verify webhook signature
  async verifyWebhookSignature(
    webhookId: string,
    headers: any,
    body: string
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_id: headers['paypal-cert-id'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: JSON.parse(body)
        })
      })

      const data = await response.json()
      return data.verification_status === 'SUCCESS'
    } catch (error) {
      console.error('PayPal webhook verification error:', error)
      return false
    }
  }
}

export default new PayPalService()