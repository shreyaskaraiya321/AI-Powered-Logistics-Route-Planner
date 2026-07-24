import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, Map, Truck, AlertCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeRoutes: 0,
    pendingOrders: 0,
    totalVehicles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lists, setLists] = useState({ activeRoutes: [], pendingOrders: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [ordersRes, routesRes, vehiclesRes] = await Promise.all([
          api.get('/orders').catch(() => ({ data: [] })),
          api.get('/routes').catch(() => ({ data: [] })),
          api.get('/vehicles').catch(() => ({ data: [] }))
        ]);

        const orders = ordersRes.data || [];
        const routes = routesRes.data || [];
        const vehicles = vehiclesRes.data || [];

        const pendingOrders = orders.filter(o => o.status === 'pending');
        const activeRoutes = routes.filter(r => r.status !== 'delivered' && r.status !== 'failed');

        setStats({
          activeRoutes: activeRoutes.length,
          pendingOrders: pendingOrders.length,
          totalVehicles: vehicles.length
        });

        setLists({
          activeRoutes,
          pendingOrders
        });
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-gray-400">Here's an overview of your logistics operations today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Routes" 
          value={stats.activeRoutes} 
          icon={Map} 
          color="text-blue-400" 
          bgColor="bg-blue-400/10" 
        />
        
        {user?.role !== 'driver' && (
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders} 
            icon={Package} 
            color="text-orange-400" 
            bgColor="bg-orange-400/10" 
          />
        )}

        {(user?.role === 'dispatcher' || user?.role === 'admin') && (
          <StatCard 
            title="Total Vehicles" 
            value={stats.totalVehicles} 
            icon={Truck} 
            color="text-green-400" 
            bgColor="bg-green-400/10" 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Active Routes List */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Active Routes</h2>
          {lists.activeRoutes.length === 0 ? (
            <p className="text-gray-400 text-sm">No active routes at the moment.</p>
          ) : (
            <div className="space-y-3">
              {lists.activeRoutes.map((route) => (
                <div key={route._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-white truncate max-w-[150px]">Route {route._id.slice(-6)}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 capitalize">{route.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex flex-col gap-1">
                    <span>{route.stopOrder?.length || 0} stops • {route.estimatedDuration || 0} mins</span>
                    <span>Assigned to: {route.driverId ? (typeof route.driverId === 'object' ? route.driverId.name : 'Driver Assigned') : 'Unassigned'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Orders List (Hidden for drivers) */}
        {user?.role !== 'driver' && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Pending Orders</h2>
            {lists.pendingOrders.length === 0 ? (
              <p className="text-gray-400 text-sm">No pending orders.</p>
            ) : (
              <div className="space-y-3">
                {lists.pendingOrders.map((order) => (
                  <div key={order._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-400/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-white truncate">Order {order._id.slice(-6)}</span>
                      <span className="text-xs text-orange-300 bg-orange-400/20 px-2 py-1 rounded-full">{order.loadDetails || 'Package'}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <p>From: <span className="text-gray-200">{order.origin}</span></p>
                      <p>To: <span className="text-gray-200">{order.destination}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center gap-6 hover:bg-white/5 transition-colors group">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bgColor} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
