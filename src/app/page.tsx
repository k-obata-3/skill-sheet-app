import { requireSession } from "@/lib/auth/require";
import { redirect } from "next/navigation";

export default async function Home() {
  try {
    await requireSession();
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN") {
      redirect("/login");
    }
  }

  redirect("/dashboard");
}
