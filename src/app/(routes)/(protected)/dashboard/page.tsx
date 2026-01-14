import { getSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries/dashboard";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  // Redirect if not logged in - protects the dashboard at the server level
  if (!session?.id) {
    redirect("/login");
  }

  // Fetch all data in one parallel server-side call
  const { posts, collections, drafts } = await getDashboardData(session.id);

  return (
    <DashboardClient 
      initialPosts={posts}
      initialCollections={collections}
      initialDrafts={drafts}
      userId={session.id}
    />
  );
}