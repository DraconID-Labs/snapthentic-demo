import { redirect } from "next/navigation";

export default async function Page() {
  return redirect("/profile/me");
}
