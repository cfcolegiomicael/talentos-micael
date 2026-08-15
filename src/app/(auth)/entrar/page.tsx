import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Entrar — Talentos Waldorf Micael" };

export default async function EntrarPage() {
  const user = await getCurrentUser();
  if (user) redirect("/diretorio");

  return <LoginForm />;
}
