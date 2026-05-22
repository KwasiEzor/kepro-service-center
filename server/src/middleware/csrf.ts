import { doubleCsrf } from 'csrf-csrf';
import { env } from '../../env';

export const {
  invalidCsrfTokenError, // This is an error object you can use to check if an error is a CSRF error
  generateToken, // Use this in your routes to generate a token for the client
  validateRequest, // This is the middleware that validates the request
  doubleCsrfProtection, // This is the main middleware that does both
} = doubleCsrf({
  getSecret: () => env.JWT_SECRET, // Use a consistent secret
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: false, // Client needs to read this to send it back in a header
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'], // Client will send it in this header
});
