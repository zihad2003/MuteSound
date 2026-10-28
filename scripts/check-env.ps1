# Validates MuteSound local env for backend + website (no secret values printed).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$fail = 0

function Test-Key([string]$file, [string]$key, [switch]$Required, [switch]$AllowEmpty) {
  if (-not (Test-Path $file)) {
    Write-Host "MISSING FILE: $file" -ForegroundColor Red
    $script:fail++
    return
  }
  $line = Select-String -Path $file -Pattern "(?m)^$([regex]::Escape($key))=(.*)$" | Select-Object -First 1
  if (-not $line) {
    if ($Required) {
      Write-Host "MISSING KEY: $key ($file)" -ForegroundColor Red
      $script:fail++
    } else {
      Write-Host "optional missing: $key ($file)" -ForegroundColor Yellow
    }
    return
  }
  $val = $line.Matches[0].Groups[1].Value.Trim().Trim('"')
  $empty = [string]::IsNullOrWhiteSpace($val) -or $val -match 'replace_me|REPLACE_LATER|your-'
  if ($empty -and $Required -and -not $AllowEmpty) {
    Write-Host "EMPTY/PLACEHOLDER: $key ($file)" -ForegroundColor Red
    $script:fail++
  } elseif ($empty) {
    Write-Host "empty (ok for local no-op): $key" -ForegroundColor Yellow
  } else {
    Write-Host "ok: $key" -ForegroundColor Green
  }
}

Write-Host "=== backend/.env ===" -ForegroundColor Cyan
$be = Join-Path $root 'backend\.env'
Test-Key $be 'DATABASE_URL' -Required
Test-Key $be 'JWT_SECRET' -Required
Test-Key $be 'JWT_REFRESH_SECRET' -Required
Test-Key $be 'GOOGLE_OAUTH_CLIENT_ID' -Required
Test-Key $be 'FIREBASE_PROJECT_ID' -AllowEmpty
Test-Key $be 'FIREBASE_CLIENT_EMAIL' -AllowEmpty
Test-Key $be 'FIREBASE_PRIVATE_KEY' -AllowEmpty

Write-Host "`n=== website/.env.local ===" -ForegroundColor Cyan
$we = Join-Path $root 'website\.env.local'
Test-Key $we 'NEXT_PUBLIC_API_BASE' -Required
Test-Key $we 'NEXT_PUBLIC_GOOGLE_CLIENT_ID' -Required
Test-Key $we 'NEXT_PUBLIC_SITE_URL' -Required

Write-Host ""
if ($fail -gt 0) {
  Write-Host "FAILED: $fail required issue(s). See docs/user-actions.md" -ForegroundColor Red
  exit 1
}
Write-Host "Env check passed (Firebase may still be empty for local no-op FCM)." -ForegroundColor Green
exit 0
