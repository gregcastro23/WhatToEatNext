'use client';

import React from 'react';

// Default state when Privy is unavailable
const DEFAULT_PRIVY_STATE = { ready: false, authenticated: false, login: () => {}, logout: () => {} };

// Resolve the usePrivy hook at module level so calls are never conditional
let _usePrivy: (() => typeof DEFAULT_PRIVY_STATE) | null = null;
try {
   
  const mod = require('@privy-io/react-auth');
  _usePrivy = mod.usePrivy;
} catch {
  // Privy not available
}

function usePrivySafe() {
  if (_usePrivy) {
    try {
      return _usePrivy();
    } catch {
      return DEFAULT_PRIVY_STATE;
    }
  }
  return DEFAULT_PRIVY_STATE;
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
