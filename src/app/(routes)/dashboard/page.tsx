import React from "react";
import Link from "next/link";
const page = () => {
  return (
    <div>
      <p>Welcome to the Dashboard</p>
      <Link href="/dashboard/create-post">Creat Post</Link>
      <p>Explore more features!</p>
      <p>Check out our latest updates!</p>
      <p>Stay tuned for more!</p>
    </div>
  );
};

export default page;
