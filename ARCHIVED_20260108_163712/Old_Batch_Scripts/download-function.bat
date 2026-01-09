@echo off
echo Downloading admin-dashboard function...

set PROJECT_REF=ltxqodqlexvojqqxquew
set SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk3NTc1MCwiZXhwIjoyMDA1NTUxNzUwfQ.Rl_0RZCnxQHvGFzQVxXdYgHWtgdTxj-Ot-uf-XnEkwE

curl -s -X GET "https://%PROJECT_REF%.supabase.co/functions/v1/admin-dashboard" ^
  -H "Authorization: Bearer %SERVICE_KEY%" > admin-dashboard-source.txt

echo Function code downloaded to admin-dashboard-source.txt
echo.
echo To test the function:
echo curl -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/admin-dashboard" ^
echo   -H "Authorization: Bearer %SERVICE_KEY%" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"action\":\"summary\"}"
echo.
pause