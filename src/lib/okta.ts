import { OktaAuth } from '@okta/okta-auth-js';

const issuer = import.meta.env.VITE_OKTA_ISSUER;
const clientId = import.meta.env.VITE_OKTA_CLIENT_ID;
const redirectUri =
  import.meta.env.VITE_OKTA_REDIRECT_URI ||
  `${window.location.origin}/login/callback`;

export const isOktaConfigured = Boolean(issuer && clientId);

export const oktaAuth = isOktaConfigured
  ? new OktaAuth({
      issuer,
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      pkce: true,
    })
  : null;
