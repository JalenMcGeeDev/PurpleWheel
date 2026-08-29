import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-lilac flex items-center justify-center mx-auto mb-6 text-2xl">
        🔍
      </div>
      <h1 className="font-heading text-4xl text-purple-deep mb-3">Page not found</h1>
      <p className="text-ink/70 mb-8">
        The page you're looking for doesn't exist. Maybe you were trying to find a popup,
        check the schedule, or reserve some refills?
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/schedule"
          className="px-5 py-3 bg-purple text-white font-semibold rounded-xl hover:bg-purple-deep transition-colors"
        >
          View schedule
        </Link>
        <Link
          href="/"
          className="px-5 py-3 border border-lilac text-purple font-semibold rounded-xl hover:bg-lilac/30 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
