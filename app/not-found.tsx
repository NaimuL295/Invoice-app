import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
      >
        Return Home
      </Link>
    </div>
  );
}