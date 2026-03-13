import { LoginCallback } from '@okta/okta-react';

const AuthCallback = () => {
  return (
    <LoginCallback
      errorComponent={({ error }) => (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-xl">
            <p className="card-font-display text-xl text-foreground mb-2">Sign-in failed</p>
            <p className="card-font-body text-sm text-muted-foreground">
              {error?.message || 'Unable to complete Okta callback.'}
            </p>
          </div>
        </div>
      )}
    />
  );
};

export default AuthCallback;
