import React, { useState, useMemo } from "react";
import AdminDashboard from "./components/AdminDashboard";

const API_BASE = "https://intelligent-frieght-quote-generator-3huz.onrender.com/";

const INITIAL_SERVICES_FORM = {
  // Step 1: Route
  originPort: "INNSA — Nhava Sheva, Mumbai, India",
  destinationPort: "AEJEA — Jebel Ali, Dubai, UAE",
  pickupAddress: "",
  deliveryAddress: "",
  readyDate: "2026-08-12",
  requiredDeliveryDate: "",

  // Step 2: Service Type
  mode: "ocean", // 'ocean', 'air', 'ground', 'express'
  loadType: "FCL", // 'FCL', 'LCL'
  incoterm: "FOB",

  // Step 3: Shipment Details
  items: [
    {
      id: 1,
      packageType: "Container",
      containerType: "40HC",
      containerCount: 2,
      grossWeightKg: 18400,
      commodityDescription: "Cotton textile rolls, unbleached",
      hsCode: "5208.11",
    },
  ],

  // Step 4: Additional Details
  declaredValue: "0.00",
  currency: "INR",
  specialInstructions: "",
  isFragile: false,
  isHazardous: true,
  isTempControlled: false,
  addInsurance: false,
  hazardousDetails: {
    unNumber: "",
    imoClass: "",
    msdsFile: null,
  },

  // Step 5: Contact Details
  fullName: "",
  company: "",
  email: "",
  country: "India",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [activeTab, setActiveTab] = useState("home");
  const [servicesSubTab, setServicesSubTab] = useState("calculator");

  // Track applied promo codes in Special Offers
  const [appliedOffers, setAppliedOffers] = useState({});

  // Auth State
  const [isRegistering, setIsRegistering] = useState(false);
  const [authRole, setAuthRole] = useState("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
    admin_passcode: ""
  });
  const [authError, setAuthError] = useState("");

  // Services State
  const [servicesForm, setServicesForm] = useState(INITIAL_SERVICES_FORM);
  const [calculatedQuote, setCalculatedQuote] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState([
    {
      id: "QT-2026-00934",
      customer: "Sharma Textiles",
      origin: "INNSA (Mumbai)",
      destination: "AEJEA (Dubai)",
      mode: "Ocean FCL",
      basis: "2 × 40HC",
      transit: "6–10 d",
      total: 384500,
      status: "Draft",
      created: "2 min ago"
    },
    {
      id: "QT-2026-00933",
      customer: "Nordic Imports AB",
      origin: "INNSA (Mumbai)",
      destination: "NLRTM (Rotterdam)",
      mode: "Ocean FCL",
      basis: "1 × 20GP",
      transit: "24–28 d",
      total: 215800,
      status: "Issued",
      created: "1 hour ago"
    },
    {
      id: "QT-2026-00932",
      customer: "Gulf Machinery LLC",
      origin: "BOM (Mumbai)",
      destination: "DXB (Dubai)",
      mode: "Air Freight",
      basis: "250 kg ch.",
      transit: "5–7 d",
      total: 64300,
      status: "Issued",
      created: "3 hours ago"
    }
  ]);
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  // Dynamic Live Estimate Logic
  const estimate = useMemo(() => {
    let basePrice = 0;
    let chargeBasis = "Flat Rate";
    let containerSummary = "0 Containers";
    let totalWeight = 0;

    servicesForm.items.forEach((item) => {
      totalWeight += Number(item.grossWeightKg) || 0;
    });

    if (servicesForm.mode === "ocean") {
      if (servicesForm.loadType === "FCL") {
        const totalContainers = servicesForm.items.reduce(
          (acc, item) => acc + (Number(item.containerCount) || 0),
          0
        );
        chargeBasis = "Per container — FCL";
        containerSummary = `${totalContainers} × 40HC`;
        basePrice = totalContainers * 192250;
      } else {
        chargeBasis = "Per CBM / Ton — LCL";
        basePrice = 88400;
      }
    } else if (servicesForm.mode === "air" || servicesForm.mode === "express") {
      chargeBasis = "Per Chargeable KG";
      basePrice = totalWeight * 250;
    } else if (servicesForm.mode === "ground") {
      chargeBasis = "Per Km / Truckload";
      basePrice = totalWeight * 45;
    }

    return {
      chargeBasis,
      containerSummary,
      totalWeight: totalWeight.toLocaleString() + " kg",
      seaDistance: "1,205 nm",
      estimatedTransit: "6–10 d",
      estArrival: "22 Aug",
      routeOptionsCount: 3,
      numericTotal: basePrice,
      estimatedTotal: basePrice > 0 ? `₹ ${basePrice.toLocaleString("en-IN")}` : "₹ 0",
    };
  }, [servicesForm]);

  const handleServicesFormChange = (field, value) => {
    setServicesForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...servicesForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setServicesForm((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setServicesForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          packageType: "Container",
          containerType: "40HC",
          containerCount: 1,
          grossWeightKg: 0,
          commodityDescription: "",
          hsCode: "",
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setServicesForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegistering ? `${API_BASE}/register` : `${API_BASE}/login`;

    const payload = isRegistering
      ? {
          email: formData.email,
          password: formData.password,
          username: formData.username || formData.email.split("@")[0],
          full_name: formData.full_name || formData.username || formData.email.split("@")[0],
          role: authRole,
          admin_passcode: formData.admin_passcode
        }
      : {
          email: formData.email,
          password: formData.password
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
      if (!data.token) throw new Error("No token returned from server.");

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user || { email: formData.email, role: authRole });

      if (data.user?.role === "admin" || authRole === "admin") {
        setActiveTab("admin_dashboard");
      } else {
        setActiveTab("home");
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setActiveTab("home");
  };

  const handleFreightCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);

    const firstItem = servicesForm.items[0] || {};
    const totalWeight = servicesForm.items.reduce(
    (acc, item) => acc + (Number(item.grossWeightKg) || 0), 0
  );
    const apiPayload = {
      weight: totalWeight || 100,
    distance: 1205, 
      origin: servicesForm.originPort,
      destination: servicesForm.destinationPort,
      cargo_type: firstItem.commodityDescription || "General Cargo",
      weight_kg: Number(firstItem.grossWeightKg) || 100,
      mode: servicesForm.mode,
      additional_details: servicesForm.specialInstructions,
      incoterm: servicesForm.incoterm,
      load_type: servicesForm.loadType,
      items: servicesForm.items,
      hazardous_details: servicesForm.isHazardous ? servicesForm.hazardousDetails : null,
      contact: {
        full_name: servicesForm.fullName,
        company: servicesForm.company,
        email: servicesForm.email,
        country: servicesForm.country
      }
    };

    try {
      const res = await fetch(`${API_BASE}/calculate-freight/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiPayload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to calculate quote");

      setCalculatedQuote(data);
      setQuoteHistory((prev) => [
        {
          id: data.quote_id || `QT-${Math.floor(100000 + Math.random() * 900000)}`,
          customer: servicesForm.company || servicesForm.fullName || "Direct Shipper",
          origin: servicesForm.originPort,
          destination: servicesForm.destinationPort,
          mode: servicesForm.mode,
          basis: estimate.containerSummary,
          transit: estimate.estimatedTransit,
          total: data.breakdown?.total_price || estimate.numericTotal || 192250,
          status: "Issued",
          created: "Just now"
        },
        ...prev
      ]);
      alert("Quotation generated successfully! Detailed breakdown updated.");
    } catch (err) {
      alert(err.message);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleTrackShipment = async (e) => {
    e.preventDefault();
    if (!trackingId) return;
    try {
      const res = await fetch(`${API_BASE}/track/${trackingId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Shipment not found");
      setTrackingResult(data);
    } catch (err) {
      setTrackingResult({
        tracking_id: trackingId,
        status: "In Transit - Out for Hub Delivery",
        current_location: "Bengaluru Hub",
        estimated_delivery: "Tomorrow, 4:00 PM",
        carrier: "FreightHub Express"
      });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your support inquiry has been sent.");
    setContactForm({ name: "", email: "", message: "" });
  };

  const toggleApplyOffer = (code) => {
    setAppliedOffers((prev) => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Check if current logged-in role is admin
  const isAdminUser = user?.role === "admin" || authRole === "admin";

  // --- LOGIN / REGISTER SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-2 sm:p-4 font-sans relative overflow-hidden">
        {/* Dynamic Background Glow Balls */}
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>

        <div className="max-w-3xl w-full bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.2)] overflow-hidden grid md:grid-cols-5 border border-blue-400/30 transition-all duration-300">
          
          <div className="md:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-4 sm:p-6 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-28 h-28 bg-cyan-400/20 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_10px_rgba(255,255,255,0.4)] border border-white/30 animate-bounce">🚀</div>
                <div>
                  <h1 className="font-black text-lg sm:text-xl tracking-wider uppercase drop-shadow-md">FREIGHT HUB</h1>
                  <p className="text-[9px] sm:text-[10px] text-cyan-200 tracking-widest uppercase font-extrabold">Smart Logistics Portal</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-lg sm:rounded-xl mt-3 sm:mt-4 text-xs leading-relaxed text-blue-50 shadow-md">
                Real-time freight rate estimates, distance matrix queries, automated quotations, and shipment tracking.
              </div>
            </div>

            <p className="text-[10px] text-cyan-200/80 font-bold tracking-wide relative z-10 mt-4 sm:mt-6">© FreightHub Enterprise Gateway 2026</p>
          </div>

          <div className="md:col-span-3 p-4 sm:p-6 flex flex-col justify-center bg-white">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">Welcome Back</h2>
            <p className="text-xs font-semibold text-slate-600 mb-4">
              {isRegistering ? "Create your account to access the platform." : "Enter your Email to access your dashboard."}
            </p>

            {authError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg font-bold text-center shadow-sm">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg justify-center text-xs font-black text-slate-800 border border-slate-200">
                <label className="flex-1 flex items-center justify-center gap-1 cursor-pointer py-1.5 px-2 rounded transition-all duration-200 hover:bg-white has-[:checked]:bg-blue-600 has-[:checked]:text-white shadow-sm">
                  <input type="radio" name="role" checked={authRole === "user"} onChange={() => setAuthRole("user")} className="hidden" />
                  👤 User Portal
                </label>
                <label className="flex-1 flex items-center justify-center gap-1 cursor-pointer py-1.5 px-2 rounded transition-all duration-200 hover:bg-white has-[:checked]:bg-blue-600 has-[:checked]:text-white shadow-sm">
                  <input type="radio" name="role" checked={authRole === "admin"} onChange={() => setAuthRole("admin")} className="hidden" />
                  🛡️ Admin Control
                </label>
              </div>

              {isRegistering && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.full_name}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="johndoe"
                      value={formData.username}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  {authRole === "admin" && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Admin Passcode</label>
                      <input
                        type="password"
                        required
                        placeholder="freighthub-admin-123"
                        value={formData.admin_passcode}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                        onChange={(e) => setFormData({ ...formData, admin_passcode: e.target.value })}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Email or Username</label>
                <input
                  type="text"
                  required
                  placeholder="Enter email or username"
                  value={formData.email}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black py-2.5 rounded-lg transition-all shadow-md text-xs flex items-center justify-center gap-1.5 tracking-wide uppercase mt-2 active:scale-[0.99]"
              >
                ➔ {isRegistering ? "Register Account & Access" : "Sign In Now"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); }}
                className="text-xs text-blue-700 hover:text-blue-900 font-extrabold hover:underline transition-all"
              >
                {isRegistering ? "Already have an account? Sign In" : "Need an account? Register with email"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP PORTAL ---
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP HEADER NAVBAR: Only rendered for regular users */}
      {!isAdminUser && (
        <header className="bg-slate-900/95 text-white backdrop-blur-md border-b border-blue-500/30 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 h-12 sm:h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => !isAdminUser && setActiveTab("home")}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm group-hover:scale-105 transition-transform duration-300 border border-blue-400/40">🚀</div>
              <div>
                <span className="font-black text-base sm:text-lg tracking-tight block leading-none text-white drop-shadow">FREIGHTHUB</span>
                <span className="text-[8px] sm:text-[9px] font-black text-blue-400 tracking-widest block mt-0.5 uppercase">SMART LOGISTICS ENGINE</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-4 text-xs font-black">
              <button onClick={() => setActiveTab("home")} className={`transition-all py-1 px-2.5 rounded-md ${activeTab === "home" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>Home</button>
              <button onClick={() => setActiveTab("about")} className={`transition-all py-1 px-2.5 rounded-md ${activeTab === "about" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>About</button>
              <button onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }} className={`transition-all py-1 px-2.5 rounded-md ${activeTab === "services" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>Calculation</button>
              <button onClick={() => setActiveTab("offers")} className={`transition-all py-1 px-2.5 rounded-md ${activeTab === "offers" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>Special Offers</button>
              <button onClick={() => setActiveTab("contact")} className={`transition-all py-1 px-2.5 rounded-md ${activeTab === "contact" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>Contact</button>
            </nav>

            {/* User / Admin Header Badge */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-950/80 border border-blue-500/40 text-blue-200 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-inner">
                <span className="text-xs">👤</span>
                <span className="max-w-[80px] sm:max-w-none truncate">@{user?.email || "user@freighthub.in"}</span>
              </div>
              <button onClick={handleLogout} className="text-xs bg-red-600/90 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg border border-red-400 font-extrabold flex items-center gap-1 transition-all shadow-sm active:scale-95">
                🚪 <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="lg:hidden flex justify-around border-t border-slate-800 py-1 px-1 bg-slate-950/90 text-[10px] font-bold overflow-x-auto">
            <button onClick={() => setActiveTab("home")} className={`px-2 py-0.5 rounded ${activeTab === "home" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Home</button>
            <button onClick={() => setActiveTab("about")} className={`px-2 py-0.5 rounded ${activeTab === "about" ? "bg-blue-600 text-white" : "text-slate-300"}`}>About</button>
            <button onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }} className={`px-2 py-0.5 rounded ${activeTab === "services" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Calculate</button>
            <button onClick={() => setActiveTab("offers")} className={`px-2 py-0.5 rounded ${activeTab === "offers" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Offers</button>
            <button onClick={() => setActiveTab("contact")} className={`px-2 py-0.5 rounded ${activeTab === "contact" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Contact</button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 py-3 sm:py-5">

        {/* ADMIN DASHBOARD: Displayed exclusively for Admin logins */}
        {isAdminUser ? (
          <AdminDashboard token={token} handleLogout={handleLogout} userEmail={user?.email || "admin@freighthub.in"} />
        ) : (
          <>
            {/* 1. HOME TAB */}
            {activeTab === "home" && (
              <div className="space-y-5 sm:space-y-8">
                {/* Hero Card Section */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm grid md:grid-cols-2 gap-4 sm:gap-6 items-center transition-all hover:shadow-md">
                  <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-sm group border border-slate-300">
                    <img 
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" 
                      alt="Warehouse & Cargo Logistics" 
                      className="w-full h-36 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-3 sm:p-4 text-white">
                      <p className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-cyan-400 drop-shadow">⚡ REAL-TIME ENGINE</p>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mt-0.5">Global Freight Rates</h3>
                      <p className="text-[10px] sm:text-xs text-slate-300 font-bold mt-0.5">Multi-Modal Distance & Tariff Calculations</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase inline-block shadow-sm">
                      📌 FREIGHT AUTOMATION PLATFORM
                    </span>
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                      Freight Rate & Distance Calculator
                    </h1>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      Calculate accurate freight tariffs in <strong className="text-slate-900 font-extrabold bg-amber-100 px-1 rounded">Indian Rupee (₹)</strong> based on actual route distances, transport modes, and cargo weights.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                      <button 
                        onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black px-4 py-2.5 rounded-lg sm:rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        🧮 Calculate Freight Quote →
                      </button>
                      <button 
                        onClick={() => setActiveTab("about")} 
                        className="bg-slate-100 border border-slate-300 text-slate-900 hover:bg-slate-200 text-xs font-extrabold px-4 py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        Learn More →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lower Components Section (Fully Visible) */}
                <div className="space-y-3 sm:space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">ℹ️ ABOUT THE SYSTEM</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Trusted Freight Calculation Engine</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    
                    {/* Card 1 */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all space-y-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-700 text-lg sm:text-xl font-black border border-blue-200 shadow-inner">
                        📊
                      </div>
                      <h3 className="font-black text-slate-900 text-xs sm:text-sm">Tariff Engine</h3>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                        Calculates shipping rates dynamically based on cargo weight, mode, and distance.
                      </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all space-y-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center text-indigo-700 text-lg sm:text-xl font-black border border-indigo-200 shadow-inner">
                        🌐
                      </div>
                      <h3 className="font-black text-slate-900 text-xs sm:text-sm">Distance Matrix</h3>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                        Automatic route length calculation and marine distance estimation between major hubs.
                      </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all space-y-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-700 text-lg sm:text-xl font-black border border-emerald-200 shadow-inner">
                        ₹
                      </div>
                      <h3 className="font-black text-slate-900 text-xs sm:text-sm">INR Standard</h3>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                        All cost outputs computed directly in Indian Rupee (₹) with clear tax breakdowns.
                      </p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all space-y-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center text-purple-700 text-lg sm:text-xl font-black border border-purple-200 shadow-inner">
                        ⚡
                      </div>
                      <h3 className="font-black text-slate-900 text-xs sm:text-sm">Instant Quotes</h3>
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                        Immediate itemized cost outputs and downloadable quote summaries without delays.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* 2. ABOUT TAB */}
            {activeTab === "about" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-7 text-white shadow-lg grid md:grid-cols-5 gap-4 sm:gap-6 items-center border border-blue-500/30">
                  <div className="md:col-span-3 space-y-2 sm:space-y-3">
                    <span className="bg-white/20 text-blue-100 border border-white/30 text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                      SMART & RELIABLE FREIGHT HUB
                    </span>
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-black leading-tight text-white drop-shadow">
                      Make your freight calculations simple with FreightHub
                    </h1>
                    <p className="text-xs font-semibold text-blue-100 leading-relaxed max-w-xl">
                      Choose and calculate optimal shipping rates across air, ocean, road, and rail with transparent pricing, instant distance matrices, and zero hidden charges.
                    </p>
                    <button onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider active:scale-95">
                      Calculate Freight Now ➔
                    </button>
                  </div>

                  <div className="md:col-span-2 rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-white/20">
                    <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" alt="Cargo Ship" className="w-full h-36 sm:h-48 object-cover" />
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Our story & mission</h2>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-2">
                      FreightHub began with a clear mission: connect commercial shippers and enterprise supply teams with automated, accurate freight tariff calculations. Today we deliver a real-time computation system covering global routes, cargo classes, and multi-modal transit options — all with transparent pricing in Indian Rupee (₹).
                    </p>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      We prioritize transparency, route distance accuracy, and clear cost breakdowns to make logistics simple, affordable, and dependable.
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">What makes us different</h3>
                    <ul className="space-y-1.5 text-xs font-bold text-slate-800">
                      <li className="flex items-center gap-2"><span className="text-blue-600 text-base">●</span> Hub-to-hub real-time distance matrix computation</li>
                      <li className="flex items-center gap-2"><span className="text-blue-600 text-base">●</span> Multi-modal carrier flexibility (Air, Ocean, Road, Rail)</li>
                      <li className="flex items-center gap-2"><span className="text-blue-600 text-base">●</span> Clear fuel surcharge & customs handling breakdowns in ₹</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-sm border border-blue-400">
                    🛡️
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-black text-slate-900 text-xs sm:text-sm">FreightHub is your trusted neighborhood logistics calculation engine bringing instant, high-precision distance and tariff metrics to your fingertips.</p>
                    <p className="text-slate-700 font-semibold">Our mission is to make freight planning simple, affordable, and completely transparent.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SERVICES / CALCULATION / QUOTATIONS / ROUTES TAB */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">🚢 WORKBENCH ENGINE</span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">Freight Operations Portal</h1>
                </div>

                <div className="grid md:grid-cols-4 gap-3 sm:gap-4 items-start">
                  
                  {/* Left Navigation in Calculation Section */}
                  <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-1 flex flex-row md:flex-col overflow-x-auto">
                    <button
                      onClick={() => setServicesSubTab("dashboard")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "dashboard" ? "bg-blue-600 text-white shadow-sm" : "text-slate-800 hover:bg-slate-100"}`}
                    >
                      <span className="text-sm">📊</span> Dashboard
                    </button>
                    <button
                      onClick={() => setServicesSubTab("calculator")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "calculator" ? "bg-blue-600 text-white shadow-sm" : "text-slate-800 hover:bg-slate-100"}`}
                    >
                      <span className="text-sm">🧮</span> Calculation
                    </button>
                    <button
                      onClick={() => setServicesSubTab("quotes")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-between gap-2 shrink-0 md:shrink ${servicesSubTab === "quotes" ? "bg-blue-600 text-white shadow-sm" : "text-slate-800 hover:bg-slate-100"}`}
                    >
                      <span className="flex items-center gap-2"><span className="text-sm">📑</span> Quotations</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black ${servicesSubTab === "quotes" ? "bg-white text-blue-700" : "bg-slate-200 text-slate-800"}`}>
                        {quoteHistory.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setServicesSubTab("routes")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "routes" ? "bg-blue-600 text-white shadow-sm" : "text-slate-800 hover:bg-slate-100"}`}
                    >
                      <span className="text-sm">🌐</span> Routes
                    </button>
                    <button
                      onClick={() => setServicesSubTab("tracking")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "tracking" ? "bg-blue-600 text-white shadow-sm" : "text-slate-800 hover:bg-slate-100"}`}
                    >
                      <span className="text-sm">📦</span> Tracking
                    </button>
                  </div>

                  {/* Dynamic Content */}
                  <div className="md:col-span-3">
                    
                    {/* DASHBOARD SUB-TAB */}
                    {servicesSubTab === "dashboard" && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest block">OVERVIEW</span>
                            <h3 className="font-black text-slate-900 text-lg sm:text-xl">Calculation Workbench Dashboard</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg sm:rounded-xl">
                              <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Calculations Performed</span>
                              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">1,420</span>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700">↑ 15% this week</span>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg sm:rounded-xl">
                              <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Active Quotes</span>
                              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{quoteHistory.length}</span>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-blue-700">Ready for dispatch</span>
                            </div>
                            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg sm:rounded-xl">
                              <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Saved Routes</span>
                              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">38</span>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700">Frequent Lanes</span>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg sm:rounded-xl">
                              <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Estimated Savings</span>
                              <span className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5 block">₹ 1,42,800</span>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-purple-700">Via smart routing</span>
                            </div>
                          </div>

                          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-lg sm:rounded-xl space-y-2 shadow-sm border border-blue-500/30">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest">⚡ Recent Activity</span>
                              <button onClick={() => setServicesSubTab("calculator")} className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-black px-2.5 py-1 rounded-md transition-all shadow-sm">
                                Launch Calculator
                              </button>
                            </div>
                            <p className="text-xs font-medium text-slate-200">
                              Last quotation generated for <strong className="text-white font-black">Sharma Textiles</strong> on route <strong className="text-white font-black">INNSA ➔ AEJEA</strong>. Status: <span className="text-emerald-400 font-black">Issued</span>.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CALCULATOR */}
                    {servicesSubTab === "calculator" && (
                      <form onSubmit={handleFreightCalculate}>
                        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 items-start">
                          
                          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                            
                            {/* STEP 1: ROUTE */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">1</span>
                                <div>
                                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">Route Details</h3>
                                  <p className="text-[10px] font-bold text-slate-500">Origin, destination, and dispatch dates</p>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Origin Port / Hub *</label>
                                  <input
                                    required
                                    value={servicesForm.originPort}
                                    onChange={(e) => handleServicesFormChange("originPort", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Destination Port / Hub *</label>
                                  <input
                                    required
                                    value={servicesForm.destinationPort}
                                    onChange={(e) => handleServicesFormChange("destinationPort", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Pickup Address (Door Pickup)</label>
                                  <input
                                    placeholder="Street, city, PIN code"
                                    value={servicesForm.pickupAddress}
                                    onChange={(e) => handleServicesFormChange("pickupAddress", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Delivery Address (Door Delivery)</label>
                                  <input
                                    placeholder="Street, city, postal code"
                                    value={servicesForm.deliveryAddress}
                                    onChange={(e) => handleServicesFormChange("deliveryAddress", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Cargo Ready Date *</label>
                                  <input
                                    type="date"
                                    required
                                    value={servicesForm.readyDate}
                                    onChange={(e) => handleServicesFormChange("readyDate", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Required Delivery Date</label>
                                  <input
                                    type="date"
                                    value={servicesForm.requiredDeliveryDate}
                                    onChange={(e) => handleServicesFormChange("requiredDeliveryDate", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* STEP 2: SERVICE TYPE */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">2</span>
                                <div>
                                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">Service & Commercial Terms</h3>
                                  <p className="text-[10px] font-bold text-slate-500">Transport mode and commercial terms</p>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1.5">Transport Mode *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {[
                                    { id: "ocean", label: "⛴ Ocean Freight" },
                                    { id: "air", label: "✈ Air Freight" },
                                    { id: "ground", label: "🚛 Ground & Rail" },
                                    { id: "express", label: "⚡ Express Air" },
                                  ].map((m) => (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => handleServicesFormChange("mode", m.id)}
                                      className={`p-2 rounded-lg text-xs font-black border transition-all ${
                                        servicesForm.mode === m.id
                                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                          : "bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-200"
                                      }`}
                                    >
                                      {m.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {servicesForm.mode === "ocean" && (
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg sm:rounded-xl space-y-2">
                                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">OCEAN PARAMETERS</span>
                                  <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">Load Type *</label>
                                      <div className="flex gap-1.5">
                                        {["FCL", "LCL"].map((lt) => (
                                          <button
                                            key={lt}
                                            type="button"
                                            onClick={() => handleServicesFormChange("loadType", lt)}
                                            className={`flex-1 py-1.5 text-xs font-black rounded-lg border ${
                                              servicesForm.loadType === lt
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-slate-900 border-slate-300"
                                            }`}
                                          >
                                            {lt === "FCL" ? "FCL (Full Container)" : "LCL (Shared)"}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">Incoterm *</label>
                                      <select
                                        value={servicesForm.incoterm}
                                        onChange={(e) => handleServicesFormChange("incoterm", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-black text-slate-900 focus:border-blue-600 outline-none"
                                      >
                                        <option value="FOB">FOB — Free On Board</option>
                                        <option value="EXW">EXW — Ex Works</option>
                                        <option value="CIF">CIF — Cost Insurance Freight</option>
                                        <option value="DAP">DAP — Delivered At Place</option>
                                        <option value="DDP">DDP — Delivered Duty Paid</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* STEP 3: SHIPMENT DETAILS */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">3</span>
                                <div>
                                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">Cargo & Cargo Line Items</h3>
                                  <p className="text-[10px] font-bold text-slate-500">Package dimensions, weights, and descriptions</p>
                                </div>
                              </div>

                              {servicesForm.items.map((item, idx) => (
                                <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl space-y-2.5">
                                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                    <span className="text-[10px] font-black text-slate-900">ITEM #{String(idx + 1).padStart(2, "0")}</span>
                                    {servicesForm.items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveItem(idx)}
                                        className="text-[11px] text-red-600 font-extrabold hover:underline"
                                      >
                                        🗑 Remove Item
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-2.5">
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Package Type *</label>
                                      <select
                                        value={item.packageType}
                                        onChange={(e) => handleItemChange(idx, "packageType", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                                      >
                                        <option>Container</option>
                                        <option>Pallet</option>
                                        <option>Carton</option>
                                        <option>Crate</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Container Spec *</label>
                                      <select
                                        value={item.containerType}
                                        onChange={(e) => handleItemChange(idx, "containerType", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                                      >
                                        <option value="40HC">40HC — High Cube Container</option>
                                        <option value="20GP">20GP — General Purpose</option>
                                        <option value="40GP">40GP — General Purpose</option>
                                        <option value="40RF">40RF — Reefer</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-2.5">
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Quantity / Count *</label>
                                      <input
                                        type="number"
                                        value={item.containerCount}
                                        onChange={(e) => handleItemChange(idx, "containerCount", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Gross Weight (KG) *</label>
                                      <input
                                        type="number"
                                        value={item.grossWeightKg}
                                        onChange={(e) => handleItemChange(idx, "grossWeightKg", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-2.5">
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Commodity Description *</label>
                                      <input
                                        placeholder="Cotton, Electronics, etc."
                                        value={item.commodityDescription}
                                        onChange={(e) => handleItemChange(idx, "commodityDescription", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">HS Code</label>
                                      <input
                                        placeholder="e.g. 5208.11"
                                        value={item.hsCode}
                                        onChange={(e) => handleItemChange(idx, "hsCode", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={handleAddItem}
                                className="w-full py-2 border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-black transition-all"
                              >
                                + Add Line Item
                              </button>
                            </div>

                            {/* STEP 4: ADDITIONAL DETAILS */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">4</span>
                                <div>
                                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">Additional Details</h3>
                                  <p className="text-[10px] font-bold text-slate-500">Value, handling and special requirements</p>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Declared Value</label>
                                  <input
                                    type="text"
                                    value={servicesForm.declaredValue}
                                    onChange={(e) => handleServicesFormChange("declaredValue", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider">Currency *</label>
                                    <span className="bg-orange-600 text-white text-[8px] font-black px-1 rounded-full">NEW</span>
                                  </div>
                                  <select
                                    value={servicesForm.currency}
                                    onChange={(e) => handleServicesFormChange("currency", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-black text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  >
                                    <option value="INR">INR — Indian Rupee</option>
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                    <option value="AED">AED — UAE Dirham</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Special Instructions (optional)</label>
                                <textarea
                                  rows="2"
                                  placeholder="e.g. call before delivery"
                                  value={servicesForm.specialInstructions}
                                  onChange={(e) => handleServicesFormChange("specialInstructions", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-extrabold text-slate-900">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.isFragile}
                                    onChange={(e) => handleServicesFormChange("isFragile", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                                  />
                                  Fragile goods
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.isHazardous}
                                    onChange={(e) => handleServicesFormChange("isHazardous", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                                  />
                                  Hazardous materials
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.isTempControlled}
                                    onChange={(e) => handleServicesFormChange("isTempControlled", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                                  />
                                  Temperature controlled
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.addInsurance}
                                    onChange={(e) => handleServicesFormChange("addInsurance", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                                  />
                                  Add cargo insurance
                                </label>
                              </div>

                              {servicesForm.isHazardous && (
                                <div className="bg-amber-50 border border-amber-300 rounded-lg sm:rounded-xl p-3 space-y-2">
                                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                                    HAZARDOUS TICKED — THESE THREE BECOME REQUIRED
                                  </span>
                                  <div className="grid sm:grid-cols-3 gap-2">
                                    <div>
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <label className="text-[10px] font-black text-slate-900 uppercase">UN Number *</label>
                                        <span className="bg-orange-600 text-white text-[8px] font-black px-1 rounded">NEW</span>
                                      </div>
                                      <input
                                        placeholder="UN1234"
                                        value={servicesForm.hazardousDetails.unNumber}
                                        onChange={(e) => setServicesForm((prev) => ({
                                          ...prev,
                                          hazardousDetails: { ...prev.hazardousDetails, unNumber: e.target.value }
                                        }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <label className="text-[10px] font-black text-slate-900 uppercase">IMO Class *</label>
                                        <span className="bg-orange-600 text-white text-[8px] font-black px-1 rounded">NEW</span>
                                      </div>
                                      <select
                                        value={servicesForm.hazardousDetails.imoClass}
                                        onChange={(e) => setServicesForm((prev) => ({
                                          ...prev,
                                          hazardousDetails: { ...prev.hazardousDetails, imoClass: e.target.value }
                                        }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                                      >
                                        <option value="">Select...</option>
                                        <option value="Class 3">Class 3 - Flammable Liquids</option>
                                        <option value="Class 8">Class 8 - Corrosives</option>
                                        <option value="Class 9">Class 9 - Miscellaneous</option>
                                      </select>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <label className="text-[10px] font-black text-slate-900 uppercase">MSDS *</label>
                                        <span className="bg-orange-600 text-white text-[8px] font-black px-1 rounded">NEW</span>
                                      </div>
                                      <input
                                        type="file"
                                        onChange={(e) => setServicesForm((prev) => ({
                                          ...prev,
                                          hazardousDetails: { ...prev.hazardousDetails, msdsFile: e.target.files[0] }
                                        }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-bold text-slate-900 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:bg-slate-200 file:text-slate-800"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* STEP 5: CONTACT DETAILS */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">5</span>
                                <div>
                                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">Contact Details</h3>
                                  <p className="text-[10px] font-bold text-slate-500">Who receives the quotation</p>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Full Name *</label>
                                  <input
                                    required
                                    placeholder="Priya Sharma"
                                    value={servicesForm.fullName}
                                    onChange={(e) => handleServicesFormChange("fullName", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Company *</label>
                                  <input
                                    required
                                    placeholder="Company name"
                                    value={servicesForm.company}
                                    onChange={(e) => handleServicesFormChange("company", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Email *</label>
                                  <input
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    value={servicesForm.email}
                                    onChange={(e) => handleServicesFormChange("email", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider">Country *</label>
                                    <span className="bg-orange-600 text-white text-[8px] font-black px-1 rounded">NEW</span>
                                  </div>
                                  <select
                                    value={servicesForm.country}
                                    onChange={(e) => handleServicesFormChange("country", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-black text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  >
                                    <option value="India">India</option>
                                    <option value="United Arab Emirates">United Arab Emirates</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Singapore">Singapore</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* LIVE ESTIMATE SIDEBAR */}
                          <div className="lg:col-span-1 lg:sticky lg:top-20 space-y-3 sm:space-y-4">
                            <div className="bg-slate-950 text-white rounded-xl sm:rounded-2xl p-4 shadow-lg border border-blue-500/40 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">⚡ Live Estimate</span>
                                <span className="text-[9px] bg-blue-900/80 text-blue-200 font-extrabold px-2 py-0.5 rounded-full border border-blue-500/50">REALTIME</span>
                              </div>

                              <div className="space-y-2 text-xs font-bold">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Charge Basis</span>
                                  <span className="text-slate-100 font-extrabold">{estimate.chargeBasis}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Cargo Count</span>
                                  <span className="text-slate-100 font-extrabold">{estimate.containerSummary}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Total Weight</span>
                                  <span className="text-slate-100 font-extrabold">{estimate.totalWeight}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Est. Distance</span>
                                  <span className="text-slate-100 font-extrabold">{estimate.seaDistance}</span>
                                </div>
                              </div>

                              <div className="border-t border-slate-800 pt-2 space-y-2 text-xs font-bold">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Est. Transit</span>
                                  <span className="text-slate-100 font-extrabold">{estimate.estimatedTransit}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Est. Arrival</span>
                                  <span className="text-slate-100 font-extrabold">{estimate.estArrival}</span>
                                </div>
                              </div>

                              <div className="border-t border-slate-800 pt-3">
                                <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Estimated Tariff Total</span>
                                <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5 tracking-tight drop-shadow">{estimate.estimatedTotal}</div>
                                <span className="text-[8px] font-bold text-slate-400 mt-0.5 block">◆ Indicative Base Calculation (Excludes Taxes & Customs)</span>
                              </div>

                              <button
                                type="submit"
                                disabled={calcLoading}
                                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-2.5 rounded-lg shadow-sm text-xs uppercase tracking-wider transition-all active:scale-95"
                              >
                                {calcLoading ? "Generating Official Quote..." : "→ Generate Full Quotation"}
                              </button>
                            </div>

                            {calculatedQuote && (
                              <div className="bg-emerald-50 border border-emerald-300 rounded-xl sm:rounded-2xl p-4 text-xs space-y-2 shadow-sm">
                                <span className="font-black text-emerald-950 text-xs block">✓ Quotation Generated ({calculatedQuote.quote_id})</span>
                                <div className="flex justify-between text-emerald-900 font-bold">
                                  <span>Base Freight:</span>
                                  <span>₹{calculatedQuote.breakdown?.base_freight?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-emerald-900 font-bold">
                                  <span>Fuel Surcharge:</span>
                                  <span>₹{calculatedQuote.breakdown?.fuel_surcharge?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-emerald-950 border-t border-emerald-300 pt-1.5 text-xs font-black">
                                  <span>Final Computed:</span>
                                  <span>₹{calculatedQuote.breakdown?.total_price?.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </form>
                    )}

                    {/* QUOTATIONS PAGE */}
                    {servicesSubTab === "quotes" && (
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest block">QUOTATION DASHBOARD</span>
                            <h3 className="font-black text-slate-900 text-lg sm:text-xl">Quotations Overview</h3>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-black border border-slate-300 transition-all">
                              ↓ Export
                            </button>
                            <button onClick={() => setServicesSubTab("calculator")} className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm transition-all">
                              + New Enquiry
                            </button>
                          </div>
                        </div>

                        {/* Top Quotation Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Quotes This Month</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">248</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700">↑ 12% vs last month</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Avg Turnaround</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">42s</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-blue-700">↓ target &lt; 60s</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Routes Analysed</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">1,284</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700">3.2 avg per enquiry</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Unserviced Lanes</span>
                            <span className="text-xl sm:text-2xl font-black text-orange-600 mt-0.5 block">6</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-orange-600">needs master data</span>
                          </div>
                        </div>

                        {/* Quotation Table */}
                        <div className="overflow-x-auto border border-slate-200 rounded-lg sm:rounded-xl shadow-sm">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 font-black uppercase">
                              <tr>
                                <th className="p-2.5 sm:p-3">Quote No</th>
                                <th className="p-2.5 sm:p-3">Customer</th>
                                <th className="p-2.5 sm:p-3">Lane</th>
                                <th className="p-2.5 sm:p-3">Mode</th>
                                <th className="p-2.5 sm:p-3">Basis</th>
                                <th className="p-2.5 sm:p-3">Transit</th>
                                <th className="p-2.5 sm:p-3">Indicative Total</th>
                                <th className="p-2.5 sm:p-3">Status</th>
                                <th className="p-2.5 sm:p-3">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                              {quoteHistory.map((q, idx) => (
                                <tr key={q.id + idx} className="hover:bg-blue-50/50 transition-all">
                                  <td className="p-2.5 sm:p-3 font-mono font-black text-blue-700">{q.id}</td>
                                  <td className="p-2.5 sm:p-3 font-black text-slate-900">{q.customer || "Sharma Textiles"}</td>
                                  <td className="p-2.5 sm:p-3">{q.origin} ➔ {q.destination}</td>
                                  <td className="p-2.5 sm:p-3"><span className="bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.5 rounded font-black">{q.mode}</span></td>
                                  <td className="p-2.5 sm:p-3">{q.basis || "2 × 40HC"}</td>
                                  <td className="p-2.5 sm:p-3">{q.transit || "6–10 d"}</td>
                                  <td className="p-2.5 sm:p-3 font-black text-slate-900 text-xs">₹{q.total?.toLocaleString()}</td>
                                  <td className="p-2.5 sm:p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black ${
                                      q.status === "Issued" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-200 text-slate-800 border border-slate-300"
                                    }`}>
                                      {q.status || "Draft"}
                                    </span>
                                  </td>
                                  <td className="p-2.5 sm:p-3">
                                    <button className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 px-2.5 py-0.5 rounded text-xs font-black shadow-sm transition-all">
                                      Open
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ROUTE INTELLIGENCE PAGE */}
                    {servicesSubTab === "routes" && (
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest block">INTELLIGENCE</span>
                          <h3 className="font-black text-slate-900 text-lg sm:text-xl">Route Intelligence</h3>
                        </div>

                        {/* Top Metrics Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Routes Analysed</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">12,450</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700">↑ 18% MoM</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Lane Coverage</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">98.5%</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700">✓ target ≥ 98%</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Transit MAE</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">1.7 d</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700">✓ target ≤ 2.0 d</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg sm:rounded-xl">
                            <span className="text-slate-700 text-[9px] sm:text-[10px] font-black uppercase block">Avg Options per Lane</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">3.2</span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700">min 2 required</span>
                          </div>
                        </div>

                        {/* Global Lane Map & Performance */}
                        <div className="grid lg:grid-cols-5 gap-3 sm:gap-4 items-start">
                          <div className="lg:col-span-3 bg-slate-950 text-white rounded-xl sm:rounded-2xl p-4 relative overflow-hidden h-52 sm:h-64 flex flex-col justify-between border border-blue-500/40 shadow-lg">
                            <div className="flex justify-between items-center z-10">
                              <span className="font-black text-xs text-slate-200">Global Lane Map</span>
                              <span className="text-[9px] sm:text-[10px] bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold">Top 40 Lanes</span>
                            </div>
                            
                            {/* Stylized Visual Map */}
                            <div className="relative w-full h-24 sm:h-32 flex items-center justify-center">
                              <div className="absolute left-6 bottom-6 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_12px_#f97316] animate-ping"></div>
                              <div className="absolute left-6 bottom-6 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_12px_#f97316]"></div>
                              <span className="absolute left-4 bottom-1.5 text-[9px] sm:text-[10px] font-mono text-orange-400 font-black">INNSA</span>
                              
                              <div className="absolute right-12 top-6 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#38bdf8]"></div>
                              <span className="absolute right-8 top-1 text-[9px] sm:text-[10px] font-mono text-cyan-300 font-black">DEHAM</span>

                              <div className="absolute right-24 top-14 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#38bdf8]"></div>
                              <span className="absolute right-20 top-9 text-[9px] sm:text-[10px] font-mono text-cyan-300 font-black">NLRTM</span>

                              <svg className="w-full h-full absolute inset-0 pointer-events-none">
                                <path d="M 50 80 Q 130 20 240 25" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="4 3" />
                                <path d="M 50 80 Q 140 50 200 55" stroke="#38bdf8" strokeWidth="2" fill="none" />
                              </svg>
                            </div>

                            <div className="flex gap-4 text-[10px] text-slate-300 font-bold z-10">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_5px_#f97316]"></span> Highest volume lane</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_#38bdf8]"></span> Active lane</span>
                            </div>
                          </div>

                          {/* Lane Performance Table */}
                          <div className="lg:col-span-2 space-y-2">
                            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Lane Performance</h4>
                            <div className="divide-y divide-slate-100 text-xs font-bold">
                              <div className="py-2 flex justify-between items-center">
                                <div>
                                  <p className="font-black text-slate-900 text-xs">INNSA ➔ AEJEA</p>
                                  <p className="text-slate-500 font-bold text-[10px]">Asia–Middle East</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-slate-900">6–10 d</p>
                                  <span className="text-emerald-700 font-black text-[10px]">96% On-time</span>
                                </div>
                              </div>
                              <div className="py-2 flex justify-between items-center">
                                <div>
                                  <p className="font-black text-slate-900 text-xs">INNSA ➔ NLRTM</p>
                                  <p className="text-slate-500 font-bold text-[10px]">Asia–Europe</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-slate-900">24–28 d</p>
                                  <span className="text-emerald-700 font-black text-[10px]">93% On-time</span>
                                </div>
                              </div>
                              <div className="py-2 flex justify-between items-center">
                                <div>
                                  <p className="font-black text-slate-900 text-xs">INNSA ➔ SGSIN</p>
                                  <p className="text-slate-500 font-bold text-[10px]">Intra-Asia</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-slate-900">11–16 d</p>
                                  <span className="text-emerald-700 font-black text-[10px]">98% On-time</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TRACKING */}
                    {servicesSubTab === "tracking" && (
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3 sm:space-y-4">
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">Track Cargo Shipment</h3>
                        <form onSubmit={handleTrackShipment} className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="text"
                            required
                            placeholder="Enter Tracking ID (e.g. FH-789012)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                          />
                          <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-lg sm:rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95">
                            Track Now
                          </button>
                        </form>

                        {trackingResult && (
                          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl space-y-1.5 text-xs font-bold shadow-sm">
                            <p className="font-black text-blue-950 text-xs sm:text-sm">Tracking Status for #{trackingResult.tracking_id || trackingResult.id}</p>
                            <p className="text-slate-800"><strong>Status:</strong> {trackingResult.status}</p>
                            <p className="text-slate-800"><strong>Current Location:</strong> {trackingResult.current_location || trackingResult.location}</p>
                            <p className="text-emerald-800 font-black"><strong>Expected Arrival:</strong> {trackingResult.estimated_delivery || trackingResult.eta}</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* 4. SPECIAL OFFERS TAB */}
            {activeTab === "offers" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-0.5">% PROMOTIONS</span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">Active Freight Discounts</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
                  
                  {/* Card 1 */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-400 transition-all">
                    <div>
                      <img src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80" alt="Air Cargo" className="w-full h-32 sm:h-36 object-cover" />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl text-blue-600">✈</span>
                          <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-300">15% OFF</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">Air Freight Express Promo</h3>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                          Get 15% discount on air shipments across domestic and international hubs.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 space-y-2.5">
                      <div className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded-lg border border-slate-300 font-bold">
                        <span className="text-slate-600">Promo Code:</span>
                        <span className="font-mono font-black text-blue-700 text-xs">AIR2026</span>
                      </div>
                      <button 
                        onClick={() => toggleApplyOffer("AIR2026")} 
                        className={`w-full text-xs font-black py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-sm active:scale-95 ${
                          appliedOffers["AIR2026"]
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {appliedOffers["AIR2026"] ? "✓ Applied in Calculator" : "🏷 Apply in Calculator"}
                      </button>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-400 transition-all">
                    <div>
                      <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80" alt="Ocean Container" className="w-full h-32 sm:h-36 object-cover" />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl text-blue-600">🚢</span>
                          <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-300">20% OFF</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">Ocean Container Discount</h3>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                          20% off full container load ocean shipments across major shipping lanes.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 space-y-2.5">
                      <div className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded-lg border border-slate-300 font-bold">
                        <span className="text-slate-600">Promo Code:</span>
                        <span className="font-mono font-black text-blue-700 text-xs">OCEAN20</span>
                      </div>
                      <button 
                        onClick={() => toggleApplyOffer("OCEAN20")} 
                        className={`w-full text-xs font-black py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-sm active:scale-95 ${
                          appliedOffers["OCEAN20"]
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {appliedOffers["OCEAN20"] ? "✓ Applied in Calculator" : "🏷 Apply in Calculator"}
                      </button>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-400 transition-all">
                    <div>
                      <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" alt="Enterprise Cargo" className="w-full h-32 sm:h-36 object-cover" />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl text-blue-600">🎁</span>
                          <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-300">10% OFF</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">Enterprise Cargo Saver</h3>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                          Special rate reduction applied to high-volume corporate accounts.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 space-y-2.5">
                      <div className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded-lg border border-slate-300 font-bold">
                        <span className="text-slate-600">Promo Code:</span>
                        <span className="font-mono font-black text-blue-700 text-xs">ENTERPRISE10</span>
                      </div>
                      <button 
                        onClick={() => toggleApplyOffer("ENTERPRISE10")} 
                        className={`w-full text-xs font-black py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-sm active:scale-95 ${
                          appliedOffers["ENTERPRISE10"]
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {appliedOffers["ENTERPRISE10"] ? "✓ Applied in Calculator" : "🏷 Apply in Calculator"}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 5. CONTACT TAB */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">🎧 SUPPORT</span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">Get In Touch With Support</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-3 sm:gap-4 items-start">
                  
                  {/* Left Info Panel */}
                  <div className="md:col-span-1 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">Logistics Desk</h3>
                    
                    <div className="space-y-3 text-xs font-bold">
                      <div className="flex items-start gap-2.5">
                        <span className="text-blue-600 text-base">🏢</span>
                        <div>
                          <strong className="block text-slate-900 text-xs font-black">Headquarters</strong>
                          <p className="text-slate-600 mt-0.5">Chennai, Tamil Nadu, India</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 text-base">📞</span>
                        <div>
                          <strong className="block text-slate-900 text-xs font-black">Support Line</strong>
                          <p className="text-slate-600 mt-0.5">+91 1800 123 4567</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 text-base">✉️</span>
                        <div>
                          <strong className="block text-slate-900 text-xs font-black">Email Inquiry</strong>
                          <p className="text-slate-600 mt-0.5">support@freighthub.in</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Contact Form */}
                  <div className="md:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                    <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
                      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Alex"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="alex@company.com"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Message</label>
                        <textarea
                          rows="3"
                          required
                          placeholder="Ask about enterprise tariffs or custom route setups..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
                      >
                        🚀 Send Support Inquiry
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
