import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Not Found');
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-12">
      <p className="text-7xl font-bold text-zinc-800 tabular-nums">404</p>
      <p className="text-base font-semibold text-zinc-400">Page not found</p>
      <p className="text-sm text-zinc-600 text-center max-w-xs leading-relaxed">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center gap-2 h-8 px-4 rounded-md text-sm font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 ring-1 ring-zinc-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Trends
      </Link>
    </div>
  );
}
