# Wally Signup - "Failed to Fetch" Fix
**Date:** 10 Gennaio 2026, 00:05 UTC (11 Gen)
**Status:** ✅ 100% RESOLVED

---

## 🎯 Problem: "Failed to Fetch" Error

When users tried to sign up on https://wally.leomat.it, they got:
```
Error: Failed to fetch
```

The browser's console showed CORS errors.

---

## 🔍 Root Causes Identified

### Issue #1: Missing Slug Field ❌
**File:** `src/contexts/AuthContext.tsx`

The tenant creation was missing the required `slug` field:

```typescript
// BEFORE (broken):
.insert({
  name: `${fullName}'s Workspace`,
})

// AFTER (fixed):
.insert({
  name: `${fullName}'s Workspace`,
  slug: email.split('@')[0].toLowerCase() + '-' + Date.now(),
})
```

### Issue #2: CORS Headers Conflict ❌
**File:** `/etc/nginx/sites-available/api.wally.leomat.it`

Kong Gateway was returning:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

This combination is **forbidden by browsers**. When credentials is `true`, origin cannot be `*`.

---

## ✅ Solutions Applied

### Fix #1: Added Slug Generation
**Location:** `src/contexts/AuthContext.tsx:132`

```typescript
slug: email.split('@')[0].toLowerCase() + '-' + Date.now()
```

This generates unique slugs like:
- `mario.rossi-1736551234567`
- `test-1736551299123`

### Fix #2: Nginx CORS Override
**Location:** `/etc/nginx/sites-available/api.wally.leomat.it`

Added directives to hide Kong's wildcard CORS and use specific origin:

```nginx
# Hide Kong's CORS headers
proxy_hide_header Access-Control-Allow-Origin;
proxy_hide_header Access-Control-Allow-Methods;
proxy_hide_header Access-Control-Allow-Headers;
proxy_hide_header Access-Control-Allow-Credentials;

# Use Nginx's CORS headers (server-level)
add_header Access-Control-Allow-Origin "https://wally.leomat.it" always;
add_header Access-Control-Allow-Credentials "true" always;
```

### Fix #3: OPTIONS Preflight Handler
```nginx
location / {
    if ($request_method = OPTIONS) {
        return 204;  # Returns our CORS headers from server level
    }
    # ... proxy_pass
}
```

---

## 🧪 Test Results

### CORS Verification
```
✅ OPTIONS /auth/v1/signup → 204 No Content
✅ Access-Control-Allow-Origin: https://wally.leomat.it
✅ Access-Control-Allow-Credentials: true
✅ CORS Headers compatible with credentials
```

### Complete Signup Flow (5/5 Tests)
```
[1/5] CORS Preflight (OPTIONS)... ✅
[2/5] POST Signup... ✅
[3/5] Login for token... ✅
[4/5] Create Tenant (with slug)... ✅
[5/5] Create Profile... ✅

RESULT: 5/5 PASSED - 100% FUNCTIONAL
```

---

## 📋 Changes Summary

### Files Modified
1. **`/opt/wally/frontend/src/contexts/AuthContext.tsx`**
   - Added slug generation on tenant creation

2. **`/etc/nginx/sites-available/api.wally.leomat.it`**
   - Added `proxy_hide_header` directives
   - Fixed CORS header order
   - Added all required CORS headers

3. **Container Rebuild**
   - Rebuilt Docker image with fixed code
   - Deployed new container

### Services Reloaded
- ✅ Docker container rebuilt and restarted
- ✅ Nginx configuration tested and reloaded
- ✅ PostgREST schema cache refreshed

---

## 🚀 How to Test

### For the User:
1. **Clear browser cache:**
   - **Chrome/Edge:** Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - **Firefox:** Press `Ctrl+Shift+Del` → Select "Cache" → Clear
   - **Safari:** Press `Cmd+Option+E`

2. **Or use Incognito/Private mode:**
   - Open a new incognito/private window
   - Go to https://wally.leomat.it

3. **Sign up:**
   - Click "Registrati"
   - Fill in: Nome completo, Email, Password, Conferma password
   - Click "Registrati"
   - Should work without "Failed to fetch" error!

### Expected Behavior
1. Form submission shows loading spinner
2. Success toast: "Registrazione completata! Controlla la tua email per confermare."
3. Redirect to /login page
4. Can now log in with credentials

---

## 🔧 Technical Details

### CORS Headers Sent by Nginx
```
Access-Control-Allow-Origin: https://wally.leomat.it
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, apikey, X-Client-Info, X-Requested-With, Prefer, Content-Profile, Accept-Profile
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

### Signup Flow
```
Browser → https://wally.leomat.it/signup
   ↓ (form submit)
OPTIONS https://api.wally.leomat.it/auth/v1/signup ✅ 204
   ↓
POST https://api.wally.leomat.it/auth/v1/signup ✅ 200
   ↓ (user created in auth.users)
POST https://api.wally.leomat.it/rest/v1/tenants ✅ 201
   ↓ (tenant created in wally.tenants with slug)
POST https://api.wally.leomat.it/rest/v1/profiles ✅ 201
   ↓ (profile created in wally.profiles)
Success! → Redirect to /login
```

---

## 📊 Verification Commands

```bash
# Check CORS headers
curl -I -X OPTIONS \
  -H "Origin: https://wally.leomat.it" \
  -H "Access-Control-Request-Method: POST" \
  https://api.wally.leomat.it/auth/v1/signup

# Test signup API
curl -X POST https://api.wally.leomat.it/auth/v1/signup \
  -H "apikey: <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Check nginx config
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/api.wally.leomat.it.access.log
```

---

## ✅ Status

| Component | Status |
|-----------|--------|
| CORS Preflight | ✅ Working |
| POST Signup | ✅ Working |
| Slug Generation | ✅ Working |
| Tenant Creation | ✅ Working |
| Profile Creation | ✅ Working |
| **Overall** | **✅ 100% FUNCTIONAL** |

---

## 🎉 Conclusion

The "Failed to fetch" error is **completely resolved**.

Users can now:
- ✅ Sign up with email/password
- ✅ Create their workspace automatically
- ✅ Log in and use the application

**WALLY IS 100% READY FOR USERS!** 🚀

---

*Fix completed: 11 Gennaio 2026, 00:05 UTC*
*Total fixes applied: 3 (slug generation, CORS config, container rebuild)*
*Test status: 5/5 passed - 100% functional*
