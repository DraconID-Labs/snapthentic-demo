import { SignIn } from "~/components/SignIn";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-y-3 p-24">
      <SignIn />
    </main>
  );
}
