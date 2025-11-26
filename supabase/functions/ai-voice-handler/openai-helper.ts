// OpenAI Helper for AI-Powered Voice Conversations
// Handles natural language conversations with callers

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIConversationContext {
  phoneNumber: string
  conversationHistory: ConversationMessage[]
  userIntent?: string
  callContext?: any
}

/**
 * Get AI-powered response from OpenAI
 */
export async function getAIResponse(context: AIConversationContext): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4-turbo-preview'
  const maxTokens = parseInt(Deno.env.get('MAX_OUTPUT_TOKENS') || '150')

  if (!openaiApiKey) {
    console.error('OPENAI_API_KEY not set!')
    return getFallbackResponse()
  }

  const systemPrompt = `You are a helpful, empathetic assistant for RepMotivatedSeller, a company that helps homeowners facing foreclosure.

Key Information About RepMotivatedSeller:
- We provide FREE foreclosure assistance consultations
- We help homeowners explore ALL options to save their home
- We guide them through the foreclosure process
- We work with lenders, provide legal resources, and offer solutions
- Website: repmotivatedseller.com
- Phone: 1-877-806-4677
- Available Monday-Friday, 9 AM - 5 PM Pacific Time

Your Role & Guidelines:
- Be warm, empathetic, and understanding - these callers are stressed
- Keep responses BRIEF (under 100 words) - this is a phone call
- Speak naturally and conversationally, avoid jargon
- Ask ONE clarifying question at a time
- Listen for emotional cues and respond appropriately
- NEVER make promises you can't keep
- Always offer to transfer to a specialist if they want

Common Caller Situations:
1. Behind on mortgage payments
2. Received foreclosure notice
3. Want to know their options
4. Need immediate help
5. Questions about the process

Transfer Triggers - If caller says:
- "I want to speak to someone"
- "Transfer me"
- "Can I talk to a person"
- Any variation of wanting human contact
→ Respond: "Of course, let me transfer you to one of our foreclosure specialists right away."

Remember: You're providing initial assistance and gathering info. For detailed help, transfer to specialists.`

  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory
  ]

  try {
    console.log(`[OPENAI] Sending request with ${messages.length} messages`)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[OPENAI ERROR] ${response.status}: ${errorText}`)
      return getFallbackResponse()
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content

    if (!aiMessage) {
      console.error('[OPENAI ERROR] No message in response')
      return getFallbackResponse()
    }

    console.log(`[OPENAI SUCCESS] Response: ${aiMessage.substring(0, 100)}...`)
    return aiMessage.trim()

  } catch (error) {
    console.error('[OPENAI ERROR]', error)
    return getFallbackResponse()
  }
}

/**
 * Check if caller wants to speak to a human
 */
export function shouldHandoffToHuman(transcript: string): boolean {
  if (!transcript) return false

  const keywords = (Deno.env.get('AI_HANDOFF_KEYWORDS') ||
    'agent,human,representative,speak to someone,talk to person,real person').split(',')

  const lowerTranscript = transcript.toLowerCase()

  const shouldTransfer = keywords.some(keyword =>
    lowerTranscript.includes(keyword.trim().toLowerCase())
  )

  if (shouldTransfer) {
    console.log(`[HANDOFF TRIGGERED] Transcript: "${transcript}"`)
  }

  return shouldTransfer
}

/**
 * Fallback response if OpenAI fails
 */
function getFallbackResponse(): string {
  return "I'm here to help with your foreclosure situation. Could you tell me a bit more about what you're facing, or would you like me to transfer you to one of our specialists?"
}

/**
 * Check if conversation has exceeded max turns
 */
export function hasExceededMaxTurns(turnCount: number): boolean {
  const maxTurns = parseInt(Deno.env.get('AI_MAX_CONVERSATION_TURNS') || '20')
  return turnCount >= maxTurns
}

/**
 * Generate a conversation summary for handoff
 */
export function generateConversationSummary(history: ConversationMessage[]): string {
  const userMessages = history
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' | ')

  return `Caller discussed: ${userMessages.substring(0, 200)}${userMessages.length > 200 ? '...' : ''}`
}
