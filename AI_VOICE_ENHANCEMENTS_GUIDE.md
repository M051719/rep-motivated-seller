# AI Voice Handler Enhancements - Implementation Guide

## 🎯 Overview

This guide implements 5 key enhancements to your AI voice handler:

1. **Real AI Integration** - OpenAI-powered conversations
2. **Call Logging Database** - Store call history
3. **Voicemail System** - Let callers leave messages
4. **Forward to Human** - Route to live agent
5. **Business Hours Routing** - After-hours handling

---

## 📋 Prerequisites

✅ AI API keys already configured in `.env.local`
✅ `ai-voice-handler` deployed and working
✅ Twilio webhook configured
✅ Supabase database accessible

---

## Enhancement 1: Real AI Integration with OpenAI

### Step 1: Set Secrets in Supabase

Run the script I created:
```bash
.\set-ai-secrets.bat
```

### Step 2: Create AI Helper Function

Create `supabase/functions/ai-voice-handler/openai-helper.ts`:

```typescript
// OpenAI Helper for Voice AI
import OpenAI from 'https://esm.sh/openai@4.20.1'

interface AIConversationContext {
  phoneNumber: string
  conversationHistory: Array<{ role: string; content: string }>
  userIntent?: string
}

export async function getAIResponse(context: AIConversationContext): Promise<string> {
  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  })

  const systemPrompt = `You are a helpful assistant for RepMotivatedSeller, a company that helps homeowners facing foreclosure.

Key information:
- We provide free consultations
- We help homeowners explore options to save their home
- We work with them through the foreclosure process
- Website: repmotivatedseller.com
- Phone: +1-877-806-4677

Guidelines:
- Be empathetic and understanding
- Keep responses under 100 words for voice
- Speak naturally, avoid jargon
- Ask clarifying questions
- If they want to speak to a human, say "Let me transfer you to one of our specialists"
- For appointments, direct them to website or offer to transfer

Respond to the caller's question naturally and helpfully.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory,
  ]

  try {
    const response = await openai.chat.completions.create({
      model: Deno.env.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: messages as any,
      max_tokens: parseInt(Deno.env.get('MAX_OUTPUT_TOKENS') || '150'),
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || 'I apologize, I didn\'t catch that. Could you please repeat?'
  } catch (error) {
    console.error('OpenAI Error:', error)
    throw error
  }
}

export function shouldHandoffToHuman(transcript: string): boolean {
  const keywords = (Deno.env.get('AI_HANDOFF_KEYWORDS') || '').split(',')
  const lowerTranscript = transcript.toLowerCase()

  return keywords.some(keyword => lowerTranscript.includes(keyword.trim().toLowerCase()))
}
```

### Step 3: Update ai-voice-handler to Use OpenAI

Update `supabase/functions/ai-voice-handler/index.ts` to integrate AI:

```typescript
import { getAIResponse, shouldHandoffToHuman } from './openai-helper.ts'

// Add this to handle gather/transcription
async function handleAIConversation(req: Request, supabase: any): Promise<string> {
  const formData = await req.formData()
  const from = formData.get('From')?.toString() || ''
  const speechResult = formData.get('SpeechResult')?.toString() || ''
  const digits = formData.get('Digits')?.toString() || ''

  console.log(`[AI CONVERSATION] From: ${from}, Speech: ${speechResult}, Digits: ${digits}`)

  // Check if they want human
  if (shouldHandoffToHuman(speechResult)) {
    return generateTransferTwiML()
  }

  // Get conversation history from database
  const conversationHistory = await getConversationHistory(supabase, from)

  // Add user's speech to history
  conversationHistory.push({
    role: 'user',
    content: speechResult
  })

  // Get AI response
  const aiResponse = await getAIResponse({
    phoneNumber: from,
    conversationHistory
  })

  // Save conversation
  await saveConversation(supabase, from, speechResult, aiResponse)

  // Generate TwiML with AI response and continue gathering
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${escapeXml(aiResponse)}</Say>
    <Gather
        input="speech"
        action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/continue"
        method="POST"
        timeout="5"
        speechTimeout="auto"
        speechModel="phone_call"
    >
        <Say voice="alice">How else can I help you?</Say>
    </Gather>
    <Say voice="alice">Thank you for calling. Visit repmotivatedseller.com for more information.</Say>
    <Hangup/>
</Response>`
}

function generateTransferTwiML(): string {
  const agentNumber = Deno.env.get('AGENT_PHONE_NUMBER') || '+18778064677'

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Let me transfer you to one of our specialists. Please hold.</Say>
    <Dial>
        <Number>${agentNumber}</Number>
    </Dial>
</Response>`
}
```

---

## Enhancement 2: Call Logging Database

### Step 1: Create Migration for call_log Table

Create `supabase/migrations/20251119000000_create_call_log.sql`:

```sql
-- Call Log Table for Voice Call Tracking
CREATE TABLE IF NOT EXISTS public.call_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Call identification
  call_sid TEXT NOT NULL UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,

  -- Call details
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  call_status TEXT CHECK (call_status IN ('queued', 'ringing', 'in-progress', 'completed', 'busy', 'failed', 'no-answer', 'canceled')),
  call_duration INTEGER, -- seconds

  -- AI conversation tracking
  ai_conversation BOOLEAN DEFAULT false,
  conversation_turns INTEGER DEFAULT 0,
  transferred_to_human BOOLEAN DEFAULT false,
  voicemail_left BOOLEAN DEFAULT false,

  -- Recording
  recording_url TEXT,
  recording_duration INTEGER,

  -- Metadata
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Indexes for performance
  INDEX idx_call_log_from ON (from_number),
  INDEX idx_call_log_created ON (created_at DESC),
  INDEX idx_call_log_sid ON (call_sid)
);

-- Enable RLS
ALTER TABLE public.call_log ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to call_log"
  ON public.call_log FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Admins can view all calls
CREATE POLICY "Admins can view all calls"
  ON public.call_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Comment
COMMENT ON TABLE public.call_log IS 'Tracks all voice calls handled by AI voice system';
```

### Step 2: Apply Migration

```bash
supabase db push --project-ref ltxqodqlexvojqqxquew
```

### Step 3: Update ai-voice-handler to Log Calls

The current `ai-voice-handler` already has logging code - just uncomment it!

---

## Enhancement 3: Voicemail System

### Step 1: Create Voicemail Table Migration

Add to `supabase/migrations/20251119000000_create_call_log.sql`:

```sql
-- Voicemail Table
CREATE TABLE IF NOT EXISTS public.voicemails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Voicemail identification
  call_sid TEXT NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,

  -- Recording details
  recording_url TEXT NOT NULL,
  recording_duration INTEGER, -- seconds
  transcription TEXT,
  transcription_status TEXT CHECK (transcription_status IN ('pending', 'completed', 'failed')),

  -- Status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'deleted')),
  listened BOOLEAN DEFAULT false,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  listened_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_voicemails_from ON (from_number),
  INDEX idx_voicemails_status ON (status),
  INDEX idx_voicemails_created ON (created_at DESC)
);

-- Enable RLS
ALTER TABLE public.voicemails ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to voicemails"
  ON public.voicemails FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Admins can manage voicemails
CREATE POLICY "Admins can manage voicemails"
  ON public.voicemails FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

COMMENT ON TABLE public.voicemails IS 'Stores voicemail recordings from callers';
```

### Step 2: Add Voicemail Option to Menu

Update `ai-voice-handler/index.ts` menu:

```typescript
function generateTwiML(fromNumber: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Thank you for calling RepMotivatedSeller, your foreclosure assistance partner.
    </Say>

    <Gather numDigits="1" action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/menu" method="POST" timeout="10">
        <Say voice="alice">
            Press 1 for foreclosure assistance.
            Press 2 to schedule a consultation.
            Press 3 for general information.
            Press 4 to leave a voicemail.
            Or press 0 to speak with a representative.
        </Say>
    </Gather>

    <Say voice="alice">
        We didn't receive your selection. Please call back or visit repmotivatedseller.com.
    </Say>

    <Hangup/>
</Response>`
}

// Handle voicemail recording
function handleVoicemailMenu(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Please leave your message after the beep.
        Press pound when finished.
    </Say>
    <Record
        action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/voicemail-complete"
        method="POST"
        maxLength="180"
        finishOnKey="#"
        transcribe="true"
        transcribeCallback="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/transcription"
    />
    <Say voice="alice">We did not receive your message. Please try again or call back.</Say>
</Response>`
}
```

---

## Enhancement 4: Forward to Human

### Step 1: Add Transfer Option

Already implemented in the OpenAI helper! Just need to handle menu option:

```typescript
function handleMenuSelection(digit: string): string {
  switch (digit) {
    case '0':
      // Transfer to human
      return generateTransferTwiML()

    case '1':
      // Foreclosure assistance
      return generateForeclosureResponseTwiML()

    // ... other options
  }
}

function generateTransferTwiML(): string {
  const agentNumber = Deno.env.get('AGENT_PHONE_NUMBER') || '+18778064677'

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Transferring you to a live specialist now. Please hold.
    </Say>
    <Dial
        action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/transfer-complete"
        timeout="30"
        callerId="${Deno.env.get('TWILIO_PHONE_NUMBER')}"
    >
        <Number>${agentNumber}</Number>
    </Dial>
    <Say voice="alice">
        I'm sorry, all our specialists are currently busy.
        Please leave a voicemail or visit our website.
    </Say>
</Response>`
}
```

---

## Enhancement 5: Business Hours Routing

### Step 1: Create Business Hours Helper

Create `supabase/functions/ai-voice-handler/business-hours.ts`:

```typescript
export interface BusinessHours {
  isOpen: boolean
  nextOpenTime?: string
  message: string
}

export function checkBusinessHours(): BusinessHours {
  const now = new Date()

  // Convert to Pacific Time (your business timezone)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }

  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(now)

  const weekday = parts.find(p => p.type === 'weekday')?.value || ''
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')

  // Business hours: Monday-Friday, 9 AM - 5 PM Pacific
  const isWeekday = !['Saturday', 'Sunday'].includes(weekday)
  const isDuringHours = hour >= 9 && hour < 17

  const isOpen = isWeekday && isDuringHours

  if (!isOpen) {
    if (!isWeekday) {
      return {
        isOpen: false,
        message: 'Our office is currently closed for the weekend. We are open Monday through Friday, 9 AM to 5 PM Pacific Time.',
        nextOpenTime: 'Monday at 9 AM'
      }
    } else {
      return {
        isOpen: false,
        message: 'Our office is currently closed. We are open Monday through Friday, 9 AM to 5 PM Pacific Time.',
        nextOpenTime: hour < 9 ? 'today at 9 AM' : 'tomorrow at 9 AM'
      }
    }
  }

  return {
    isOpen: true,
    message: 'Thank you for calling during our business hours.'
  }
}
```

### Step 2: Update Menu with Business Hours

```typescript
import { checkBusinessHours } from './business-hours.ts'

function generateTwiML(fromNumber: string): string {
  const hours = checkBusinessHours()

  if (!hours.isOpen) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Thank you for calling RepMotivatedSeller.
        ${hours.message}
    </Say>

    <Gather numDigits="1" action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/after-hours" method="POST" timeout="10">
        <Say voice="alice">
            Press 1 to leave a voicemail and we'll call you back.
            Press 2 for general information.
            Or visit our website at repmotivatedseller dot com for immediate assistance.
        </Say>
    </Gather>

    <Say voice="alice">
        Thank you for calling. Visit repmotivatedseller.com or call back during business hours.
    </Say>

    <Hangup/>
</Response>`
  }

  // Normal business hours menu
  return generateNormalMenuTwiML(fromNumber)
}
```

---

## 🚀 Implementation Order

### Phase 1: Database Setup (Do First)
1. Run `.\set-ai-secrets.bat`
2. Create and apply migration for `call_log` and `voicemails` tables
3. Verify tables exist in Supabase

### Phase 2: Basic Enhancements
1. Update `ai-voice-handler` with business hours checking
2. Add voicemail recording option (option 4)
3. Add transfer to human (option 0)
4. Test menu system

### Phase 3: AI Integration
1. Create `openai-helper.ts`
2. Create `business-hours.ts`
3. Update main handler to use OpenAI
4. Enable call logging
5. Test AI conversations

### Phase 4: Testing
1. Test during business hours
2. Test after hours
3. Test voicemail
4. Test transfer to human
5. Test AI conversation
6. Verify database logging

---

## 📝 Complete Implementation Script

Create `deploy-ai-enhancements.bat`:

```batch
@echo off
echo ================================================
echo Deploying AI Voice Enhancements
echo ================================================

echo [1/5] Setting AI secrets...
call set-ai-secrets.bat

echo [2/5] Applying database migrations...
supabase db push --project-ref ltxqodqlexvojqqxquew

echo [3/5] Deploying updated ai-voice-handler...
supabase functions deploy ai-voice-handler --project-ref ltxqodqlexvojqqxquew --no-verify-jwt

echo [4/5] Verifying deployment...
supabase functions list --project-ref ltxqodqlexvojqqxquew

echo [5/5] Testing endpoint...
curl https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler

echo.
echo ================================================
echo Deployment Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Call your Twilio number to test
echo 2. Try each menu option (0-4)
echo 3. Check call_log table for entries
echo 4. Test voicemail and AI conversation
echo.
pause
```

---

## ✅ Success Checklist

After implementation:

- [ ] AI secrets set in Supabase
- [ ] `call_log` table created
- [ ] `voicemails` table created
- [ ] Business hours checking works
- [ ] Voicemail recording works (option 4)
- [ ] Transfer to human works (option 0)
- [ ] AI conversation works
- [ ] Calls are logged to database
- [ ] After-hours menu different from business hours
- [ ] All menu options tested

---

Want me to help you implement any specific enhancement first?
