import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Loader2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const { register, error, loading, user, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    setError(null);
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary-900 font-sans p-4">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded bg-accent/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <UserPlus className="w-6 h-6 text-accent" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2">Create Account</h2>
        <p className="text-gray-400 text-center mb-6">Join Logistics Route Planner</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all appearance-none"
            >
              <option value="customer" className="bg-primary-800">Customer</option>
              <option value="driver" className="bg-primary-800">Driver</option>
              <option value="dispatcher" className="bg-primary-800">Dispatcher</option>
              <option value="admin" className="bg-primary-800">Admin</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-primary-900 font-semibold rounded-xl px-4 py-3 mt-6 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-accent hover:underline">Log in</Link>
        </p>
      </div>
      
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
