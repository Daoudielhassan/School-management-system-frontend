# Token Expiration Handling

This document explains how the application handles expired JWT tokens and automatically redirects users to the login page.

## Overview

The application implements multiple layers of token expiration detection to ensure users are automatically logged out when their session expires:

1. **Server-side Middleware Check**: Validates tokens on each request
2. **Client-side Axios Interceptor**: Handles API response errors
3. **Periodic Token Validation**: Proactively checks token expiration
4. **Initial Load Validation**: Checks tokens when the app loads

## Implementation Details

### 1. Server-side Middleware (`src/middleware.ts`)

The Next.js middleware checks for token expiration on every protected route request:

- Validates JWT token expiration using the `isTokenExpired()` utility function
- Clears expired cookies and redirects to login page
- Handles both protected routes and login page redirects

### 2. Client-side Axios Interceptor (`src/context/AuthContext.tsx`)

An axios response interceptor automatically handles 401/403 responses:

- Intercepts all API responses
- Detects authentication errors (401 Unauthorized, 403 Forbidden)
- Automatically logs out the user and redirects to login
- Shows a toast notification to inform the user

### 3. Periodic Token Validation

The AuthContext includes a periodic check that runs every 5 minutes:

- Proactively validates token expiration
- Prevents users from being caught off-guard by expired tokens
- Automatically logs out users when tokens expire

### 4. Initial Load Validation

When the application loads, it validates existing tokens:

- Checks if stored tokens are expired before setting authentication state
- Clears expired cookies on app startup
- Prevents authentication with expired tokens

## Utility Functions

### `isTokenExpired(token: string): boolean`

Located in `src/lib/utils.ts`, this function:

- Decodes the JWT token payload
- Compares the expiration time (`exp`) with current time
- Returns `true` if token is expired or invalid
- Returns `false` if token is valid

### `getTokenPayload(token: string): any`

Utility function to extract token payload for debugging or user information.

## User Experience

When a token expires, the user will:

1. See a toast notification: "Your session has expired. Please log in again."
2. Be automatically redirected to the login page
3. Have all authentication cookies cleared
4. Need to log in again to continue using the application

## Security Benefits

- **Automatic Logout**: Users are automatically logged out when sessions expire
- **No Manual Intervention**: No need for users to manually refresh or re-authenticate
- **Consistent State**: Ensures authentication state is always valid
- **Multiple Detection Layers**: Redundant checks prevent edge cases

## Configuration

The token expiration handling can be configured by modifying:

- **Check Interval**: Change the periodic check interval in `AuthContext.tsx` (currently 5 minutes)
- **Error Status Codes**: Modify which HTTP status codes trigger logout in the axios interceptor
- **Toast Messages**: Customize the notification message shown to users
- **Redirect Behavior**: Adjust where users are redirected after token expiration 