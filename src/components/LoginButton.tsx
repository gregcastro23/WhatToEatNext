'use client';

import React from 'react';

// Safe hook that gracefully handles missing PrivyProvider
function usePrivySafe() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { usePrivy } = require('@privy-io/react-auth');
    return usePrivy();
  } catch {
    return { ready: false, authenticated: false, login: () => {}, logout: () => {} };
  }
}

const LoginButton = () => {
  const { ready, authenticated, login, logout } = usePrivySafe();

  // Don't render if Privy SDK isn't ready or isn't available
  if (!ready) {
    return null;
  }

  return (
    <div>
      {authenticated ? (
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Log out
        </button>
      ) : (
        <button
          onClick={login}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Log in
        </button>
      )}
    </div>
  );
};

export default LoginButton;
