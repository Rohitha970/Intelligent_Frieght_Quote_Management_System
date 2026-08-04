import React, { useState, createContext, useContext, useEffect } from 'react';

import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import {
  FaBoxes,
  FaPlane,
  FaShip,
  FaTruck,
  FaTrain,
  FaMapMarkerAlt,
  FaWeightHanging,
  FaBoxOpen,
  FaCalculator,
  FaTag,
  FaPercent,
  FaGift,
  FaCheckCircle,
  FaGlobe,
  FaHeadset,
  FaPaperPlane,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaSignInAlt,
  FaUserPlus,
  FaInfoCircle,
  FaLuggageCart,
  FaUser,
  FaRupeeSign,
  FaSignOutAlt,
  FaArrowRight,
  FaShieldAlt,
  FaRocket,
  FaTimes,
  FaClock,
  FaCheckDouble,
  FaHistory,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaBars,
  FaCog,
  FaExclamationTriangle,
  FaUserShield,
  FaUsers
} from 'react-icons/fa';

const API_BASE = "http://localhost:8000/api/v1";

// Helper to simulate JWT Creation and Verification locally when backend API is unavailable
const createJWT = (payload) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 * 24 }));
  const signature = btoa("freighthub_jwt_secret_key");
  return `${header}.${body}.${signature}`;
};

const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

// Seed initial persistent user store for database validation logic
const initializeDatabase = () => {
  if (!localStorage.getItem('freight_db_users')) {
    const initialUsers = [
      { id: 1, full_name: "Admin User", username: "admin", email: "admin@freighthub.in", password: "password123", role: "admin" },
      { id: 2, full_name: "Alex Morgan", username: "alex", email: "alex@company.com", password: "password123", role: "user" }
    ];
    localStorage.setItem('freight_db_users', JSON.stringify(initialUsers));
  }
};

initializeDatabase();

const AuthContext = createContext();

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('freight_token'));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('freight_token');
    return savedToken ? parseJWT(savedToken) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loginSession = (jwtToken) => {
    const decoded = parseJWT(jwtToken);
    localStorage.setItem('freight_token', jwtToken);
    setToken(jwtToken);
    setUser(decoded);
    setShowAuthModal(false);
  };

  const logoutSession = () => {
    localStorage.removeItem('freight_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginSession, logoutSession, showAuthModal, setShowAuthModal }}>
      <BrowserRouter>
        <Routes>
          {/* Admin Panel Secured Route */}
          <Route
            path="/admin/*"
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Standard User Platform Routes */}
          <Route
            path="/*"
            element={
              user && user.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <MainLayout />
              )
            }
          />
        </Routes>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

// ==========================================
// BRAND LOGO COMPONENT
// ==========================================
function BrandLogo() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="relative p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
        <FaRocket className="text-xl transform -rotate-12" />
        <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-400 text-slate-900 rounded-full text-[9px]">
          <FaBoxes />
        </span>
      </div>
      <div>
        <span className="text-xl font-black text-slate-900 block leading-none tracking-tight">
          FREIGHT<span className="text-blue-600">HUB</span>
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mt-0.5">
          Smart Logistics Engine
        </span>
      </div>
    </Link>
  );
}

// ==========================================
// MAIN PLATFORM LAYOUT
// ==========================================
function MainLayout() {
  const { user, logoutSession, setShowAuthModal } = useContext(AuthContext);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Calculator & Services', path: '/calculator' },
    { name: 'Offers', path: '/offers' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased text-base">
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold transition-all duration-200 relative py-1 ${
                    active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-900 shadow-sm">
                  <FaUser className="text-blue-600" />
                  <span>@{user.username || user.name}</span>
                </div>
                <button
                  onClick={logoutSession}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all bg-white shadow-sm"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                <FaSignInAlt /> Login / Register
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 px-6 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <FaRocket className="text-blue-500" /> FreightHub Engine
          </div>
          <p>&copy; {new Date().getFullYear()} FreightHub Solutions. All Rights Reserved.</p>
          <div className="flex gap-6 text-xs">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// JWT AUTH MODAL (WITH DATABASE VALIDATION & REDIRECT)
// ==========================================
function AuthModal({ onClose }) {
  const [role, setRole] = useState('user');
  const [isRegister, setIsRegister] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { loginSession } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Backend REST API attempt
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { full_name: fullName, username, email, password, role }
        : { identifier, password, role };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        loginSession(data.access_token);
        if (role === 'admin') navigate('/admin');
        else navigate('/calculator');
        return;
      }
    } catch (err) {
      // Fallback to local database authentication
    }

    // 2. Client-side Local Database Validation
    const usersDb = JSON.parse(localStorage.getItem('freight_db_users') || "[]");

    if (isRegister) {
      const existingUser = usersDb.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
      );

      if (existingUser) {
        setErrorMsg('User with this email or username already exists. Please login instead.');
        return;
      }

      const newUser = {
        id: Date.now(),
        full_name: fullName,
        username,
        email,
        password,
        role
      };

      usersDb.push(newUser);
      localStorage.setItem('freight_db_users', JSON.stringify(usersDb));

      const jwtToken = createJWT({
        id: newUser.id,
        name: newUser.full_name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      });

      setSuccessMsg("Account created! Redirecting to freight calculator...");
      setTimeout(() => {
        loginSession(jwtToken);
        if (newUser.role === 'admin') navigate('/admin');
        else navigate('/calculator');
      }, 1000);

    } else {
      // LOGIN VALIDATION AGAINST DATABASE
      const match = usersDb.find(
        (u) =>
          (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) &&
          u.password === password &&
          u.role === role
      );

      if (!match) {
        setErrorMsg(`Invalid ${role} credentials. If you don't have an account, please register first.`);
        return;
      }

      const jwtToken = createJWT({
        id: match.id,
        name: match.full_name,
        username: match.username,
        email: match.email,
        role: match.role
      });

      setSuccessMsg("Authenticated! Redirecting to calculator...");
      setTimeout(() => {
        loginSession(jwtToken);
        if (match.role === 'admin') navigate('/admin');
        else navigate('/calculator');
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <FaTimes />
        </button>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {isRegister ? 'Register your account to unlock instant calculation' : 'Sign in using your validated credentials'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                role === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Customer User
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                role === 'admin' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Administrator
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
              <FaExclamationTriangle /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2">
              <FaCheckCircle /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {isRegister ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600 text-sm font-semibold"
                    placeholder="Alex Morgan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600 text-sm font-semibold"
                    placeholder="alex_morgan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600 text-sm font-semibold"
                    placeholder="alex@company.com"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email or Username</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600 text-sm font-semibold"
                  placeholder="Enter email or username (e.g. alex)"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600 text-sm font-semibold"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                role === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRegister ? <FaUserPlus /> : <FaSignInAlt />}
              <span>{isRegister ? 'Register Account' : `Sign In as ${role === 'admin' ? 'Admin' : 'User'}`}</span>
            </button>
          </form>

          <div className="text-center border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold"
            >
              {isRegister ? 'Already registered? Click to Sign In' : "Don't have an account yet? Register here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CALCULATOR PAGE VIEW
// ==========================================
function CalculatorPage() {
  const { user, setShowAuthModal } = useContext(AuthContext);
  const [quoteData, setQuoteData] = useState({
    origin: 'Chennai, India (MAA)',
    destination: 'Mumbai, India (BOM)',
    cargoType: 'electronics',
    shipmentMode: 'air',
    weight: 450,
  });

  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [bookedStatus, setBookedStatus] = useState(false);

  const routeDistances = {
    'Chennai, India (MAA)': {
      'Mumbai, India (BOM)': 1030,
      'New York, USA (JFK)': 13500,
      'London, UK (LHR)': 8200,
    },
    'Mumbai, India (BOM)': {
      'Chennai, India (MAA)': 1030,
      'New York, USA (JFK)': 12500,
    }
  };

  const currentDistance = routeDistances[quoteData.origin]?.[quoteData.destination] || 1200;

  const handleGenerateQuote = (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setBookedStatus(false);
    const modeRates = { air: 180, ocean: 45, road: 70, rail: 50 };
    const cargoMultipliers = { general: 1.0, electronics: 1.3, hazardous: 1.75, perishable: 1.4 };

    const rawCost = (quoteData.weight * modeRates[quoteData.shipmentMode]) * cargoMultipliers[quoteData.cargoType] + (currentDistance * 4.5);
    const fuelSurcharge = rawCost * 0.12;
    const customs = 2500;
    const total = rawCost + fuelSurcharge + customs;

    setGeneratedQuote({
      rawTotalNum: total,
      baseCost: Math.round(rawCost).toLocaleString('en-IN'),
      fuelSurcharge: Math.round(fuelSurcharge).toLocaleString('en-IN'),
      customs: customs.toLocaleString('en-IN'),
      finalTotal: Math.round(total).toLocaleString('en-IN'),
      transitDays: quoteData.shipmentMode === 'air' ? '1-3 Days' : '5-7 Days'
    });
  };

  const handleBookShipment = async () => {
    setBookedStatus(true);
  };

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-1">
        <span className="text-blue-600 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
          <FaLuggageCart /> SERVICES
        </span>
        <h2 className="text-3xl font-black text-slate-900">
          Calculate Freight & Route Distance
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleGenerateQuote} className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700 mb-2">
                <FaMapMarkerAlt className="text-red-500" /> ORIGIN HUB
              </label>
              <select
                value={quoteData.origin}
                onChange={(e) => setQuoteData({ ...quoteData, origin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-base font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option>Chennai, India (MAA)</option>
                <option>Mumbai, India (BOM)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700 mb-2">
                <FaMapMarkerAlt className="text-emerald-600" /> DESTINATION HUB
              </label>
              <select
                value={quoteData.destination}
                onChange={(e) => setQuoteData({ ...quoteData, destination: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-base font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option>Mumbai, India (BOM)</option>
                <option>Chennai, India (MAA)</option>
                <option>New York, USA (JFK)</option>
                <option>London, UK (LHR)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700 mb-2">
                <FaBoxOpen className="text-amber-500" /> CARGO TYPE
              </label>
              <select
                value={quoteData.cargoType}
                onChange={(e) => setQuoteData({ ...quoteData, cargoType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-base font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="general">General Cargo</option>
                <option value="electronics">Electronics</option>
                <option value="perishable">Perishable Goods</option>
                <option value="hazardous">Hazardous Materials</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700 mb-2">
                <FaWeightHanging className="text-blue-600" /> CARGO WEIGHT (KG)
              </label>
              <input
                type="number"
                min="1"
                value={quoteData.weight}
                onChange={(e) => setQuoteData({ ...quoteData, weight: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-base font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
              TRANSPORT MODE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'air', label: 'Air', icon: FaPlane },
                { id: 'ocean', label: 'Ocean', icon: FaShip },
                { id: 'road', label: 'Road', icon: FaTruck },
                { id: 'rail', label: 'Rail', icon: FaTrain }
              ].map((m) => {
                const Icon = m.icon;
                const selected = quoteData.shipmentMode === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setQuoteData({ ...quoteData, shipmentMode: m.id })}
                    className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-base ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <span className="text-blue-900 font-bold text-base flex items-center gap-2">
              <FaGlobe className="text-blue-600" /> Calculated Distance:
            </span>
            <span className="font-black text-blue-900 text-xl">
              {currentDistance.toLocaleString('en-IN')} KM
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-base font-black transition-all shadow-md flex items-center justify-center gap-2"
          >
            <FaCalculator /> Calculate Freight (₹)
          </button>
        </form>

        <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-3 mb-4">
              Cost Breakdown (INR)
            </h3>

            {generatedQuote ? (
              <div className="space-y-4 text-base">
                <div className="flex justify-between text-slate-600">
                  <span>Base Freight Rate</span>
                  <span className="font-bold text-slate-900">₹{generatedQuote.baseCost}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fuel Surcharge</span>
                  <span className="font-bold text-slate-900">₹{generatedQuote.fuelSurcharge}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Customs Handling</span>
                  <span className="font-bold text-slate-900">₹{generatedQuote.customs}</span>
                </div>

                <div className="pt-4 border-t border-slate-300 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-lg">Total Quote</span>
                  <span className="text-3xl font-black text-blue-600">₹{generatedQuote.finalTotal}</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 mt-6">
                  <p className="text-xs text-slate-500 font-bold uppercase">Estimated Transit</p>
                  <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-600" /> {generatedQuote.transitDays}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-base space-y-3">
                <FaLuggageCart className="text-5xl mx-auto text-slate-300 animate-pulse" />
                <p>Click <strong>Calculate Freight</strong> to generate tariff details.</p>
              </div>
            )}
          </div>

          {generatedQuote && (
            <div className="mt-6 space-y-3">
              {bookedStatus ? (
                <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-extrabold flex items-center gap-2 justify-center">
                  <FaCheckDouble className="text-xl" /> Shipment Dispatched to Operations Panel!
                </div>
              ) : (
                <button
                  onClick={handleBookShipment}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-extrabold transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <FaCheckCircle /> Confirm & Book Shipment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// HOME PAGE VIEW
// ==========================================
function HomePage() {
  const { setShowAuthModal, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleStartCalc = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate('/calculator');
    }
  };

  return (
    <div className="space-y-16 py-4">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex justify-start">
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
              alt="Logistics Warehouse"
              className="w-full h-80 object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="p-6 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent text-white space-y-1">
              <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                ⚡ REAL-TIME ENGINE
              </span>
              <p className="text-2xl font-black">Global Freight Rates</p>
              <p className="text-sm text-slate-300">Multi-Modal Distance & Tariff Calculations</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider inline-block">
            🚀 Freight Automation Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            Freight Rate & Distance Calculator
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed font-normal">
            Calculate accurate freight tariffs in <strong className="text-slate-900 font-bold">Indian Rupee (₹)</strong> based on actual route distances, transport modes, and cargo weights.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleStartCalc}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-base font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <FaCalculator /> Calculate Freight Quote
            </button>
            <Link
              to="/about"
              className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-base font-bold transition-all border border-slate-300 flex items-center gap-2 shadow-sm"
            >
              Learn More <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 space-y-8 border-t border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-blue-600 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
            <FaInfoCircle /> ABOUT THE SYSTEM
          </span>
          <h2 className="text-3xl font-black text-slate-900">
            Trusted Freight Calculation Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-blue-400 transition-all">
            <FaBoxes className="text-3xl text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Tariff Engine</h3>
            <p className="text-sm text-slate-600">Calculates shipping rates dynamically based on cargo weight and mode.</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-blue-400 transition-all">
            <FaGlobe className="text-3xl text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Distance Matrix</h3>
            <p className="text-sm text-slate-600">Automatic route length calculation between major hubs.</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-emerald-400 transition-all">
            <FaRupeeSign className="text-3xl text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-900">INR Standard</h3>
            <p className="text-sm text-slate-600">All cost outputs computed in Indian Rupee (₹) with tax breakdowns.</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-purple-400 transition-all">
            <FaCheckCircle className="text-3xl text-purple-600" />
            <h3 className="text-xl font-bold text-slate-900">Instant Quotes</h3>
            <p className="text-sm text-slate-600">Immediate itemized cost output without delays.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// ABOUT PAGE VIEW
// ==========================================
function AboutPage() {
  return (
    <div className="space-y-10 py-2">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 rounded-3xl overflow-hidden shadow-xl border border-slate-200 p-8 md:p-12 text-white grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider inline-block">
            Smart & Reliable Freight Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-white">
            Make your freight calculations simple with FreightHub
          </h1>
          <p className="text-base text-emerald-50 font-medium leading-relaxed">
            Choose and calculate optimal shipping rates across air, ocean, road, and rail with transparent pricing, instant distance matrices, and zero hidden charges.
          </p>
          <div className="pt-2">
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-sm transition-all shadow-lg"
            >
              Calculate Freight Now <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="md:col-span-5 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80"
            alt="Logistics Fleet"
            className="rounded-2xl shadow-2xl border-4 border-white/30 object-cover max-h-64 w-full"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900">Our story & mission</h2>
          <div className="space-y-3 text-slate-700 text-base leading-relaxed font-normal">
            <p>
              FreightHub began with a clear mission: connect commercial shippers and enterprise supply teams with automated, accurate freight tariff calculations. Today we deliver a real-time computation system covering global routes, cargo classes, and multi-modal transit options — all with transparent pricing in Indian Rupee (₹).
            </p>
            <p>
              We prioritize transparency, route distance accuracy, and clear cost breakdowns to make logistics simple, affordable, and dependable.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-xl font-extrabold text-slate-900">What makes us different</h3>
          <ul className="space-y-3 text-base font-semibold text-slate-700">
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Hub-to-hub real-time distance matrix computation</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Multi-modal carrier flexibility (Air, Ocean, Road, Rail)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Clear fuel surcharge & customs handling breakdowns in ₹</span>
            </li>
          </ul>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/calculator"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold transition-all shadow-sm"
            >
              Explore Calculator
            </Link>
            <Link
              to="/"
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-extrabold transition-all border border-slate-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// OFFERS PAGE VIEW
// ==========================================
function OffersPage() {
  const offers = [
    {
      title: 'Air Freight Express Promo',
      code: 'AIR2026',
      discount: '15% OFF',
      desc: 'Get 15% discount on air shipments across domestic hubs.',
      icon: FaPlane,
      img: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Ocean Container Discount',
      code: 'OCEAN20',
      discount: '20% OFF',
      desc: '20% off full container load ocean shipments.',
      icon: FaShip,
      img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Enterprise Cargo Saver',
      code: 'ENTERPRISE10',
      discount: '10% OFF',
      desc: 'Special rate reduction applied to high-volume corporate accounts.',
      icon: FaGift,
      img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-1">
        <span className="text-amber-600 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
          <FaPercent /> PROMOTIONS
        </span>
        <h2 className="text-3xl font-black text-slate-900">Active Freight Discounts</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const Icon = offer.icon;
          return (
            <div key={offer.code} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <img src={offer.img} alt={offer.title} className="w-full h-44 object-cover" />
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <Icon className="text-3xl text-blue-600" />
                    <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      {offer.discount}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{offer.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{offer.desc}</p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-semibold">Promo Code:</span>
                  <span className="font-mono font-bold text-blue-600 text-base bg-slate-100 px-2 py-0.5 rounded">{offer.code}</span>
                </div>
                <Link
                  to="/calculator"
                  className="w-full py-3 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <FaTag /> Apply in Calculator
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// CONTACT PAGE VIEW
// ==========================================
function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-1">
        <span className="text-blue-600 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
          <FaHeadset /> SUPPORT
        </span>
        <h2 className="text-3xl font-black text-slate-900">Get In Touch With Support</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-3">Logistics Desk</h3>
          <div className="space-y-4 text-base">
            <div className="flex items-start gap-3">
              <FaBuilding className="text-blue-600 text-xl mt-1" />
              <div>
                <strong className="block text-slate-900">Headquarters</strong>
                <span className="text-slate-600 text-sm">Chennai, Tamil Nadu, India</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaPhone className="text-emerald-600 text-xl mt-1" />
              <div>
                <strong className="block text-slate-900">Support Line</strong>
                <span className="text-slate-600 text-sm">+91 1800 123 4567</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaEnvelope className="text-purple-600 text-xl mt-1" />
              <div>
                <strong className="block text-slate-900">Email Inquiry</strong>
                <span className="text-slate-600 text-sm">support@freighthub.in</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-3xl space-y-5 shadow-sm">
          {submitted && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
              <FaCheckCircle /> Message sent! Our team will respond shortly.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base text-slate-800 focus:outline-none focus:border-blue-600"
                placeholder="Alex"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base text-slate-800 focus:outline-none focus:border-blue-600"
                placeholder="alex@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Message</label>
            <textarea
              rows="4"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base text-slate-800 focus:outline-none focus:border-blue-600"
              placeholder="Ask about enterprise tariffs or custom route setups..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-base font-black transition-all flex items-center gap-2 shadow-md"
          >
            <FaPaperPlane /> Send Support Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}

