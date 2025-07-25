@echo off
echo Getting Supabase Auth Token

curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/auth/v1/token?grant_type=password" ^
  -H "apikey: sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"melvin@sofiesentrepreneurialgroup.com\",\"password\":\"Lamage02#007\"}" > token.json

echo.
echo Token saved to token.json
echo.
type token.json
echo.
pause