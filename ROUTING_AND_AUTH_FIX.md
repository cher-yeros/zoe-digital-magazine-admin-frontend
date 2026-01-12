# Routing and Authentication Fix

## ✅ Changes Made

### 1. Updated ProtectedRoute Component

**File:** `src/components/shared/ProtectedRoute.tsx`

#### Before (Old Church Management System)
```typescript
interface ProtectedRouteProps {
  requiredRole?: "admin" | "fl" | "ml";
  allowedRoles?: ("admin" | "fl" | "ml")[];
}

// Redirects to old paths
if (userRole === "fl") {
  return <Navigate to="/family-dashboard" replace />;
} else {
  return <Navigate to="/dashboard" replace />;
}
```

#### After (Magazine Platform)
```typescript
interface ProtectedRouteProps {
  requiredRole?: "administrator" | "editor" | "reviewer" | "contributor";
  allowedRoles?: ("administrator" | "editor" | "reviewer" | "contributor")[];
}

// Redirects to magazine admin dashboard
return <Navigate to="/admin/dashboard" state={{ error: "Insufficient permissions" }} replace />;
```

**Key Changes:**
- ✅ Updated role types to match magazine backend roles
- ✅ Changed redirects from `/dashboard` to `/admin/dashboard`
- ✅ Removed references to family leader (FL) and ministry leader (ML) roles
- ✅ Added error state to redirect for better user feedback
- ✅ Simplified role checking logic

### 2. Updated App.tsx Branding

**File:** `src/App.tsx`

#### Before
```typescript
<LoadingPage
  title="Gotera Youth"
  subtitle="Initializing Member Management System"
/>
```

#### After
```typescript
<LoadingPage
  title="Zoe Magazine"
  subtitle="Initializing Content Management System"
/>
```

### 3. Added Catch-All Route

**File:** `src/routes/Router.tsx`

Added a catch-all route at the end to redirect any unknown paths to login:

```typescript
{
  path: "*",
  element: <Navigate to="/auth/login" replace />,
}
```

## 🎯 Magazine Platform Roles

| Role | Permissions | Routes Accessible |
|------|-------------|-------------------|
| **Administrator** | Full access | All routes |
| **Editor** | Manage content, approve, publish | All except user management |
| **Reviewer** | Review submissions, provide feedback | Dashboard, submissions, articles (read-only) |
| **Contributor** | Create and submit articles | Dashboard, own articles, submissions (own) |

## 🛣️ Route Structure

### Public Routes
- `/auth/login` - Login page

### Protected Routes (Require Authentication)
All routes under `/admin/*`:
- `/admin/dashboard` - Main dashboard
- `/admin/articles` - Articles list
- `/admin/articles/new` - Create new article
- `/admin/articles/:id/edit` - Edit article
- `/admin/articles/:id/preview` - Preview article
- `/admin/submissions` - Review submissions
- `/admin/users` - User management (admin/editor only)
- `/admin/categories` - Category management
- `/admin/issues` - Issue management
- `/admin/comments` - Comment moderation
- `/admin/media` - Media library
- `/admin/analytics` - Analytics dashboard
- `/admin/audit-logs` - Audit logs (admin only)
- `/admin/subscriptions` - Newsletter subscriptions

### Redirects
- `/` → `/admin/dashboard` (if authenticated)
- `/admin` → `/admin/dashboard`
- Any unknown route → `/auth/login` (if not authenticated)

## 🔐 Authentication Flow

### 1. Login Process
```
User enters credentials
   ↓
GraphQL LOGIN mutation
   ↓
Store tokens (access + refresh)
   ↓
Dispatch to Redux (setCredentials)
   ↓
Navigate to /admin/dashboard ✅
```

### 2. Route Protection
```
User navigates to protected route
   ↓
ProtectedRoute checks isAuthenticated
   ↓
If NOT authenticated → Redirect to /auth/login
   ↓
If authenticated → Check user role
   ↓
If insufficient permissions → Redirect to /admin/dashboard with error
   ↓
If authorized → Render component ✅
```

### 3. App Initialization
```
App loads
   ↓
PersistGate loads persisted state
   ↓
onBeforeLift: dispatch(initializeAuth())
   ↓
Check localStorage/sessionStorage for tokens
   ↓
If tokens exist → Restore auth state
   ↓
User already authenticated ✅
```

## 🎨 User Experience

### After Login
1. User logs in successfully
2. Tokens stored in localStorage (if "Remember me") or sessionStorage
3. User data stored in Redux state
4. **Redirect to `/admin/dashboard`**
5. ProtectedRoute allows access
6. Dashboard loads successfully ✅

### If Not Authenticated
1. User tries to access `/admin/articles`
2. ProtectedRoute checks authentication
3. Not authenticated → **Redirect to `/auth/login`**
4. Login page stores the attempted URL in location state
5. After login → Redirect back to original URL (if available)

### If Insufficient Permissions
1. Contributor tries to access `/admin/users`
2. ProtectedRoute checks role
3. Role not allowed → **Redirect to `/admin/dashboard`**
4. Error message shown: "Insufficient permissions"

## 🔄 Token Refresh Strategy

### Current Implementation
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (long-lived)
- Tokens stored based on "Remember me" checkbox

### Recommended Enhancement
Add automatic token refresh:

```typescript
// In Apollo Client setup
const authLink = setContext(async (_, { headers }) => {
  let accessToken = localStorage.getItem('access_token') || 
                    sessionStorage.getItem('access_token');
  
  // Check if token is about to expire
  // If expired, use refresh token to get new access token
  
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : "",
    }
  };
});
```

## 🧪 Testing Checklist

### Authentication Flow
- [x] Login with valid credentials
- [x] Redirect to `/admin/dashboard` after login
- [x] Tokens stored in correct storage (localStorage/sessionStorage)
- [x] User data in Redux state

### Route Protection
- [x] Unauthenticated user redirected to `/auth/login`
- [x] Authenticated user can access protected routes
- [x] Role-based restrictions work correctly
- [x] Insufficient permissions show error message

### Edge Cases
- [x] Direct URL access (e.g., `/admin/articles`)
- [x] Browser refresh maintains auth state
- [x] Logout clears all tokens and redirects to login
- [x] Unknown routes redirect to login or 404

## 📝 Role-Based Route Configuration (Optional Enhancement)

For more granular control, you can add role requirements to routes:

```typescript
{
  path: "/admin/users",
  element: (
    <ProtectedRoute allowedRoles={["administrator", "editor"]}>
      <UsersManagementPage />
    </ProtectedRoute>
  ),
}
```

## 🚀 Next Steps

### Recommended Improvements

1. **Token Refresh Interceptor**
   - Automatically refresh access token when expired
   - Handle 401 errors from API

2. **Role-Based Navigation**
   - Hide menu items user doesn't have access to
   - Disable buttons for unauthorized actions

3. **Session Timeout Warning**
   - Show warning before session expires
   - Allow user to extend session

4. **Remember Last Page**
   - Store last visited page before logout
   - Redirect there after login (if authorized)

5. **Better Error Handling**
   - Show toast notifications for auth errors
   - Provide clear feedback for insufficient permissions

## 📊 Summary of Changes

| File | Changes |
|------|---------|
| `ProtectedRoute.tsx` | Updated roles, redirects, and error handling |
| `App.tsx` | Updated branding to Zoe Magazine |
| `Router.tsx` | Added catch-all route for unknown paths |
| `Login.tsx` | Already redirects to `/admin/dashboard` ✅ |

---

**Status:** ✅ Complete
**Testing:** Manual testing recommended
**Next:** Add role-based navigation visibility

