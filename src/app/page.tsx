import CosmicRecipeWidget from "../components/CosmicRecipeWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-indigo-400 py-2">
          What To Eat Next
        </h1>
        <CosmicRecipeWidget />
      </div>
    </main>
  );
}
