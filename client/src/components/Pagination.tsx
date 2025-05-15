interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxPageDisplay = 4;
    
    if (totalPages <= maxPageDisplay) {
      // Display all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // First page is always shown
      pages.push(1);
      
      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if we're at the beginning or end
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 3);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 2);
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Last page is always shown
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="flex space-x-1">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-icons text-sm">chevron_left</span>
      </button>
      
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg ${
            currentPage === page 
              ? 'bg-primary text-white' 
              : 'hover:bg-neutral-100'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-icons text-sm">chevron_right</span>
      </button>
    </div>
  );
}
