import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { 
  Sparkles, 
  History, 
  Apple, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Settings,
  Mail,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, token, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update form fields when modal opens
  useEffect(() => {
    if (user && profileModalOpen) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileError('');
      setProfileSuccess(false);
    }
  }, [user, profileModalOpen]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      const updatedUser = await updateProfile({ name: profileName, email: profileEmail });
      setUser(updatedUser);
      localStorage.setItem('acneguard_user', JSON.stringify(updatedUser));
      setProfileSuccess(true);
      setTimeout(() => setProfileModalOpen(false), 1500);
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/assessment', label: 'Skin Scan', icon: Sparkles, auth: true },
    { to: '/diet-check', label: 'Diet Check', icon: Apple, auth: true },
    { to: '/history', label: 'History', icon: History, auth: true },
  ];

  const activeClass = (path) => 
    location.pathname === path 
      ? 'bg-teal-50 text-teal-700 font-bold border-teal-500' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent';

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-200 group-hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-800">
                  AcneGuard<span className="text-teal-600 font-black">AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                if (link.auth && !token) return null;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-b-2 transition-all duration-200 ${
                      location.pathname === link.to 
                        ? 'text-teal-600 border-teal-500 bg-teal-50/40' 
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth / User Dropdown */}
            <div className="hidden md:flex items-center gap-4">
              {token && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <div className="w-8 h-8 bg-teal-100 text-teal-700 font-bold rounded-lg flex items-center justify-center text-sm uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{user.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-50 origin-top-right animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => { setDropdownOpen(false); setProfileModalOpen(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-semibold"
                      >
                        <Settings className="w-4 h-4" />
                        My Profile
                      </button>

                      <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl shadow-md shadow-teal-200 transition-all hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white py-3 px-4 space-y-2 animate-in slide-in-from-top duration-300">
            {token && user && (
              <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 mb-2">
                <div className="w-10 h-10 bg-teal-100 text-teal-700 font-extrabold rounded-xl flex items-center justify-center uppercase text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
            
            {navLinks.map((link) => {
              if (link.auth && !token) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold border-l-4 transition-all ${activeClass(link.to)}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {token ? (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => { setMobileMenuOpen(false); setProfileModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                >
                  <Settings className="w-4 h-4" />
                  Profile Settings
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-sm font-bold text-slate-600 bg-slate-50 rounded-2xl hover:bg-slate-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-sm font-bold text-white bg-teal-600 rounded-2xl hover:bg-teal-500 shadow-md shadow-teal-100"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Profile Management Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 transform scale-95 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-extrabold text-lg text-slate-900">Profile Management</h2>
              <button 
                onClick={() => setProfileModalOpen(false)} 
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              {profileError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm font-medium">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
