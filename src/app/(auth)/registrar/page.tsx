import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Criar conta — Talentos Waldorf Micael" };

export default async function RegistrarPage(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/diretorio");

  const { code } = await props.searchParams;

  return <RegisterForm defaultInviteCode={code ?? ""} />;
}
