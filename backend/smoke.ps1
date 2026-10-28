$ErrorActionPreference = 'Continue'
$base = 'http://localhost:3000/v1'
$pass = 0
$fail = 0
$script:token = $null
$script:refresh = $null
$script:deviceId = $null

function Test($name, [scriptblock]$fn) {
  try {
    & $fn
    Write-Host "OK  $name" -ForegroundColor Green
    $script:pass++
  } catch {
    Write-Host "FAIL $name`n  $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -match 'Body:') { Write-Host '' }
    $script:fail++
  }
}

function Post($path, $body, $token = $null) {
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    return Invoke-RestMethod -Uri "$base$path" -Method Post -Body ($body | ConvertTo-Json -Depth 10) -Headers $headers -UseBasicParsing
  } catch {
    $respBody = if ($_.Exception.Response) { try { (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch { '' } } else { '' }
    throw "HTTP $($_.Exception.Response.StatusCode.value__) - Body: $respBody"
  }
}

function Get($path, $token = $null) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    return Invoke-RestMethod -Uri "$base$path" -Method Get -Headers $headers -UseBasicParsing
  } catch {
    $respBody = if ($_.Exception.Response) { try { (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch { '' } } else { '' }
    throw "HTTP $($_.Exception.Response.StatusCode.value__) - Body: $respBody"
  }
}

function Del($path, $token = $null) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    return Invoke-RestMethod -Uri "$base$path" -Method Delete -Headers $headers -UseBasicParsing
  } catch {
    $respBody = if ($_.Exception.Response) { try { (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch { '' } } else { '' }
    throw "HTTP $($_.Exception.Response.StatusCode.value__) - Body: $respBody"
  }
}

# ---------- AUTH ----------
Test 'POST /auth/signup creates user' {
  $r = Post '/auth/signup' @{ email = 'smoke@mutesound.test'; password = 'secret123' }
  if (-not $r.id -or -not $r.token -or -not $r.refresh_token) { throw 'missing fields' }
  $script:token = $r.token
  $script:refresh = $r.refresh_token
}

Test 'POST /auth/signup duplicate returns 409' {
  try {
    Post '/auth/signup' @{ email = 'smoke@mutesound.test'; password = 'secret123' }
    throw 'expected 409'
  } catch {
    if (-not ($_.Exception.Message -match 'EMAIL_ALREADY_EXISTS')) { throw $_ }
  }
}

Test 'POST /auth/login returns token pair' {
  $r = Post '/auth/login' @{ email = 'smoke@mutesound.test'; password = 'secret123' }
  if (-not $r.token -or -not $r.refresh_token) { throw 'missing fields' }
  $script:token = $r.token
}

Test 'POST /auth/login bad password returns 401' {
  try {
    Post '/auth/login' @{ email = 'smoke@mutesound.test'; password = 'wrong' }
    throw 'expected 401'
  } catch {
    if (-not ($_.Exception.Message -match 'INVALID_CREDENTIALS')) { throw $_ }
  }
}

Test 'POST /auth/refresh rotates token' {
  $r = Post '/auth/refresh' @{ refresh_token = $script:refresh }
  if (-not $r.token) { throw 'missing token' }
  $script:token = $r.token
}

Test 'POST /auth/google with bad token returns 401' {
  try {
    Post '/auth/google' @{ id_token = 'bogus' }
    throw 'expected 401'
  } catch {
    if (-not ($_.Exception.Message -match 'INVALID_GOOGLE_TOKEN')) { throw $_ }
  }
}

# ---------- SETTINGS ----------
Test 'POST /settings/location saves location' {
  $r = Post '/settings/location' @{ city = 'Dhaka'; latitude = 23.8103; longitude = 90.4125; calculation_method = 'DHAKA' } $script:token
  if (-not $r.success) { throw 'not success' }
}

Test 'GET /settings/location reads back' {
  $r = Get '/settings/location' $script:token
  if ($r.city -ne 'Dhaka' -or $r.calculation_method -ne 'DHAKA') { throw "unexpected: $($r | ConvertTo-Json)" }
}

Test 'POST /settings/mute-preference saves' {
  $r = Post '/settings/mute-preference' @{ enabled_prayers = @('fajr','dhuhr','asr','maghrib','isha'); mute_duration_minutes = 5; ml_verification_enabled = $false } $script:token
  if (-not $r.success) { throw 'not success' }
}

Test 'GET /settings/mute-preference reads back' {
  $r = Get '/settings/mute-preference' $script:token
  if ($r.mute_duration_minutes -ne 5 -or $r.enabled_prayers.Count -ne 5) { throw "unexpected: $($r | ConvertTo-Json -Depth 5)" }
}

# ---------- PRAYER TIMES ----------
Test 'GET /prayer-times (public) requires city' {
  try { Get '/prayer-times' } catch {
    if (-not ($_.Exception.Message -match 'MISSING_CITY')) { throw $_ }
  }
}

Test 'GET /prayer-times?city=Dhaka returns 5 prayer times' {
  $r = Get '/prayer-times?city=Dhaka'
  foreach ($k in @('fajr','dhuhr','asr','maghrib','isha')) {
    if (-not $r.$k -or $r.$k -notmatch '^\d{2}:\d{2}$') { throw "bad $k value: $($r.$k)" }
  }
}

Test 'GET /prayer-times/week?city=Dhaka returns 7 days' {
  $r = Get '/prayer-times/week?city=Dhaka'
  if ($r.city -ne 'Dhaka' -or $r.days.Count -ne 7) { throw "bad: $($r | ConvertTo-Json -Depth 5)" }
}

Test 'GET /prayer-times/me uses saved location' {
  $r = Get '/prayer-times/me' $script:token
  foreach ($k in @('fajr','dhuhr','asr','maghrib','isha')) {
    if (-not $r.$k -or $r.$k -notmatch '^\d{2}:\d{2}$') { throw "bad $k value: $($r.$k)" }
  }
}

Test 'GET /prayer-times/me/week uses saved location' {
  $r = Get '/prayer-times/me/week' $script:token
  if ($r.days.Count -ne 7) { throw "bad days count: $($r.days.Count)" }
}

# ---------- DEVICES ----------
Test 'POST /devices/register returns device_id' {
  $r = Post '/devices/register' @{ platform = 'chrome_extension'; push_token = 'token-abc' } $script:token
  if (-not $r.device_id) { throw 'no device_id' }
  $script:deviceId = $r.device_id
}

Test 'GET /devices lists my devices' {
  $r = Get '/devices' $script:token
  if ($r.devices.Count -lt 1 -or $r.devices[0].platform -ne 'chrome_extension') { throw "bad: $($r | ConvertTo-Json -Depth 5)" }
}

Test 'DELETE /devices/:id succeeds' {
  Del "/devices/$($script:deviceId)" $script:token
}

# ---------- NOTIFICATIONS ----------
Test 'POST /notifications/test returns fcm_enabled flag' {
  $r = Post '/notifications/test' @{} $script:token
  if ($null -eq $r.fcm_enabled) { throw 'missing fcm_enabled' }
}

# ---------- ACCOUNT ----------
Test 'DELETE /account deletes the user account' {
  $r = Del '/account' $script:token
  if (-not $r.success) { throw 'not success' }
}

# Summary
Write-Host "`n================================"
Write-Host "Passed: $script:pass" -ForegroundColor Green
Write-Host "Failed: $script:fail" -ForegroundColor $(if ($script:fail -eq 0) { 'Green' } else { 'Red' })
Write-Host "================================"
