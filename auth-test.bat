@echo off
set PROJECT_REF=ltxqodqlexvojqqxquew
set ANON_KEY=sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg
set SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk3NTc1MCwiZXhwIjoyMDA1NTUxNzUwfQ.Rl_0RZCnxQHvGFzQVxXdYgHWtgdTxj-Ot-uf-XnEkwE

echo Testing admin-dashboard function with service role key...
curl -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/admin-dashboard" ^
  -H "Authorization: Bearer %SERVICE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"summary\"}"

pause