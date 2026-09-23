"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-600 mt-2">Please try again. If the problem continues, contact caumbrellanetwork@gmail.com.</p>
        <button type="button" onClick={reset} className="mt-6 bg-blue-600 text-white font-bold px-5 py-3 rounded-xl">
          Try again
        </button>
      </div>
    </div>
  );
}
