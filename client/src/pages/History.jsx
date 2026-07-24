import { useState, useEffect, useMemo } from 'react';
import { Search, Map, Clock, CheckCircle, AlertCircle, Play, Loader2, Navigation, Package } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function History() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/routes');
      // Sort newest first based on _id timestamp or createdAt
      setRoutes(data.reverse()); 
    } catch (err) {
      setError('Failed to fetch route history.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesSearch = route._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [routes, searchTerm, statusFilter]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'planned': return { icon: Map, color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'dispatched': return { icon: Navigation, color: 'text-purple-400', bg: 'bg-purple-400/10' };
      case 'in-progress': return { icon: Play, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
      case 'delivered': return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' };
      case 'failed': return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' };
      default: return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-400/10' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Route History</h1>
        <p className="text-gray-400">View and track past and ongoing logistics routes.</p>
      </div>

      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Route ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="dispatched">Dispatched</option>
          <option value="in-progress">In Progress</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-red-400 text-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-gray-400">No routes found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoutes.map((route) => {
            const StatusIcon = getStatusConfig(route.status).icon;
            const statusColor = getStatusConfig(route.status).color;
            const statusBg = getStatusConfig(route.status).bg;

            return (
              <div key={route._id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statusBg}`}>
                  <StatusIcon className={`w-6 h-6 ${statusColor}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white">Route {route._id.slice(-8)}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBg} ${statusColor}`}>
                      {route.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 flex flex-wrap gap-x-6 gap-y-2">
                    <span className="flex items-center gap-1"><Map className="w-4 h-4" /> Distance: {route.estimatedDistance || 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Duration: {route.estimatedDuration || 'N/A'} mins</span>
                    <span className="flex items-center gap-1"><Package className="w-4 h-4" /> Stops: {route.stopOrder?.length || 0}</span>
                  </div>
                </div>

                {user?.role !== 'driver' && (
                  <div className="text-right text-sm">
                    <p className="text-gray-400">Driver</p>
                    <p className="text-white font-medium">{route.driverId ? (typeof route.driverId === 'object' ? route.driverId.name : 'Assigned') : 'Unassigned'}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
