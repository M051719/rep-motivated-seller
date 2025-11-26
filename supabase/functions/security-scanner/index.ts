import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Define the structure for a security issue
interface SecurityIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  type: string;
  line: number;
  description: string;
  remediation?: string;
  cwe?: string; // Common Weakness Enumeration
}

interface ScanResult {
  success: boolean;
  message: string;
  scan_id?: string;
  function_name: string;
  scan_type: string;
  issues_found: number;
  results: SecurityIssue[];
  scan_duration_ms: number;
}

// Enhanced security patterns with better accuracy
const SECURITY_PATTERNS = {
  secrets: [
    {
      pattern: /(['"`])sk_live_[A-Za-z0-9]{24,}\1/g,
      type: 'Stripe Live Key',
      severity: 'CRITICAL' as const,
      cwe: 'CWE-798',
      remediation: 'Remove hardcoded Stripe live keys. Use environment variables instead.'
    },
    {
      pattern: /(['"`])sk_test_[A-Za-z0-9]{24,}\1/g,
      type: 'Stripe Test Key',
      severity: 'HIGH' as const,
      cwe: 'CWE-798',
      remediation: 'Remove hardcoded Stripe test keys. Use environment variables instead.'
    },
    {
      pattern: /(['"`])[A-Za-z0-9+/]{40,}={0,2}\1/g,
      type: 'Potential Base64 API Key',
      severity: 'MEDIUM' as const,
      cwe: 'CWE-798',
      remediation: 'Verify if this is an API key and move to environment variables.'
    },
    {
      pattern: /password\s*[:=]\s*(['"`])(?!.*\$\{|.*process\.env).+?\1/gi,
      type: 'Hardcoded Password',
      severity: 'HIGH' as const,
      cwe: 'CWE-259',
      remediation: 'Remove hardcoded passwords. Use secure environment variables.'
    },
    {
      pattern: /(?:secret|api_?key|private_?key)\s*[:=]\s*(['"`])(?!.*\$\{|.*process\.env|.*Deno\.env).+?\1/gi,
      type: 'Hardcoded Secret/Key',
      severity: 'HIGH' as const,
      cwe: 'CWE-798',
      remediation: 'Move secrets to environment variables or secure vault.'
    },
    {
      pattern: /(['"`])ghp_[A-Za-z0-9_]{36}\1/g,
      type: 'GitHub Personal Access Token',
      severity: 'CRITICAL' as const,
      cwe: 'CWE-798',
      remediation: 'Remove GitHub tokens immediately and regenerate them.'
    }
  ],
  injection: [
    {
      pattern: /eval\s*\(/gi,
      type: 'Code Injection (eval)',
      severity: 'CRITICAL' as const,
      cwe: 'CWE-95',
      remediation: 'Avoid using eval(). Use safer alternatives like JSON.parse() or specific parsers.'
    },
    {
      pattern: /new\s+Function\s*\(/gi,
      type: 'Code Injection (Function constructor)',
      severity: 'HIGH' as const,
      cwe: 'CWE-95',
      remediation: 'Avoid dynamic function creation. Use predefined functions instead.'
    },
    {
      pattern: /document\.write\s*\(/gi,
      type: 'DOM-based XSS (document.write)',
      severity: 'HIGH' as const,
      cwe: 'CWE-79',
      remediation: 'Use safer DOM manipulation methods like textContent or innerHTML with sanitization.'
    },
    {
      pattern: /innerHTML\s*=\s*[^;]*\+|innerHTML\s*=.*\$\{/gi,
      type: 'Potential XSS (innerHTML concatenation)',
      severity: 'MEDIUM' as const,
      cwe: 'CWE-79',
      remediation: 'Sanitize user input before using innerHTML or use textContent instead.'
    }
  ],
  permissions: [
    {
      pattern: /SUPABASE_SERVICE_ROLE_KEY/gi,
      type: 'Service Role Key Usage',
      severity: 'MEDIUM' as const,
      cwe: 'CWE-250',
      remediation: 'Ensure service role usage is necessary and properly secured. Consider using RLS policies instead.'
    },
    {
      pattern: /createClient.*service_role/gi,
      type: 'Service Role Client Creation',
      severity: 'MEDIUM' as const,
      cwe: 'CWE-250',
      remediation: 'Verify that elevated privileges are necessary and properly controlled.'
    },
    {
      pattern: /bypass.*rls|rls.*bypass/gi,
      type: 'RLS Bypass Pattern',
      severity: 'HIGH' as const,
      cwe: 'CWE-285',
      remediation: 'Review RLS bypass usage. Ensure it\'s intentional and secure.'
    }
  ],
  dataExposure: [
    {
      pattern: /console\.log.*password|console\.log.*secret|console\.log.*key/gi,
      type: 'Sensitive Data Logging',
      severity: 'MEDIUM' as const,
      cwe: 'CWE-532',
      remediation: 'Remove console.log statements that may expose sensitive data.'
    },
    {
      pattern: /\.select\s*\(\s*['"`]\*['"`]\s*\)/gi,
      type: 'Wildcard SELECT Query',
      severity: 'LOW' as const,
      cwe: 'CWE-200',
      remediation: 'Specify exact columns needed instead of using SELECT *.'
    }
  ],
  cryptography: [
    {
      pattern: /Math\.random\(\)/gi,
      type: 'Weak Random Number Generation',
      severity: 'MEDIUM' as const,
      cwe: 'CWE-338',
      remediation: 'Use crypto.getRandomValues() for cryptographically secure random numbers.'
    },
    {
      pattern: /md5|sha1(?!-)|base64.*password/gi,
      type: 'Weak Cryptographic Algorithm',
      severity: 'MEDIUM' as const,
      cwe: 'CWE-327',
      remediation: 'Use stronger cryptographic algorithms like SHA-256 or bcrypt for passwords.'
    }
  ]
};

function scanFunctionCode(code: string, scanType: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const lines = code.split('\n');

  const patternCategories = scanType === 'all' 
    ? Object.keys(SECURITY_PATTERNS) 
    : [scanType].filter(type => type in SECURITY_PATTERNS);

  for (const category of patternCategories) {
    const patterns = SECURITY_PATTERNS[category as keyof typeof SECURITY_PATTERNS];
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        return; // Skip empty lines and comments
      }

      patterns.forEach(({ pattern, type, severity, cwe, remediation }) => {
        const matches = Array.from(line.matchAll(pattern));
        
        matches.forEach((match) => {
          // Reduce false positives for environment variables
          if (type.includes('Key') || type.includes('Secret')) {
            if (line.includes('process.env') || line.includes('Deno.env') || 
                line.includes('${') || line.includes('getEnv')) {
              return; // Skip if it's referencing environment variables
            }
          }

          issues.push({
            severity,
            type,
            line: lineIndex + 1,
            description: `${type} detected at line ${lineIndex + 1}`,
            remediation,
            cwe
          });
        });
      });
    });
  }

  return issues;
}

Deno.serve(async (req) => {
  const startTime = performance.now();

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed',
        allowed_methods: ['POST']
      }), {
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Missing authorization header',
        code: 'AUTH_REQUIRED'
      }), {
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Verify user and check admin role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid user token',
        code: 'INVALID_TOKEN'
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('is_admin, role_name')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole?.is_admin) {
      return new Response(JSON.stringify({ 
        error: 'Access denied: Admin role required',
        code: 'INSUFFICIENT_PRIVILEGES',
        required_role: 'admin',
        user_role: userRole?.role_name || 'none'
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Parse request body
    const requestBody = await req.json();
    const { functionName, scanType = 'all' } = requestBody;

    if (!functionName) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameter: functionName',
        code: 'MISSING_PARAMETER'
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate scanType
    const validScanTypes = ['all', 'secrets', 'injection', 'permissions', 'dataExposure', 'cryptography'];
    if (!validScanTypes.includes(scanType)) {
      return new Response(JSON.stringify({ 
        error: `Invalid scan type. Must be one of: ${validScanTypes.join(', ')}`,
        code: 'INVALID_SCAN_TYPE'
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create admin client for elevated operations
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch function source code
    const { data: functionData, error: functionError } = await supabaseAdminClient
      .rpc('get_edge_function_source', { function_name: functionName });
    
    if (functionError) {
      console.error('Function fetch error:', functionError);
      throw new Error(`Failed to fetch function source: ${functionError.message}`);
    }

    if (!functionData) {
      return new Response(JSON.stringify({ 
        error: `Function '${functionName}' not found`,
        code: 'FUNCTION_NOT_FOUND'
      }), {
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Perform security scan
    const securityIssues = scanFunctionCode(functionData.source_code, scanType);
    
    // Calculate scan duration
    const scanDuration = Math.round(performance.now() - startTime);

    // Log scan results
    const { data: logData, error: logError } = await supabaseAdminClient
      .from('edge_function_security_scans')
      .insert({
        function_name: functionName,
        scan_type: scanType,
        issues_found: securityIssues.length,
        scan_results: securityIssues,
        scanned_by: user.id,
        scan_duration_ms: scanDuration,
        function_size_bytes: functionData.source_code.length
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Logging error:', logError);
      // Don't fail the request if logging fails
    }

    const result: ScanResult = {
      success: true,
      message: `Security scan complete for function '${functionName}'`,
      scan_id: logData?.id,
      function_name: functionName,
      scan_type: scanType,
      issues_found: securityIssues.length,
      results: securityIssues,
      scan_duration_ms: scanDuration
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Security scanner error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});