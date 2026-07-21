import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold">Toilet Rental Management</h1>
        <p className="text-lg text-zinc-600">Track your rentals and manage billing</p>
      </div>
    </main>
  );
}
