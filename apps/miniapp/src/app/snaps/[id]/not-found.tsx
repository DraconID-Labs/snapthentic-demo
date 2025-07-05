export default async function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Snap not found</h1>
      <p className="text-gray-500">
        The snap you are looking for does not exist.
      </p>
    </div>
  );
}
