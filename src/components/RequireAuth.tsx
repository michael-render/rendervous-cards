import { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { oktaAuth, authState } = useOktaAuth();

  useEffect(() => {
    if (authState && !authState.isAuthenticated) {
      void oktaAuth.signInWithRedirect();
    }
  }, [authState, oktaAuth]);

  if (!authState) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="card-font-display text-lg text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="card-font-display text-lg text-muted-foreground">Redirecting to Okta...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
