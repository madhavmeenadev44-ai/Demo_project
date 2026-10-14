import React from "react";

export default function LoginLoading() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gray-50/60 dark:bg-zinc-950 animate-pulse">
      <div className="text-center mb-8">
        <div className="w-13 h-13 rounded-2xl bg-gray-200 dark:bg-zinc-800 mx-auto mb-3" />
        <div className="h-7 w-44 bg-gray-200 dark:bg-zinc-800 rounded mx-auto mb-2" />
        <div className="h-4 w-72 bg-gray-100 dark:bg-zinc-800/60 rounded mx-auto" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="h-20 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
        <div className="h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
        <div className="h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
        <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-lg" />
      </div>
    </main>
  );
}

