import React, { useState } from 'react';
import { Mic, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (!success) {
      setError('Invalid credentials or inactive account');
    }
    
    setLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@hotel.com', role: 'Administrator', password: 'admin123' },
    { email: 'electrician@hotel.com', role: 'Electrician', password: 'admin123' },
    { email: 'plumber@hotel.com', role: 'Plumber', password: 'admin123' },
    { email: 'waiter@hotel.com', role: 'Waiter', password: 'admin123' },
    { email: 'housekeeping@hotel.com', role: 'Housekeeping', password: 'admin123' },
    { email: 'maintenance@hotel.com', role: 'Maintenance', password: 'admin123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mic className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ConciAI Staff Portal</h1>
          <p className="text-blue-100">Hotel Voice Assistant Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Demo Accounts</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {demoAccounts.map((account) => (
              <div
                key={account.email}
                className="flex justify-between items-center p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                <div>
                  <div className="text-white font-medium">{account.role}</div>
                  <div className="text-blue-100 text-xs">{account.email}</div>
                </div>
                <div className="text-blue-200 text-xs">Click to use</div>
              </div>
            ))}
          </div>
          <p className="text-blue-100 text-xs mt-3">
            Password for all demo accounts: <span className="font-mono">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}