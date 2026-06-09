"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-[#fafafa]">
      <div className="max-w-md">
        <h1 className="text-6xl font-bold font-display text-gray-900">404</h1>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-4">Page not found</h2>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
          The page you are looking for doesn't exist or has been moved to another URL.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition shadow-md hover:shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
