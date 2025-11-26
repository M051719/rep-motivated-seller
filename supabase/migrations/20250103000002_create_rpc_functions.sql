-- ============================================================================
-- SECURE RPC FUNCTIONS for RepMotivatedSeller
-- ============================================================================

-- Set secure search path for all functions
SET search_path = '';

-- ============================================================================
-- LEAD MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create a new lead
CREATE OR REPLACE FUNCTION api.create_lead(
    p_name text,
    p_email text,
    p_phone text DEFAULT NULL,
    p_property_address text DEFAULT NULL,
    p_lead_source text DEFAULT NULL,
    p_notes text DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    lead_id uuid;
BEGIN
    -- Validate authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Validate required fields
    IF p_name IS NULL OR p_name = '' THEN
        RAISE EXCEPTION 'Lead name is required';
    END IF;
    
    IF p_email IS NULL OR p_email = '' THEN
        RAISE EXCEPTION 'Lead email is required';
    END IF;
    
    -- Insert lead
    INSERT INTO api.leads (
        user_id, name, email, phone, property_address, lead_source, notes
    ) VALUES (
        auth.uid(), p_name, p_email, p_phone, p_property_address, p_lead_source, p_notes
    ) RETURNING id INTO lead_id;
    
    RETURN lead_id;
END;
$$;

-- Update lead status
CREATE OR REPLACE FUNCTION api.update_lead_status(
    p_lead_id uuid,
    p_status text,
    p_notes text DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Validate status
    IF p_status NOT IN ('new', 'contacted', 'qualified', 'converted', 'lost') THEN
        RAISE EXCEPTION 'Invalid status';
    END IF;
    
    -- Update lead (RLS ensures user owns this lead)
    UPDATE api.leads 
    SET 
        status = p_status,
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_lead_id AND user_id = auth.uid();
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found or access denied';
    END IF;
    
    RETURN true;
END;
$$;

-- ============================================================================
-- CONSULTATION BOOKING FUNCTIONS  
-- ============================================================================

-- Book a consultation
CREATE OR REPLACE FUNCTION api.book_consultation(
    p_consultation_type text,
    p_invitee_name text,
    p_invitee_email text,
    p_booking_date timestamptz,
    p_notes text DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    booking_id uuid;
    duration_mins integer;
BEGIN
    -- Validate authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Validate consultation type
    IF p_consultation_type NOT IN ('basic', 'premium', 'enterprise') THEN
        RAISE EXCEPTION 'Invalid consultation type';
    END IF;
    
    -- Set duration based on type
    duration_mins := CASE p_consultation_type
        WHEN 'basic' THEN 30
        WHEN 'premium' THEN 60  
        WHEN 'enterprise' THEN 90
    END;
    
    -- Validate booking date (must be in future)
    IF p_booking_date <= NOW() THEN
        RAISE EXCEPTION 'Booking date must be in the future';
    END IF;
    
    -- Insert booking
    INSERT INTO api.consultation_bookings (
        user_id, consultation_type, invitee_name, invitee_email, 
        booking_date, duration_minutes, notes
    ) VALUES (
        auth.uid(), p_consultation_type, p_invitee_name, p_invitee_email,
        p_booking_date, duration_mins, p_notes
    ) RETURNING id INTO booking_id;
    
    RETURN booking_id;
END;
$$;

-- Update consultation status
CREATE OR REPLACE FUNCTION api.update_consultation_status(
    p_booking_id uuid,
    p_status text,
    p_meeting_url text DEFAULT NULL,
    p_notes text DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Validate status
    IF p_status NOT IN ('scheduled', 'completed', 'cancelled', 'rescheduled') THEN
        RAISE EXCEPTION 'Invalid status';
    END IF;
    
    -- Update consultation (RLS ensures user owns this booking)
    UPDATE api.consultation_bookings 
    SET 
        status = p_status,
        meeting_url = COALESCE(p_meeting_url, meeting_url),
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_booking_id AND user_id = auth.uid();
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consultation not found or access denied';
    END IF;
    
    RETURN true;
END;
$$;

-- ============================================================================
-- PAYMENT FUNCTIONS
-- ============================================================================

-- Record a payment (typically called by webhook)
CREATE OR REPLACE FUNCTION api.record_payment(
    p_user_id uuid,
    p_amount integer,
    p_currency text,
    p_status text,
    p_stripe_payment_id text
)
RETURNS uuid
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    payment_id uuid;
BEGIN
    -- This function is typically called by service role (webhooks)
    -- Or by authenticated users for their own payments
    
    -- Validate parameters
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID required';
    END IF;
    
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;
    
    -- Insert payment
    INSERT INTO api.payments (
        user_id, amount, currency, status, stripe_payment_id
    ) VALUES (
        p_user_id, p_amount, p_currency, p_status, p_stripe_payment_id
    ) RETURNING id INTO payment_id;
    
    RETURN payment_id;
END;
$$;

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

-- Grant execute to authenticated users for their functions
GRANT EXECUTE ON FUNCTION api.create_lead(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION api.update_lead_status(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION api.book_consultation(text, text, text, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION api.update_consultation_status(uuid, text, text, text) TO authenticated;

-- Grant payment function to service role only (for webhooks)
GRANT EXECUTE ON FUNCTION api.record_payment(uuid, integer, text, text, text) TO service_role;

SELECT 'RPC Functions created successfully!' as status;