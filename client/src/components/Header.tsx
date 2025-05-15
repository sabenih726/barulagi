interface HeaderProps {
  pageTitle: string;
  onOpenSidebar: () => void;
}

export default function Header({ pageTitle, onOpenSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onOpenSidebar} className="lg:hidden mr-2">
            <span className="material-icons text-neutral-500">menu</span>
          </button>
          <h2 className="text-xl font-medium text-neutral-500">{pageTitle}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-neutral-100">
              <span className="material-icons text-neutral-400">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
          </div>
          <div>
            <button className="p-2 rounded-full hover:bg-neutral-100">
              <span className="material-icons text-neutral-400">settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
