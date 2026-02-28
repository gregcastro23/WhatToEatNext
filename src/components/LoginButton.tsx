'use client';

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const LoginButton = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  return (
    <div>
      {session ? (
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Log out
        </button>
      ) : (
        <button
          onClick={() => signIn('google')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Log in
        </button>
      )}
    </div>
  );
};

export default LoginButton;
