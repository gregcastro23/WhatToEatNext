'use client';

import {usePrivy} from '@privy-io/react-auth';
import React from 'react';

const LoginButton = () => {
  const {
    ready,
    authenticated,
    login,
    logout,
  } = usePrivy();

  // Wait for the Privy SDK to be ready before showing the login button
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
