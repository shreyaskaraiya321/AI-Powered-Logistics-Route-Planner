import { Link } from 'react-router-dom';
import { Map } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-primary-900 text-gray-100 font-sans p-4">
      <div className="glass-panel p-10 rounded-3xl max-w-lg w-full text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] bg-accent/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,240,255,0.1)] relative z-10">
          <Map className="w-10 h-10 text-accent" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-2 relative z-10">404</h1>
        <h2 className="text-2xl font-medium text-gray-200 mb-4 relative z-10">Destination Not Found</h2>
        
        <p className="text-gray-400 mb-8 relative z-10">
          Looks like this route doesn't exist on our map. Let's get you back to the main terminal.
        </p>
        
        <Link
          to="/"
          className="inline-block bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium transition-colors relative z-10 shadow-lg border border-white/5"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
