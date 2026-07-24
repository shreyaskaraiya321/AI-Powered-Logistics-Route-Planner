import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Package, History, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Planner', path: '/planner', icon: Map },
    { name: 'Shipments', path: '/shipments', icon: Package },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-primary-900 text-gray-100 overflow-hidden font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 rounded-2xl flex flex-col z-10 relative">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Map className="w-5 h-5 text-accent" />
          </div>
          <h1 className="font-bold text-lg tracking-wide text-white">LogiRoute</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-accent/15 text-accent font-medium shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-24 flex items-center justify-between px-8 z-10 relative">
          <div className="text-xl font-medium text-white tracking-wide">
             
          </div>
          
          <div className="flex items-center gap-4 glass-panel px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
             <div className="text-right">
               <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
               <div className="text-xs text-accent capitalize">{user?.role || 'Guest'}</div>
             </div>
             <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
               <User className="w-5 h-5 text-accent" />
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10">
          <Outlet />
        </div>
      </main>
      
      {/* Ambient background decoration */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
}
