import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@dragg/auth";
import CanvasBoard from "@/components/canvas-board";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <CanvasBoard />;
}
