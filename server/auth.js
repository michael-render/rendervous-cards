import { createRemoteJWKSet, jwtVerify } from 'jose';

const oktaIssuer = process.env.OKTA_ISSUER;
const oktaAudience = process.env.OKTA_AUDIENCE;

const jwksUrl = oktaIssuer ? new URL(`${oktaIssuer.replace(/\/$/, '')}/v1/keys`) : null;
const jwks = jwksUrl ? createRemoteJWKSet(jwksUrl) : null;

function getBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice('Bearer '.length).trim();
}

export function requireOktaAuth(req, res, next) {
  if (!oktaIssuer || !jwks) {
    return res.status(503).json({ error: 'Okta auth is not configured on API' });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const verifyOptions = { issuer: oktaIssuer };
  if (oktaAudience) {
    verifyOptions.audience = oktaAudience;
  }

  jwtVerify(token, jwks, verifyOptions)
    .then(({ payload }) => {
      req.user = payload;
      next();
    })
    .catch((err) => {
      console.error('Okta token verification failed:', err?.message || err);
      res.status(401).json({ error: 'Invalid or expired token' });
    });
}
