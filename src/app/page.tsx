import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-between p-24">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold">Toilet Rental Management</h1>
          <p className="text-lg text-zinc-600">Track your rentals and manage billing</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
