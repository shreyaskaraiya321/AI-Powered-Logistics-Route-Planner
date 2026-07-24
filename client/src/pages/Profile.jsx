import { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/auth/me');
        setProfileData(data);
      } catch (err) {
        setError('Failed to load profile data.');
        // Fallback to authUser if request fails
        if (authUser) setProfileData(authUser);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your account information and preferences.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl text-accent font-bold uppercase overflow-hidden shadow-lg shadow-black/20">
              {profileData?.name?.charAt(0) || <User className="w-16 h-16 text-gray-400" />}
            </div>
            <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/20 rounded-full text-xs font-semibold uppercase tracking-wider">
              {profileData?.role}
            </span>
          </div>

          <div className="flex-1 space-y-6 w-full">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="text-xs text-gray-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium">
                  {profileData?.name || 'N/A'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium truncate">
                  {profileData?.email || 'N/A'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <Shield className="w-3.5 h-3.5" /> Account ID
                </label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-mono text-sm truncate">
                  {profileData?._id || 'N/A'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <Calendar className="w-3.5 h-3.5" /> Member Since
                </label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300">
                  {profileData?.createdAt 
                    ? new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                    : 'Unknown'}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-white/10 flex gap-4">
              <button disabled className="px-4 py-2 bg-accent/50 text-white rounded-lg font-medium opacity-50 cursor-not-allowed">
                Edit Profile
              </button>
              <button disabled className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed">
                Change Password
              </button>
            </div>
            <p className="text-xs text-gray-500 italic">Edit capabilities are restricted in this demo.</p>

          </div>
        </div>
      </div>
    </div>
  );
}
