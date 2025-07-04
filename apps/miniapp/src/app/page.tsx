import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Home() {
  const privateHello = await api.helloPrivate();
  const publicHello = await api.hello();
  const session = await getServerAuthSession();

  console.log(privateHello, publicHello);
  return (
    <div>
      Hello from Example App
      <div>{privateHello}</div>
      <div>{publicHello}</div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
