import { createRemoteJWKSet, jwtVerify } from 'jose';

const oktaIssuer = process.env.OKTA_ISSUER;
const oktaAudience = process.env.OKTA_AUDIENCE;
let jwksPromise;

async function resolveJwks() {
  if (!oktaIssuer) return null;

  const issuer = oktaIssuer.replace(/\/$/, '');
  const discoveryUrls = [`${issuer}/.well-known/openid-configuration`];

  // Okta org authorization server discovery endpoint.
  if (!issuer.includes('/oauth2/')) {
    discoveryUrls.push(`${issuer}/oauth2/.well-known/openid-configuration`);
  }

  for (const discoveryUrl of discoveryUrls) {
    try {
      const response = await fetch(discoveryUrl);
      if (!response.ok) continue;
      const metadata = await response.json();
      if (metadata?.jwks_uri) {
        return createRemoteJWKSet(new URL(metadata.jwks_uri));
      }
    } catch {
      // Keep trying candidates.
    }
  }

  // Fallback if discovery is unavailable.
  const fallbackJwksUrl = issuer.includes('/oauth2/')
    ? `${issuer}/v1/keys`
    : `${issuer}/oauth2/v1/keys`;

  return createRemoteJWKSet(new URL(fallbackJwksUrl));
}

async function getJwks() {
  if (!jwksPromise) {
    jwksPromise = resolveJwks();
  }
  return jwksPromise;
}

function getBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice('Bearer '.length).trim();
}

export async function requireOktaAuth(req, res, next) {
  if (!oktaIssuer) {
    return res.status(503).json({ error: 'Okta auth is not configured on API' });
  }

  const jwks = await getJwks();
  if (!jwks) {
    return res.status(503).json({ error: 'Okta JWKS could not be initialized' });
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
