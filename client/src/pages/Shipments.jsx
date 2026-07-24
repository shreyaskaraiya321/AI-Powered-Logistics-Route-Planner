import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Package, Truck, UserCircle, Plus, Loader2, AlertCircle } from 'lucide-react';

export default function Shipments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]); // for driver creation
  const [loading, setLoading] = useState(true);

  // Form States
  const [orderForm, setOrderForm] = useState({ origin: '', destination: '', loadDetails: '', servicePriority: 'standard' });
  const [vehicleForm, setVehicleForm] = useState({ plateNumber: '', capacity: '', operatingArea: '', shift: 'Morning' });
  const [driverForm, setDriverForm] = useState({ userId: '', vehicleId: '' });

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [o, v, d, u] = await Promise.all([
        api.get('/orders'),
        api.get('/vehicles'),
        api.get('/drivers'),
        api.get('/auth/users').catch(() => ({ data: [] }))
      ]);
      setOrders(o.data);
      setVehicles(v.data);
      setDrivers(d.data);
      setUsers(u.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/orders', orderForm);
      setSuccess('Order created successfully!');
      setOrderForm({ origin: '', destination: '', loadDetails: '', servicePriority: 'standard' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/vehicles', { ...vehicleForm, availability: true });
      setSuccess('Vehicle created successfully!');
      setVehicleForm({ plateNumber: '', capacity: '', operatingArea: '', shift: 'Morning' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = { userId: driverForm.userId, status: 'active' };
      if (driverForm.vehicleId) payload.vehicleId = driverForm.vehicleId;
      await api.post('/drivers', payload);
      setSuccess('Driver profile created successfully!');
      setDriverForm({ userId: '', vehicleId: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create driver');
    } finally {
      setSubmitting(false);
    }
  };

  // Only dispatcher and admin can manage vehicles/drivers. 
  // Customers can only manage orders. Drivers can't access this page.
  if (user?.role === 'driver') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg">You do not have permission to access Management.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Resource Management</h1>
        <p className="text-gray-400">Create and manage your logistics network.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => { setActiveTab('orders'); setError(''); setSuccess(''); }}
          className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'orders' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Package className="w-4 h-4" /> Shipments
        </button>
        
        {['dispatcher', 'admin'].includes(user?.role) && (
          <>
            <button 
              onClick={() => { setActiveTab('vehicles'); setError(''); setSuccess(''); }}
              className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'vehicles' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Truck className="w-4 h-4" /> Vehicles
            </button>
            <button 
              onClick={() => { setActiveTab('drivers'); setError(''); setSuccess(''); }}
              className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'drivers' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <UserCircle className="w-4 h-4" /> Drivers
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" />
              Create {activeTab === 'orders' ? 'Shipment' : activeTab === 'vehicles' ? 'Vehicle' : 'Driver Profile'}
            </h2>

            {/* ORDER FORM */}
            {activeTab === 'orders' && (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Origin</label>
                  <input required value={orderForm.origin} onChange={e => setOrderForm({...orderForm, origin: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" placeholder="Warehouse A" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Destination</label>
                  <input required value={orderForm.destination} onChange={e => setOrderForm({...orderForm, destination: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Load Details</label>
                  <input required value={orderForm.loadDetails} onChange={e => setOrderForm({...orderForm, loadDetails: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" placeholder="e.g. 5000kg Electronics" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Priority</label>
                  <select value={orderForm.servicePriority} onChange={e => setOrderForm({...orderForm, servicePriority: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none appearance-none">
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-accent/20 hover:bg-accent/30 text-accent font-medium py-3 rounded-xl transition-colors border border-accent/20 mt-4 flex justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Shipment'}
                </button>
              </form>
            )}

            {/* VEHICLE FORM */}
            {activeTab === 'vehicles' && (
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Plate Number</label>
                  <input required value={vehicleForm.plateNumber} onChange={e => setVehicleForm({...vehicleForm, plateNumber: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" placeholder="XYZ-9876" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Capacity</label>
                  <input required value={vehicleForm.capacity} onChange={e => setVehicleForm({...vehicleForm, capacity: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" placeholder="e.g. 10000kg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Operating Area</label>
                  <input value={vehicleForm.operatingArea} onChange={e => setVehicleForm({...vehicleForm, operatingArea: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" placeholder="e.g. North Zone" />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-accent/20 hover:bg-accent/30 text-accent font-medium py-3 rounded-xl transition-colors border border-accent/20 mt-4 flex justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Vehicle'}
                </button>
              </form>
            )}

            {/* DRIVER FORM */}
            {activeTab === 'drivers' && (
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Select User (Driver Role)</label>
                  <select required value={driverForm.userId} onChange={e => setDriverForm({...driverForm, userId: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none appearance-none">
                    <option value="">-- Choose User --</option>
                    {users.filter(u => u.role === 'driver').map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Assign Vehicle (Optional)</label>
                  <select value={driverForm.vehicleId} onChange={e => setDriverForm({...driverForm, vehicleId: e.target.value})} className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none appearance-none">
                    <option value="">-- None --</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>{v.plateNumber} ({v.capacity})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-accent/20 hover:bg-accent/30 text-accent font-medium py-3 rounded-xl transition-colors border border-accent/20 mt-4 flex justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Driver Profile'}
                </button>
              </form>
            )}

          </div>

          {/* List Column */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Existing {activeTab === 'orders' ? 'Shipments' : activeTab === 'vehicles' ? 'Vehicles' : 'Drivers'}</h2>
            
            <div className="space-y-3">
              {activeTab === 'orders' && orders.length === 0 && <p className="text-gray-500 text-sm">No shipments found.</p>}
              {activeTab === 'orders' && orders.map(o => (
                <div key={o._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-200">ID: {o._id.slice(-6)} <span className="text-xs ml-2 px-2 py-0.5 bg-accent/20 text-accent rounded-full">{o.status}</span></p>
                    <p className="text-sm text-gray-400">{o.origin} ➔ {o.destination}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-300">{o.loadDetails}</p>
                    <p className="text-gray-500 capitalize">{o.servicePriority}</p>
                  </div>
                </div>
              ))}

              {activeTab === 'vehicles' && vehicles.length === 0 && <p className="text-gray-500 text-sm">No vehicles found.</p>}
              {activeTab === 'vehicles' && vehicles.map(v => (
                <div key={v._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-200">{v.plateNumber}</p>
                    <p className="text-sm text-gray-400">Area: {v.operatingArea || 'Any'}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-300">Cap: {v.capacity}</p>
                    <p className={`capitalize ${v.availability ? 'text-green-400' : 'text-red-400'}`}>{v.availability ? 'Available' : 'Unavailable'}</p>
                  </div>
                </div>
              ))}

              {activeTab === 'drivers' && drivers.length === 0 && <p className="text-gray-500 text-sm">No drivers found.</p>}
              {activeTab === 'drivers' && drivers.map(d => (
                <div key={d._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-200">{d.userId?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-400">{d.userId?.email}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-300">Vehicle: {d.vehicleId?.plateNumber || 'Unassigned'}</p>
                    <p className="text-green-400 capitalize">{d.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
