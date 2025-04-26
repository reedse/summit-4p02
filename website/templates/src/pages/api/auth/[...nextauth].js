import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || 'uyEH7WsRjEvx2zfKqWpPZNe8J',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || 'ZUNAJpqHcjlLt5q6RKSr6LWdcyZJeeYkEeZMkWGemwheXCAZZw',
      version: '1.0a', // Use OAuth 1.0a for Twitter
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.oauth_token;
        token.accessSecret = account.oauth_token_secret;
        token.username = account.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      session.accessSecret = token.accessSecret;
      session.username = token.username;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-jwt-encryption',
  debug: true,
});
