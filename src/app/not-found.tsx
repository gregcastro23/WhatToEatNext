import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-4 selection:bg-purple-500/30">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-amber-200 to-pink-400 animate-pulse">
            404
          </h2>
          <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-[0.2em]">
            Lost in the Ether
          </h1>
          <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed font-mono">
            THE CELESTIAL COORDINATES YOU ARE SEEKING DO NOT CURRENTLY MANIFEST IN THIS PLANE OF EXISTENCE.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-purple-400 hover:scale-105 transition-all duration-300"
          >
            Return Home
          </Link>
          <Link
            href="/profile"
            className="w-full sm:w-auto px-8 py-3 rounded-full border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:border-white transition-all duration-300"
          >
            Dashboard
          </Link>
        </div>

        {/* Decorative Element */}
        <div className="pt-16 opacity-20 flex justify-center">
          <div className="w-16 h-16 border-2 border-dashed border-white/30 rounded-full animate-slow-spin relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
