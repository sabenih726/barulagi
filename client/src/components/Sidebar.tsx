import { useLocation, Link } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ isOpen, onClose, onPageChange }: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { route: "/", label: "Dashboard", icon: "dashboard" },
    { route: "/tickets", label: "Daftar Tiket", icon: "list_alt" },
    { route: "/create-ticket", label: "Buat Tiket Baru", icon: "add_circle" },
    { route: "/assignments", label: "Penugasan", icon: "engineering" },
    { route: "/reports", label: "Laporan", icon: "bar_chart" },
  ];

  const handleNavClick = (label: string) => {
    onPageChange(label);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside 
      className={`bg-neutral-500 text-white w-64 flex-shrink-0 h-full fixed lg:relative z-20 transform
                 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                 transition-transform duration-300 ease-in-out`}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">home_repair_service</span>
            <h1 className="font-medium text-xl">FacilityFix</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-white">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => (
              <li key={item.route} className="mb-1">
                <Link href={item.route}>
                  <div 
                    className={`flex items-center p-3 rounded-lg text-white cursor-pointer
                               ${location === item.route 
                                 ? 'bg-primary' 
                                 : 'hover:bg-primary/80'} 
                               transition-colors`}
                    onClick={() => handleNavClick(item.label)}
                  >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Info */}
        <div className="mt-auto pt-4 border-t border-neutral-400">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-500">
              <span className="material-icons">person</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Ahmad Fauzi</p>
              <p className="text-xs text-neutral-300">Admin Fasilitas</p>
            </div>
            <button className="ml-auto">
              <span className="material-icons text-neutral-300">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
