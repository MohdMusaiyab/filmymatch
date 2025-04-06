"use client";
import React from "react";
import { useSession } from "next-auth/react";

const HomePage: React.FC = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  return <div>hello!!user Created
    {loading ? (
      <p>Loading...</p>
    ) : session ? (
      <div>
        <h1>Welcome, {session.user.username}!</h1>
        <p>Your email: {session.user.email}</p>
      </div>
    ) : (
      <h1>Please sign in</h1>
    )}
  </div>;
};

export default HomePage;
