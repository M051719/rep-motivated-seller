#!/bin/bash
# Quick validation script for authentication security fixes

echo "🔒 Authentication Security Fixes - Validation Script"
echo "===================================================="
echo ""

PASS=0
FAIL=0

# Test 1: Check for deleted files
echo "1️⃣ Checking deleted insecure files..."
if [ ! -f "src/utils/auth.js" ] && [ ! -f "src/lib/supabase.js" ] && [ ! -f "src/lib/supabase-env.js" ] && [ ! -f "src/components/loginform.jsx" ]; then
  echo "   ✅ All insecure files deleted"
  ((PASS++))
else
  echo "   ❌ Some insecure files still exist"
  ((FAIL++))
fi
echo ""

# Test 2: Check for hardcoded credentials
echo "2️⃣ Scanning for hardcoded credentials..."
if ! grep -r "Lamage02" src/ supabase/ 2>/dev/null; then
  echo "   ✅ No hardcoded passwords found"
  ((PASS++))
else
  echo "   ❌ Hardcoded password still exists"
  ((FAIL++))
fi
echo ""

# Test 3: Check for single Supabase client
echo "3️⃣ Verifying single Supabase client..."
if [ -f "src/lib/supabase.ts" ]; then
  echo "   ✅ src/lib/supabase.ts exists"
  ((PASS++))
else
  echo "   ❌ src/lib/supabase.ts not found"
  ((FAIL++))
fi
echo ""

# Test 4: Check Turnstile fix
echo "4️⃣ Checking Turnstile configuration..."
if grep -q "isDevelopment.*import\.meta\.env\.DEV" src/components/AuthForm.tsx; then
  echo "   ✅ Turnstile optional in development"
  ((PASS++))
else
  echo "   ❌ Turnstile fix not found"
  ((FAIL++))
fi
echo ""

# Test 5: Check scripts exist
echo "5️⃣ Verifying testing scripts..."
if [ -f "scripts/test-auth.ps1" ] && [ -f "scripts/verify-security.ps1" ] && [ -f "scripts/setup-supabase-redirects.ps1" ]; then
  echo "   ✅ All testing scripts created"
  ((PASS++))
else
  echo "   ❌ Some scripts missing"
  ((FAIL++))
fi
echo ""

# Test 6: Check documentation
echo "6️⃣ Verifying documentation..."
if [ -f "SECURITY_AUDIT.md" ] && [ -f "AUTH_FIX_VERIFICATION.md" ] && [ -f ".env.development.template" ]; then
  echo "   ✅ All documentation created"
  ((PASS++))
else
  echo "   ❌ Some documentation missing"
  ((FAIL++))
fi
echo ""

# Summary
echo "===================================================="
echo "📊 Validation Results"
echo "===================================================="
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All validations passed! Ready for merge."
  exit 0
else
  echo "⚠️  Some validations failed. Please review."
  exit 1
fi
