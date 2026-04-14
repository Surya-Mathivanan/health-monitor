import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Hide if there are not enough records to paginate
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-800/50 mt-4">
      <p className="text-xs text-slate-400">Page {currentPage} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          style={{ width: '32px', height: '32px' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          style={{ width: '32px', height: '32px' }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
