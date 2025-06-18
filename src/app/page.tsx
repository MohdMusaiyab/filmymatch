import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-providers';

async function Page() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <p>Page</p>
      {session?.user?.id ? (
        <p>User ID: {session.user.id}</p>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
}

export default Page;