# Role System Setup Guide for Future Accounts

## Overview
This document ensures that all future user accounts will work properly with the Professional Portal and role system without manual intervention.

## Automatic Systems in Place

### 1. Auto-Initialization System
- **Backend**: `/api/user/role` endpoint automatically creates PostgreSQL user records for new users
- **Default Role**: All new users start with "visitor" role
- **Auto-Creation**: When a user's role is fetched and they don't exist, they're automatically created

### 2. Role Recognition
The system recognizes these roles for Professional Portal access:
- ✅ `professional` - Shows Professional Portal
- ✅ `both` - Shows Professional Portal  
- ✅ `visitor` - Default role, can upgrade to professional
- ✅ `homeowner` - Can upgrade to professional via Settings

### 3. Role Upgrading
Users can change their role via:
- **Settings Page**: `/settings` - Role selection with descriptions
- **Professional Portal**: Direct upgrade flow for professionals
- **Automatic Update**: Updates both PostgreSQL and Firebase databases

### 4. Professional Portal Access
Visible when user role is:
```typescript
(userRole === 'professional' || userRole === 'both')
```

## Testing New Accounts

### Steps to Verify:
1. **Create New Account**: Sign up with any email
2. **Automatic Role**: Should receive "visitor" role automatically
3. **Settings Access**: Go to `/settings` to change role
4. **Professional Portal**: After changing to "professional" or "both", should see Professional Portal in navigation
5. **Stripe Setup**: Complete Stripe onboarding for payments

### Expected Behavior:
- ✅ New accounts automatically get "visitor" role
- ✅ Settings page allows role switching
- ✅ Professional Portal appears for professional/both roles
- ✅ Stripe onboarding accessible for professionals
- ✅ Payment system works between accounts

## Database Structure

### Users Table:
```sql
users:
  - id (primary key, Firebase UID)
  - email (unique)
  - role ('visitor' | 'homeowner' | 'professional' | 'both')
  - created_at, updated_at
```

### Role Flow:
1. **New User Login** → Auto-created with "visitor" role
2. **Role Selection** → Update via Settings page
3. **Professional Access** → Professional Portal visible
4. **Stripe Setup** → Complete marketplace onboarding
5. **Payment Ready** → Full payment flow operational

## Troubleshooting

### If Professional Portal Doesn't Appear:
1. Check user role in database: `SELECT id, email, role FROM users WHERE id = 'USER_ID';`
2. Update role if needed: `UPDATE users SET role = 'professional' WHERE id = 'USER_ID';`
3. Clear browser cache and refresh page
4. Verify role switching works via Settings page

### If Auto-Initialization Fails:
- Backend logs will show initialization attempts
- Manual creation: Use existing `/api/auth/update-role` endpoint
- Fallback: Firebase-based role system still functional

## Key Files Modified:
- `server/routes.ts` - Auto-initialization endpoint
- `client/src/components/header.tsx` - Role recognition logic  
- `client/src/components/UserRoleSettings.jsx` - Role switching interface
- `client/src/components/RoleChecker.tsx` - Automatic user initialization
- `client/src/hooks/useFirebaseAuth.ts` - Authentication with role fetching

## Production Ready
✅ All future accounts will work automatically
✅ No manual intervention required
✅ Professional Portal access guaranteed for professionals
✅ Complete payment system integration
✅ Scalable for unlimited users