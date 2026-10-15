# api.md
## MuteSound — API Reference

Base URL: `https://api.mutesound.app/v1` (placeholder — replace with actual domain)

All authenticated endpoints require header: `Authorization: Bearer <JWT>`

---

## Auth

### POST /auth/signup
```json
// Request
{ "email": "user@example.com", "password": "secret123" }

// Response 201
{ "id": "uuid", "email": "user@example.com", "token": "jwt..." }
```

### POST /auth/login
```json
// Request
{ "email": "user@example.com", "password": "secret123" }

// Response 200
{ "token": "jwt...", "refresh_token": "..." }
```

### POST /auth/refresh
```json
// Request
{ "refresh_token": "..." }

// Response 200
{ "token": "new_jwt..." }
```

### POST /auth/google
```json
// Request
{ "id_token": "google_oauth_id_token" }

// Response 200
{ "token": "jwt...", "is_new_user": false }
```

---

## Prayer Times

### GET /prayer-times?city=Dhaka&date=2026-09-26
```json
// Response 200
{
  "city": "Dhaka",
  "date": "2026-09-26",
  "fajr": "04:42",
  "dhuhr": "12:05",
  "asr": "16:20",
  "maghrib": "18:03",
  "isha": "19:22",
  "method": "DHAKA"
}
```

### GET /prayer-times/week?city=Dhaka
```json
// Response 200
{
  "city": "Dhaka",
  "days": [
    { "date": "2026-09-26", "fajr": "04:42", "dhuhr": "12:05", "asr": "16:20", "maghrib": "18:03", "isha": "19:22" }
    // ...6 more days
  ]
}
```

---

## Settings

### POST /settings/location
```json
// Request
{ "city": "Dhaka", "latitude": 23.8103, "longitude": 90.4125, "calculation_method": "DHAKA" }

// Response 200
{ "success": true }
```

### GET /settings/location
```json
// Response 200
{ "city": "Dhaka", "latitude": 23.8103, "longitude": 90.4125, "calculation_method": "DHAKA" }
```

### POST /settings/mute-preference
```json
// Request
{
  "enabled_prayers": ["fajr", "maghrib", "isha"],
  "mute_duration_minutes": 5,
  "ml_verification_enabled": false
}

// Response 200
{ "success": true }
```

### GET /settings/mute-preference
```json
// Response 200
{
  "enabled_prayers": ["fajr", "maghrib", "isha"],
  "mute_duration_minutes": 5,
  "ml_verification_enabled": false
}
```

---

## Devices

### POST /devices/register
```json
// Request
{ "platform": "android", "push_token": "fcm_token_here" }

// Response 201
{ "device_id": "uuid" }
```

### GET /devices
```json
// Response 200
{
  "devices": [
    { "id": "uuid", "platform": "android", "last_synced_at": "2026-09-26T00:05:00Z" },
    { "id": "uuid", "platform": "chrome_extension", "last_synced_at": "2026-09-26T00:04:50Z" }
  ]
}
```

### DELETE /devices/:id
```json
// Response 204 No Content
```

---

## Account

### DELETE /account
```json
// Response 200
{ "success": true, "message": "Account and all associated data deletion scheduled." }
```

---

## Error Format (all endpoints)
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect."
  }
}
```

## Rate Limits
- Auth endpoints: 10 req/min/IP
- All other endpoints: 60 req/min/user

## Notes
- All timestamps in ISO 8601 UTC unless otherwise noted; prayer times returned in local time for the requested city.
- `calculation_method` enum values: `DHAKA`, `KARACHI`, `MWL`, `ISNA`, `EGYPT` (extend as needed per Aladhan API's method list).
