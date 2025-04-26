# Twitter Authentication with NextAuth.js

This project uses NextAuth.js for Twitter authentication. This README provides instructions on how to set up and use the Twitter authentication feature.

## Setup

1. Make sure you have the following environment variables set in your `.env.local` file:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-for-jwt-encryption
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

2. Ensure you have registered your application with the Twitter Developer Portal and have the following settings:

- **Callback URL**: `http://localhost:3000/api/auth/callback/twitter`
- **Website URL**: `http://localhost:3000`
- **App permissions**: Read and Write

## Usage

The Twitter authentication is implemented in the `TwitterAuth` component. You can use it as follows:

```jsx
import TwitterAuth from './components/TwitterAuth';

function MyComponent() {
  const handleAuthStatusChange = (isAuthenticated, credentials) => {
    // Handle authentication status change
    console.log('Authentication status:', isAuthenticated);
    console.log('Credentials:', credentials);
  };

  return (
    <div>
      <TwitterAuth onAuthStatusChange={handleAuthStatusChange} />
    </div>
  );
}
```

## Authentication Flow

1. User clicks "Connect with Twitter" button
2. User is redirected to Twitter for authentication
3. After successful authentication, user is redirected back to the application
4. NextAuth.js handles the callback and stores the authentication tokens
5. The `TwitterAuth` component receives the authentication status and credentials

## Direct Authentication

For development purposes, a direct authentication method is also provided. This allows you to authenticate without going through the Twitter OAuth flow.

To use direct authentication:

1. Click the "Direct Auth" button
2. Enter any username and password (they're not actually validated in this development version)
3. The system will use the application's tokens to authenticate with Twitter

## Troubleshooting

If you encounter issues with the Twitter authentication:

1. Make sure your Twitter Developer Portal settings are correct
2. Check that your environment variables are set correctly
3. Look for errors in the browser console
4. Check the NextAuth.js logs for more detailed information

## Security Considerations

- The direct authentication method is for development only and should not be used in production
- In production, always use the proper OAuth flow
- Never expose your Twitter API credentials in client-side code
- Use environment variables for all sensitive information
