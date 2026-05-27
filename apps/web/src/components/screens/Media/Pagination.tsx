import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export default function Pagination({
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center">
        <button
          onClick={onPrevPage}
          disabled={page === 0}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Page {page + 1} of {totalPages}
        </span>
      </div>
      <div className="flex items-center">
        <button
          onClick={onNextPage}
          disabled={page === totalPages - 1}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
