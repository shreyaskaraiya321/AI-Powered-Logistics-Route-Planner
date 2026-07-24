import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Map, Loader2, AlertCircle, CheckCircle2, Navigation, Bot, ArrowRight } from 'lucide-react';

export default function Planner() {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  
  // Submission State
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState(null);
  
  // Result State
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, vehiclesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/vehicles')
      ]);
      
      setOrders(ordersRes.data.filter(o => o.status === 'pending'));
      setVehicles(vehiclesRes.data.filter(v => v.availability === true));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderToggle = (id) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    if (selectedOrders.length === 0) {
      setPlanError('Please select at least one order.');
      return;
    }

    setPlanning(true);
    setPlanError(null);
    setPlannedRoute(null);
    setAiExplanation(null);

    try {
      const payload = { orderIds: selectedOrders };
      if (selectedVehicle) payload.vehicleId = selectedVehicle;

      const res = await api.post('/routes/plan', payload);
      const route = res.data;
      setPlannedRoute(route);

      // Fetch AI Explanation immediately
      setExplaining(true);
      try {
        const aiRes = await api.post(`/routes/${route._id}/explain`);
        setAiExplanation(aiRes.data);
      } catch (aiErr) {
        setAiExplanation({ responseText: "Failed to load AI explanation." });
      } finally {
        setExplaining(false);
      }

      // Refresh orders list
      fetchData();
      setSelectedOrders([]);
      setSelectedVehicle('');
    } catch (err) {
      setPlanError(err.response?.data?.message || 'Failed to plan route');
    } finally {
      setPlanning(false);
    }
  };

  const handleApprove = async () => {
    if (!plannedRoute) return;
    setApproving(true);
    try {
      await api.post(`/routes/${plannedRoute._id}/approve`);
      // Update UI to show approval
      setPlannedRoute(prev => ({ ...prev, dispatcherApproved: true }));
    } catch (err) {
      console.error(err);
      alert('Failed to approve route.');
    } finally {
      setApproving(false);
    }
  };

  if (user?.role === 'customer' || user?.role === 'driver') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg">You do not have permission to access the Route Planner.</p>
      </div>
    );
  }

  if (loading && !planning) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Navigation className="text-accent w-8 h-8" />
          AI Route Planner
        </h1>
        <p className="text-gray-400">Select pending shipments to optimize and assign to a vehicle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-medium text-white mb-6">Create New Route</h2>
          
          <form onSubmit={handlePlanRoute} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Pending Shipments ({orders.length})
              </label>
              
              {orders.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-xl text-center text-sm text-gray-400 border border-white/5">
                  No pending shipments found.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {orders.map(order => (
                    <label 
                      key={order._id} 
                      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${
                        selectedOrders.includes(order._id) 
                          ? 'border-accent/50 bg-accent/10' 
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-1 accent-accent"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleOrderToggle(order._id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-200 text-sm">Order #{order._id.slice(-6)}</span>
                          <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300">{order.loadDetails}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="truncate max-w-[120px]">{order.origin}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{order.destination}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Assign Vehicle (Optional)
              </label>
              <select 
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none"
              >
                <option value="">Auto-select optimal vehicle</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.plateNumber} (Cap: {v.capacity})</option>
                ))}
              </select>
            </div>

            {planError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{planError}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={planning || selectedOrders.length === 0}
              className="w-full bg-accent/20 hover:bg-accent/30 text-accent font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-accent/20"
            >
              {planning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Map className="w-5 h-5" />}
              {planning ? 'Generating Route...' : 'Generate AI Route'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {!plannedRoute && !planning && (
            <div className="h-full glass-panel rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-gray-300 font-medium mb-2">Awaiting Optimization</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Select orders and generate a route to see the AI's deterministic grouping and strategic dispatch explanation.
              </p>
            </div>
          )}

          {planning && (
            <div className="h-full glass-panel rounded-2xl flex flex-col items-center justify-center p-8 min-h-[400px]">
               <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
               <p className="text-accent font-medium animate-pulse">Running Constraint Validation...</p>
            </div>
          )}

          {plannedRoute && (
            <div className="glass-panel p-6 rounded-2xl flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Route Validated
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Route ID: {plannedRoute._id.slice(-6)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">{plannedRoute.estimatedDistance} km</p>
                  <p className="text-sm text-gray-400">{plannedRoute.estimatedDuration} mins</p>
                </div>
              </div>

              <div className="flex-1 bg-primary-900/50 rounded-xl p-5 mb-6 border border-white/5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 relative z-10">
                   <Bot className="w-5 h-5 text-accent" />
                   <h4 className="font-medium text-gray-200">Gemini AI Explanation</h4>
                </div>
                
                <div className="relative z-10 text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {explaining ? (
                    <div className="flex items-center gap-3 text-accent">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating strategic brief...
                    </div>
                  ) : (
                    aiExplanation?.responseText || 'No explanation generated.'
                  )}
                </div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl pointer-events-none rounded-full" />
              </div>

              <div className="mt-auto">
                {plannedRoute.dispatcherApproved ? (
                   <div className="w-full py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center font-medium flex items-center justify-center gap-2">
                     <CheckCircle2 className="w-5 h-5" />
                     Dispatched to Driver
                   </div>
                ) : (
                  <button 
                    onClick={handleApprove}
                    disabled={approving || explaining}
                    className="w-full bg-white hover:bg-gray-100 text-primary-900 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Approve & Dispatch Route'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
