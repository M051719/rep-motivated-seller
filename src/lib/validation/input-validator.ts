import { z } from 'zod'

export const ForeclosureFormSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  propertyAddress: z.string().min(5).max(200),
  mortgageBalance: z.number().positive().max(10000000),
  missedPayments: z.number().int().min(0).max(100)
})

export const validateInput = (data: unknown) => {
  try {
    return ForeclosureFormSchema.parse(data)
  } catch (error) {
    throw new Error(`Invalid input: ${error.message}`)
  }
}

// Usage in Edge Functions:
const validatedData = validateInput(formData)