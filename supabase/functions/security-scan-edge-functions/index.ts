import { createClient } from 'jsr:@supabase/supabase-js@^2'

// Define the structure for a security issue
interface SecurityIssue {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  line: number;
  description: string;
}// Function to scan code for security issues
function scanFunctionCode(code: string, scanType: string): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  const lines = code.split('\n')

  // Scan for secrets regardless of type
  const secretPatterns = [
    { pattern: /['"`](sk_live_[A-Za-z0-9]{24,})['"`]/, type: 'Stripe Live Key' },
    { pattern: /['"`]([A-Za-z0-9+/]{40,})['"`]/, type: 'Potential Generic API Key (40+ chars)' },
    { pattern: /password\s*[:=]\s*['"`](.+?)['"`]/i, type: 'Hardcoded Password' },
    { pattern: /secret\s*[:=]\s*['"`](.+?)['"`]/i, type: 'Hardcoded Secret' },
    { pattern: /key\s*[:=]\s*['"`]([A-Za-z0-9+/]{16,})['"`]/i, type: 'Potential API Key (16+ chars)' }
  ];
  if (scanType === 'all' || scanType === 'secrets') {
    lines.forEach((line, i) => {
      secretPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(line)) {
          issues.push({
            severity: 'HIGH',
            type,
            line: i + 1,
            description: `Possible hardcoded secret detected: ${type}`
          });
        }
      });
    });
  }

  // Scan for injection vulnerabilities
  const injectionPatterns = [
    { pattern: /eval\s*\(/i, type: 'Code Injection (eval)' },
    { pattern: /new\s+Function\s*\(/i, type: 'Code Injection (new Function)' },
    { pattern: /child_process/i, type: 'Potential Command Injection (child_process)' },
  ];
  if (scanType === 'all' || scanType === 'injection') {
    lines.forEach((line, i) => {
      injectionPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(line)) {
          issues.push({
            severity: 'HIGH',
            type,
            line: i + 1,
            description: `Potential ${type} vulnerability found.`
          });
        }
      });
    });
  }

  // Scan for insecure service role usage
  const permissionPatterns = [
    { pattern: /SUPABASE_SERVICE_ROLE_KEY/i, type: 'Direct Service Role Key Usage' },
    { pattern: /createClient.+service_role/i, type: 'Service Role Client Initialization' }
  ];
  if (scanType === 'all' || scanType === 'permissions') {
    lines.forEach((line, i) => {
      permissionPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(line)) {
          issues.push({
            severity: 'MEDIUM',
            type,
            line: i + 1,
            description: 'Service role usage detected. Ensure this is intentional and secured.'
          });
        }
      });
    });
  }

  return issues;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a Supabase client with the user's JWT to enforce RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Check if the user is an admin before proceeding
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid user token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });    }
    const { data: userRole, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

    if (roleError || !userRole?.is_admin) {
        return new Response(JSON.stringify({ error: 'Access denied: Admin role required.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Use a service role client for administrative tasks like reading function source
    const supabaseAdminClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { functionName, scanType = 'all' } = await req.json();    if (!functionName) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: functionName' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // This RPC needs to be created in your database to fetch function source code
    const { data: functionData, error: functionError } = await supabaseAdminClient
      .rpc('get_edge_function_source', { function_name: functionName });
    
    if (functionError) throw functionError;
    if (!functionData) {
      return new Response(JSON.stringify({ error: 'Function not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    const securityIssues = scanFunctionCode(functionData.source_code, scanType);

    // Log scan results using the admin client
    const { data: logData, error: logError } = await supabaseAdminClient
      .from('edge_function_security_scans')
      .insert({
        function_name: functionName,
        scan_type: scanType,
        issues_found: securityIssues.length,
        scan_results: securityIssues,
        scanned_by: user.id
      })
      .select('id')
      .single();


    if (logError) throw logError;

    return new Response(JSON.stringify({
      success: true,
      message: `Scan complete for function '${functionName}'.`,
      scan_id: logData.id,
      issues_found: securityIssues.length,
      results: securityIssues
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
})