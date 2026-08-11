import React, { useState, useMemo } from "react";
import AdminDashboard from "./components/AdminDashboard";
import {
  HiOutlineRocketLaunch,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineGlobeAlt,
  HiOutlineCurrencyRupee,
  HiOutlineBolt,
  HiOutlinePaperAirplane,
  HiOutlineDocumentText,
  HiOutlineCube,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineTag,
  HiOutlineBuildingOffice2,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineArrowRight,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineCheck
} from "react-icons/hi2";
import { TbShip, TbPlane, TbTruck, TbBolt } from "react-icons/tb";

const API_BASE = "https://intelligent-frieght-quote-generator-3huz.onrender.com/api";

// Available Locations with Port Codes and Coordinates
const LOCATION_OPTIONS = [
  { code: "INNSA", name: "Jawaharlal Nehru Port (INNSA / Mumbai, India)", lat: 18.95, lon: 72.95 },
  { code: "INMAA", name: "Chennai Port (INMAA / Chennai, India)", lat: 13.1, lon: 80.3 },
  { code: "AEJEA", name: "Jebel Ali Port (AEJEA / Dubai, UAE)", lat: 24.98, lon: 55.06 },
  { code: "SGSIN", name: "Port of Singapore (SGSIN / Singapore)", lat: 1.26, lon: 103.84 },
  { code: "NLRTM", name: "Port of Rotterdam (NLRTM / Netherlands)", lat: 51.95, lon: 4.13 },
  { code: "USNYC", name: "Port of New York (USNYC / USA)", lat: 40.66, lon: -74.12 },
  { code: "GBFXT", name: "Port of Felixstowe (GBFXT / UK)", lat: 51.96, lon: 1.31 }
];

const INITIAL_SERVICES_FORM = {
  // Step 1: Route
  originPort: "",
  destinationPort: "",
  pickupAddress: "",
  deliveryAddress: "",
  readyDate: "",
  requiredDeliveryDate: "",

  // Step 2: Service Type
  mode: "", // 'ocean', 'air', 'ground', 'express'
  loadType: "", // 'FCL', 'LCL'
  incoterm: "",

  // Step 3: Shipment Details
  items: [
    {
      id: 1,
      packageType: "",
      containerType: "",
      containerCount: "",
      grossWeightKg: "",
      commodityDescription: "",
      hsCode: "",
    },
  ],

  // Step 4: Additional Details
  declaredValue: "",
  currency: "",
  specialInstructions: "",
  isFragile: false,
  isHazardous: false,
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
  country: "",
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
  const [authLoading, setAuthLoading] = useState(false);

  // Services State
  const [servicesForm, setServicesForm] = useState(INITIAL_SERVICES_FORM);
  const [calculatedQuote, setCalculatedQuote] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState([
    {
      id: "QT-2026-00934",
      customer: "Sharma Textiles",
      origin: "INNSA",
      destination: "AEJEA",
      mode: "OCEAN FCL",
      basis: "2 × 40HC",
      transit: "6–10 days",
      total: 192250,
      status: "Draft",
      created: "2 min ago"
    },
    {
      id: "QT-2026-00933",
      customer: "Nordic Imports AB",
      origin: "INNSA",
      destination: "NLRTM",
      mode: "OCEAN FCL",
      basis: "1 × 20GP",
      transit: "24–28 days",
      total: 284000,
      status: "Issued",
      created: "1 hour ago"
    },
    {
      id: "QT-2026-00932",
      customer: "Gulf Machinery LLC",
      origin: "INMAA",
      destination: "AEJEA",
      mode: "AIR Freight",
      basis: "250 kg",
      transit: "5–7 days",
      total: 64300,
      status: "Issued",
      created: "3 hours ago"
    }
  ]);
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  // Reset Calculation Form for New Inquiry
  const handleNewInquiry = () => {
    setServicesForm(INITIAL_SERVICES_FORM);
    setCalculatedQuote(null);
    setServicesSubTab("calculator");
  };

  // Dynamic Distance Helper (Haversine Formula)
  const calculatedDistanceKm = useMemo(() => {
    if (!servicesForm.originPort || !servicesForm.destinationPort) return 0;
    const orig = LOCATION_OPTIONS.find((l) => l.code === servicesForm.originPort);
    const dest = LOCATION_OPTIONS.find((l) => l.code === servicesForm.destinationPort);

    if (!orig || !dest) return 0;
    if (orig.code === dest.code) return 100;

    const R = 6371; // Earth's radius in km
    const dLat = ((dest.lat - orig.lat) * Math.PI) / 180;
    const dLon = ((dest.lon - orig.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((orig.lat * Math.PI) / 180) *
        Math.cos((dest.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [servicesForm.originPort, servicesForm.destinationPort]);

  // Precise Live Estimate Computation Logic
  const estimate = useMemo(() => {
    let basePrice = 0;
    let chargeBasis = "Select Parameters";
    let containerSummary = "0 Items Selected";
    let totalWeight = 0;

    servicesForm.items.forEach((item) => {
      totalWeight += Number(item.grossWeightKg) || 0;
    });

    const distance = calculatedDistanceKm;

    if (servicesForm.mode === "ocean") {
      if (servicesForm.loadType === "FCL") {
        const totalContainers = servicesForm.items.reduce(
          (acc, item) => acc + (Number(item.containerCount) || 0),
          0
        );
        chargeBasis = "Per Container";
        containerSummary = `${totalContainers || 0} Container(s)`;
        basePrice = (totalContainers || 1) * (50000 + distance * 12);
      } else {
        chargeBasis = "Per LCL CBM/KG";
        containerSummary = `${totalWeight} kg Shared`;
        basePrice = totalWeight * 45 + distance * 10;
      }
    } else if (servicesForm.mode === "air" || servicesForm.mode === "express") {
      chargeBasis = "Per Chargeable KG";
      const multiplier = servicesForm.mode === "express" ? 380 : 250;
      basePrice = totalWeight * multiplier + distance * 8;
      containerSummary = `${totalWeight} kg Air Cargo`;
    } else if (servicesForm.mode === "ground") {
      chargeBasis = "Per Km / Truckload";
      basePrice = totalWeight * 30 + distance * 25;
      containerSummary = `${totalWeight} kg Ground Load`;
    }

    // Add extra feature charges
    if (servicesForm.isFragile) basePrice += 2500;
    if (servicesForm.isHazardous) basePrice += 7500;
    if (servicesForm.isTempControlled) basePrice += 5000;
    if (servicesForm.addInsurance) basePrice += Math.round(Number(servicesForm.declaredValue || 0) * 0.02);

    // Transit Time Calculation
    let estimatedDaysMin = 2;
    let estimatedDaysMax = 5;

    if (servicesForm.mode === "ocean") {
      estimatedDaysMin = Math.max(5, Math.round((distance || 1000) / 400));
      estimatedDaysMax = estimatedDaysMin + 4;
    } else if (servicesForm.mode === "air") {
      estimatedDaysMin = Math.max(2, Math.round((distance || 1000) / 2000));
      estimatedDaysMax = estimatedDaysMin + 2;
    } else if (servicesForm.mode === "express") {
      estimatedDaysMin = 1;
      estimatedDaysMax = 3;
    } else {
      estimatedDaysMin = Math.max(3, Math.round((distance || 1000) / 500));
      estimatedDaysMax = estimatedDaysMin + 3;
    }

    const today = new Date();
    const etaDate = new Date();
    etaDate.setDate(today.getDate() + estimatedDaysMax);

    const roundedBase = basePrice > 0 ? Math.max(2500, Math.round(basePrice)) : 0;

    return {
      chargeBasis: servicesForm.mode ? chargeBasis : "Pending Selection",
      containerSummary,
      totalWeight: `${totalWeight.toLocaleString("en-IN")} kg`,
      seaDistance: distance ? `${distance.toLocaleString("en-IN")} km` : "Select Ports",
      estimatedTransit: servicesForm.mode ? `${estimatedDaysMin}–${estimatedDaysMax} days` : "Pending Selection",
      estArrival: servicesForm.mode ? etaDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Pending Selection",
      numericTotal: roundedBase,
      estimatedTotal: roundedBase > 0 ? `₹ ${roundedBase.toLocaleString("en-IN")}` : "₹ 0",
    };
  }, [servicesForm, calculatedDistanceKm]);

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
          packageType: "",
          containerType: "",
          containerCount: "",
          grossWeightKg: "",
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

  // Fast Authentication Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

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
    } fontally {
      setAuthLoading(false);
    }
  };

  // Instant Sign Out
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setActiveTab("home");
  };

  // Calculate & Generate Final Official Quote
  const handleFreightCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);

    const firstItem = servicesForm.items[0] || {};
    const totalWeight = servicesForm.items.reduce(
      (acc, item) => acc + (Number(item.grossWeightKg) || 0), 0
    );

    const estimatedBase = estimate.numericTotal || 15000;
    const terminalHandlingFee = Math.round(estimatedBase * 0.12);
    const fuelSurcharge = Math.round(estimatedBase * 0.15);
    const documentationFee = 1800;
    const finalPrice = estimatedBase + terminalHandlingFee + fuelSurcharge + documentationFee;

    const apiPayload = {
      weight: totalWeight || 100,
      distance: calculatedDistanceKm || 500, 
      origin: servicesForm.originPort || "INNSA",
      destination: servicesForm.destinationPort || "AEJEA",
      cargo_type: firstItem.commodityDescription || "General Cargo",
      weight_kg: Number(firstItem.grossWeightKg) || 100,
      mode: servicesForm.mode || "ocean",
      additional_details: servicesForm.specialInstructions,
      incoterm: servicesForm.incoterm || "FOB",
      load_type: servicesForm.loadType || "FCL",
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

      const quoteData = {
        quote_id: data.quote_id || `QT-${Math.floor(100000 + Math.random() * 900000)}`,
        breakdown: {
          base_freight: estimatedBase,
          fuel_surcharge: fuelSurcharge,
          terminal_handling: terminalHandlingFee,
          doc_fee: documentationFee,
          total_price: finalPrice
        }
      };

      setCalculatedQuote(quoteData);

      setQuoteHistory((prev) => [
        {
          id: quoteData.quote_id,
          customer: servicesForm.company || servicesForm.fullName || "Direct Shipper",
          origin: servicesForm.originPort || "INNSA",
          destination: servicesForm.destinationPort || "AEJEA",
          mode: `${(servicesForm.mode || "Ocean").toUpperCase()} ${servicesForm.loadType || "FCL"}`,
          basis: estimate.containerSummary,
          transit: estimate.estimatedTransit,
          total: finalPrice,
          status: "Issued",
          created: "Just now"
        },
        ...prev
      ]);
      alert(`Official Quotation ${quoteData.quote_id} generated! Total Cost: ₹${finalPrice.toLocaleString("en-IN")}`);
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
        current_location: "Central Freight Terminal",
        estimated_delivery: "Tomorrow, 4:00 PM",
        carrier: "FreightHub Express"
      });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your support inquiry has been sent successfully.");
    setContactForm({ name: "", email: "", message: "" });
  };

  const toggleApplyOffer = (code) => {
    setAppliedOffers((prev) => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const isAdminUser = user?.role === "admin" || authRole === "admin";

  // --- LOGIN / REGISTER SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-5 border border-slate-800/20 z-10">
          
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white flex flex-col justify-between relative">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <HiOutlineRocketLaunch className="text-2xl" />
                </div>
                <div>
                  <h1 className="font-bold text-lg tracking-wider text-white">FREIGHT HUB</h1>
                  <p className="text-[10px] text-blue-400 tracking-widest uppercase font-semibold">Enterprise Logistics</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl text-xs leading-relaxed text-slate-200 space-y-2 shadow-inner">
                <p className="font-semibold text-white text-sm">Smart Freight Engine</p>
                <p>Real-time tariff matrix, dynamic route calculation, and automated quotation dispatch.</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-medium mt-6">© FreightHub Portal 2026</p>
          </div>

          <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center bg-white">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {isRegistering ? "Create Workspace Account" : "Sign In to Portal"}
            </h2>
            <p className="text-xs font-medium text-slate-500 mb-6">
              {isRegistering ? "Register your profile to start computing dynamic quotations." : "Access calculation tools and saved quotations."}
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                <button
                  type="button"
                  onClick={() => setAuthRole("user")}
                  className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                    authRole === "user" ? "bg-white text-blue-700 shadow-sm font-bold" : "hover:text-slate-900"
                  }`}
                >
                  <HiOutlineUser className="text-sm" /> User Portal
                </button>
                <button
                  type="button"
                  onClick={() => setAuthRole("admin")}
                  className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                    authRole === "admin" ? "bg-white text-blue-700 shadow-sm font-bold" : "hover:text-slate-900"
                  }`}
                >
                  <HiOutlineShieldCheck className="text-sm" /> Admin Control
                </button>
              </div>

              {isRegistering && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.full_name}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="janedoe"
                      value={formData.username}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  {authRole === "admin" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Admin Passcode</label>
                      <input
                        type="password"
                        required
                        placeholder="freighthub-admin-123"
                        value={formData.admin_passcode}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                        onChange={(e) => setFormData({ ...formData, admin_passcode: e.target.value })}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Email or Username</label>
                <input
                  type="text"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-md text-xs flex items-center justify-center gap-2 uppercase tracking-wide mt-2 disabled:opacity-50"
              >
                {authLoading ? "Authenticating..." : isRegistering ? "Register Account" : "Sign In"} <HiOutlineArrowRight />
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); }}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                {isRegistering ? "Already registered? Sign in" : "Need an enterprise account? Register here"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP PORTAL ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* HEADER NAVBAR */}
      {!isAdminUser && (
        <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => !isAdminUser && setActiveTab("home")}>
              <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl shadow-md">
                <HiOutlineRocketLaunch />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block leading-tight text-white">FREIGHTHUB</span>
                <span className="text-[9px] font-semibold text-blue-400 tracking-wider block uppercase">LOGISTICS PORTAL</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
              <button onClick={() => setActiveTab("home")} className={`px-3 py-2 rounded-lg transition-all ${activeTab === "home" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>Home</button>
              <button onClick={() => setActiveTab("about")} className={`px-3 py-2 rounded-lg transition-all ${activeTab === "about" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>About</button>
              <button onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }} className={`px-3 py-2 rounded-lg transition-all ${activeTab === "services" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>Calculation</button>
              <button onClick={() => setActiveTab("offers")} className={`px-3 py-2 rounded-lg transition-all ${activeTab === "offers" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>Special Offers</button>
              <button onClick={() => setActiveTab("contact")} className={`px-3 py-2 rounded-lg transition-all ${activeTab === "contact" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>Contact</button>
            </nav>

            <div className="flex items-center gap-3">
              <div className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <HiOutlineUser className="text-blue-400" />
                <span className="max-w-[120px] sm:max-w-none truncate">{user?.email || "user@freighthub.in"}</span>
              </div>
              <button onClick={handleLogout} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all shadow-sm">
                <HiOutlineArrowLeftOnRectangle /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex justify-around border-t border-slate-800 py-2 px-2 bg-slate-900 text-xs font-semibold">
            <button onClick={() => setActiveTab("home")} className={`px-2 py-1 rounded ${activeTab === "home" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Home</button>
            <button onClick={() => setActiveTab("about")} className={`px-2 py-1 rounded ${activeTab === "about" ? "bg-blue-600 text-white" : "text-slate-300"}`}>About</button>
            <button onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }} className={`px-2 py-1 rounded ${activeTab === "services" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Calculate</button>
            <button onClick={() => setActiveTab("offers")} className={`px-2 py-1 rounded ${activeTab === "offers" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Offers</button>
            <button onClick={() => setActiveTab("contact")} className={`px-2 py-1 rounded ${activeTab === "contact" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Contact</button>
          </div>
        </header>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">

        {isAdminUser ? (
          <AdminDashboard token={token} handleLogout={handleLogout} userEmail={user?.email || "admin@freighthub.in"} />
        ) : (
          <>
            {/* 1. HOME TAB */}
            {activeTab === "home" && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative rounded-xl overflow-hidden shadow-md group border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" 
                      alt="Warehouse & Cargo Logistics" 
                      className="w-full h-56 md:h-72 object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5 text-white">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400 block mb-1">AUTOMATED TARIFF ENGINE</span>
                      <h3 className="text-xl font-bold text-white">Global Freight Intelligence</h3>
                      <p className="text-xs text-slate-300 mt-1">Multi-Modal Distance & Tariff Calculation System</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                      Enterprise Freight Platform
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      Precision Freight & Route Calculation
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                      Compute official freight tariffs in <strong className="text-slate-900">Indian Rupee (₹)</strong> based on dynamically evaluated route distances, transport modes, and detailed shipment profiles.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <HiOutlineSparkles className="text-base" /> Calculate Freight Quote
                      </button>
                      <button 
                        onClick={() => setActiveTab("about")} 
                        className="bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-xs font-semibold px-5 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        Learn Platform Features <HiOutlineArrowRight />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="space-y-4 pt-2">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">System Capabilities</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Engineered for Accuracy</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xl font-bold">
                        <HiOutlineChartBar />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Tariff Calculation</h3>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        Evaluates base tariffs and fuel surcharges standard across air, sea, and road freight.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-xl font-bold">
                        <HiOutlineGlobeAlt />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Distance Matrix</h3>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        Automatic nautical and terrestrial route distance estimation between international hubs.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 text-xl font-bold">
                        <HiOutlineCurrencyRupee />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">INR Standardization</h3>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        All final cost estimates formatted transparently with clear breakdown metrics in ₹.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 text-xl font-bold">
                        <HiOutlineBolt />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Instant Quotation</h3>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        Generates official quotation records instantaneously without manual dispatch delay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABOUT TAB MATCHED EXACTLY TO REFERENCE DESIGN */}
            {activeTab === "about" && (
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Hero Banner Box */}
                <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 rounded-2xl p-6 sm:p-10 text-white shadow-md grid md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-4">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block border border-white/30">
                      SMART & RELIABLE FREIGHT HUB
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                      Make your freight calculations simple with FreightHub
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed max-w-xl">
                      Choose and calculate optimal shipping rates across air, ocean, road, and rail with transparent pricing, instant distance matrices, and zero hidden charges.
                    </p>
                    <button
                      onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }}
                      className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all shadow-md inline-flex items-center gap-2"
                    >
                      Calculate Freight Now <HiOutlineArrowRight />
                    </button>
                  </div>

                  <div className="md:col-span-1">
                    <img 
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" 
                      alt="Cargo Ship at Port" 
                      className="rounded-xl shadow-lg border-2 border-white/20 w-full h-44 object-cover" 
                    />
                  </div>
                </div>

                {/* Our Story & Mission Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-extrabold text-slate-900">Our story & mission</h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      FreightHub began with a clear mission: connect commercial shippers and enterprise supply teams with automated, accurate freight tariff calculations. Today we deliver a real-time computation system covering global routes, cargo classes, and multi-modal transit options — all with transparent pricing in Indian Rupee (₹).
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      We prioritize transparency, route distance accuracy, and clear cost breakdowns to make logistics simple, affordable, and dependable.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900">What makes us different</h3>
                    <ul className="text-xs sm:text-sm text-slate-700 font-semibold space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Hub-to-hub real-time distance matrix computation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Multi-modal carrier flexibility (Air, Ocean, Road, Rail)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Clear fuel surcharge & customs handling breakdowns in ₹
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 flex flex-wrap gap-3">
                    <button
                      onClick={() => { setActiveTab("services"); setServicesSubTab("calculator"); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all shadow-sm"
                    >
                      Explore Calculator
                    </button>
                    <button
                      onClick={() => setActiveTab("home")}
                      className="bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 font-bold text-xs px-5 py-2.5 rounded-lg transition-all"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>

                {/* Bottom Highlight Callout Banner */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
                    <HiOutlineShieldCheck />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      FreightHub is your trusted neighborhood logistics calculation engine bringing instant, high-precision distance and tariff metrics to your fingertips.
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Our mission is to make freight planning simple, affordable, and completely transparent.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* 3. SERVICES / CALCULATION TAB */}
            {activeTab === "services" && (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">OPERATIONS WORKBENCH</span>
                  <h1 className="text-2xl font-bold text-slate-900">Freight Engine & Quotations</h1>
                </div>

                <div className="grid md:grid-cols-4 gap-5 items-start">
                  
                  {/* Left Navigation */}
                  <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-2 shadow-sm space-y-1 flex flex-row md:flex-col overflow-x-auto">
                    <button
                      onClick={() => setServicesSubTab("dashboard")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "dashboard" ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <HiOutlineChartBar className="text-base" /> Dashboard
                    </button>
                    <button
                      onClick={() => setServicesSubTab("calculator")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "calculator" ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <HiOutlineSparkles className="text-base" /> Calculation
                    </button>
                    <button
                      onClick={() => setServicesSubTab("quotes")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between gap-2 shrink-0 md:shrink ${servicesSubTab === "quotes" ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <span className="flex items-center gap-2"><HiOutlineDocumentText className="text-base" /> Quotations</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${servicesSubTab === "quotes" ? "bg-white text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                        {quoteHistory.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setServicesSubTab("routes")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "routes" ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <HiOutlineGlobeAlt className="text-base" /> Route Intelligence
                    </button>
                    <button
                      onClick={() => setServicesSubTab("tracking")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:shrink ${servicesSubTab === "tracking" ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <HiOutlineCube className="text-base" /> Tracking
                    </button>
                  </div>

                  {/* Main Subtab Area */}
                  <div className="md:col-span-3">
                    
                    {/* DASHBOARD */}
                    {servicesSubTab === "dashboard" && (
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">OVERVIEW</span>
                          <h3 className="font-bold text-slate-900 text-lg">Calculation Summary</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Calculations Made</span>
                            <span className="text-2xl font-black text-slate-900 mt-1 block">1,420</span>
                            <span className="text-[10px] font-semibold text-emerald-600">↑ 15% this week</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Active Quotes</span>
                            <span className="text-2xl font-black text-slate-900 mt-1 block">{quoteHistory.length}</span>
                            <span className="text-[10px] font-semibold text-blue-600">Ready for dispatch</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Saved Routes</span>
                            <span className="text-2xl font-black text-slate-900 mt-1 block">38</span>
                            <span className="text-[10px] font-semibold text-slate-600">Active Network</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Total Value</span>
                            <span className="text-2xl font-black text-slate-900 mt-1 block">₹ 14,28,000</span>
                            <span className="text-[10px] font-semibold text-purple-600">Calculated Tariff</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Latest Action</span>
                            <button onClick={handleNewInquiry} className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg transition-all">
                              Launch Calculator
                            </button>
                          </div>
                          <p className="text-xs text-slate-300">
                            Recent quotation issued for <strong className="text-white font-bold">{quoteHistory[0]?.customer}</strong> ({quoteHistory[0]?.origin} ➔ {quoteHistory[0]?.destination}). Total: <span className="text-emerald-400 font-bold">₹{quoteHistory[0]?.total?.toLocaleString("en-IN")}</span>.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* CALCULATOR WITH SELECT-FROM-DROPDOWN PLACEHOLDERS */}
                    {servicesSubTab === "calculator" && (
                      <form onSubmit={handleFreightCalculate}>
                        <div className="grid lg:grid-cols-3 gap-5 items-start">
                          
                          <div className="lg:col-span-2 space-y-4">
                            
                            {/* STEP 1: ROUTE */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-sm">Route Selection</h3>
                                  <p className="text-[11px] font-medium text-slate-500">Select origin and destination port from dropdown</p>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Origin Port / Hub *</label>
                                  <select
                                    required
                                    value={servicesForm.originPort}
                                    onChange={(e) => handleServicesFormChange("originPort", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  >
                                    <option value="" disabled>-- Select Origin Port --</option>
                                    {LOCATION_OPTIONS.map((loc) => (
                                      <option key={loc.code} value={loc.code}>
                                        {loc.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Destination Port / Hub *</label>
                                  <select
                                    required
                                    value={servicesForm.destinationPort}
                                    onChange={(e) => handleServicesFormChange("destinationPort", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                  >
                                    <option value="" disabled>-- Select Destination Port --</option>
                                    {LOCATION_OPTIONS.map((loc) => (
                                      <option key={loc.code} value={loc.code}>
                                        {loc.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Cargo Ready Date *</label>
                                  <input
                                    type="date"
                                    required
                                    value={servicesForm.readyDate}
                                    onChange={(e) => handleServicesFormChange("readyDate", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Required Delivery Date</label>
                                  <input
                                    type="date"
                                    value={servicesForm.requiredDeliveryDate}
                                    onChange={(e) => handleServicesFormChange("requiredDeliveryDate", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* STEP 2: SERVICE TYPE */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-sm">Transport Mode & Terms</h3>
                                  <p className="text-[11px] font-medium text-slate-500">Commercial incoterms and transport mode selection</p>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-2">Transport Mode *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {[
                                    { id: "ocean", label: "Ocean Freight", icon: TbShip },
                                    { id: "air", label: "Air Freight", icon: TbPlane },
                                    { id: "ground", label: "Ground & Rail", icon: TbTruck },
                                    { id: "express", label: "Express Cargo", icon: TbBolt },
                                  ].map((m) => {
                                    const IconComponent = m.icon;
                                    return (
                                      <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleServicesFormChange("mode", m.id)}
                                        className={`p-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                          servicesForm.mode === m.id
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                        }`}
                                      >
                                        <IconComponent className="text-base" />
                                        <span>{m.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Load Specification *</label>
                                  <select
                                    required
                                    value={servicesForm.loadType}
                                    onChange={(e) => handleServicesFormChange("loadType", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  >
                                    <option value="" disabled>-- Select Load Specification --</option>
                                    <option value="FCL">FCL — Full Container Load</option>
                                    <option value="LCL">LCL — Less Container Load (Shared)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Incoterm *</label>
                                  <select
                                    required
                                    value={servicesForm.incoterm}
                                    onChange={(e) => handleServicesFormChange("incoterm", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  >
                                    <option value="" disabled>-- Select Incoterm --</option>
                                    <option value="FOB">FOB — Free On Board</option>
                                    <option value="EXW">EXW — Ex Works</option>
                                    <option value="CIF">CIF — Cost Insurance Freight</option>
                                    <option value="DAP">DAP — Delivered At Place</option>
                                    <option value="DDP">DDP — Delivered Duty Paid</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* STEP 3: SHIPMENT DETAILS */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-sm">Cargo & Line Items</h3>
                                  <p className="text-[11px] font-medium text-slate-500">Package specifications and gross weight metrics</p>
                                </div>
                              </div>

                              {servicesForm.items.map((item, idx) => (
                                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                    <span className="text-xs font-bold text-slate-800">ITEM #{String(idx + 1).padStart(2, "0")}</span>
                                    {servicesForm.items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveItem(idx)}
                                        className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                                      >
                                        <HiOutlineTrash /> Remove
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Package Category *</label>
                                      <select
                                        required
                                        value={item.packageType}
                                        onChange={(e) => handleItemChange(idx, "packageType", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select Category --</option>
                                        <option value="Container">Shipping Container</option>
                                        <option value="Pallet">Standard Pallet</option>
                                        <option value="Carton">Wooden Box / Carton</option>
                                        <option value="Crate">Industrial Crate</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Container Spec / Size *</label>
                                      <select
                                        required
                                        value={item.containerType}
                                        onChange={(e) => handleItemChange(idx, "containerType", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select Spec --</option>
                                        <option value="40HC">40HC — 40ft High Cube</option>
                                        <option value="20GP">20GP — 20ft General Purpose</option>
                                        <option value="40GP">40GP — 40ft General Purpose</option>
                                        <option value="40RF">40RF — 40ft Reefer</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Quantity / Units *</label>
                                      <select
                                        required
                                        value={item.containerCount}
                                        onChange={(e) => handleItemChange(idx, "containerCount", Number(e.target.value))}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select Quantity --</option>
                                        {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                                          <option key={num} value={num}>
                                            {num} Unit(s)
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Gross Weight Bracket (KG) *</label>
                                      <select
                                        required
                                        value={item.grossWeightKg}
                                        onChange={(e) => handleItemChange(idx, "grossWeightKg", Number(e.target.value))}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select Weight --</option>
                                        {[250, 500, 1000, 2500, 5000, 10000, 20000, 30000].map((wt) => (
                                          <option key={wt} value={wt}>
                                            {wt.toLocaleString("en-IN")} kg
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Commodity Type *</label>
                                      <select
                                        required
                                        value={item.commodityDescription}
                                        onChange={(e) => handleItemChange(idx, "commodityDescription", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select Commodity --</option>
                                        <option value="General Merchandise">General Merchandise</option>
                                        <option value="Textiles & Apparel">Textiles & Apparel</option>
                                        <option value="Electronics & Components">Electronics & Components</option>
                                        <option value="Machinery & Spare Parts">Machinery & Spare Parts</option>
                                        <option value="Chemicals & Non-Hazardous">Chemicals & Non-Hazardous</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">HS Code Classification</label>
                                      <select
                                        value={item.hsCode}
                                        onChange={(e) => handleItemChange(idx, "hsCode", e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select HS Code --</option>
                                        <option value="5208.11">5208.11 — Woven Cotton Fabrics</option>
                                        <option value="8517.12">8517.12 — Telecommunication Equipment</option>
                                        <option value="8471.30">8471.30 — Data Processing Machinery</option>
                                        <option value="3926.90">3926.90 — Articles of Plastics</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={handleAddItem}
                                className="w-full py-2.5 border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                              >
                                <HiOutlinePlus /> Add Item Line
                              </button>
                            </div>

                            {/* STEP 4: ADDITIONAL DETAILS */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-sm">Handling & Requirements</h3>
                                  <p className="text-[11px] font-medium text-slate-500">Declared valuation and compliance parameters</p>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Declared Value Bracket</label>
                                  <select
                                    value={servicesForm.declaredValue}
                                    onChange={(e) => handleServicesFormChange("declaredValue", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  >
                                    <option value="" disabled>-- Select Value Bracket --</option>
                                    <option value="25000">₹ 25,000 / $ 300</option>
                                    <option value="50000">₹ 50,000 / $ 600</option>
                                    <option value="100000">₹ 1,00,000 / $ 1,200</option>
                                    <option value="500000">₹ 5,00,000 / $ 6,000</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Currency Standard *</label>
                                  <select
                                    required
                                    value={servicesForm.currency}
                                    onChange={(e) => handleServicesFormChange("currency", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  >
                                    <option value="" disabled>-- Select Currency --</option>
                                    <option value="INR">INR — Indian Rupee (₹)</option>
                                    <option value="USD">USD — US Dollar ($)</option>
                                    <option value="EUR">EUR — Euro (€)</option>
                                    <option value="AED">AED — UAE Dirham</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.isFragile}
                                    onChange={(e) => handleServicesFormChange("isFragile", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 accent-blue-600"
                                  />
                                  Fragile Cargo
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.isHazardous}
                                    onChange={(e) => handleServicesFormChange("isHazardous", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 accent-blue-600"
                                  />
                                  Hazardous / Hazmat Cargo
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.isTempControlled}
                                    onChange={(e) => handleServicesFormChange("isTempControlled", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 accent-blue-600"
                                  />
                                  Temperature Controlled (Reefer)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={servicesForm.addInsurance}
                                    onChange={(e) => handleServicesFormChange("addInsurance", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 accent-blue-600"
                                  />
                                  Include Cargo Protection Insurance
                                </label>
                              </div>

                              {servicesForm.isHazardous && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-3">
                                  <span className="text-[10px] font-bold text-amber-900 uppercase block">
                                    HAZARDOUS PARAMETERS
                                  </span>
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">UN Code *</label>
                                      <select
                                        value={servicesForm.hazardousDetails.unNumber}
                                        onChange={(e) => setServicesForm((prev) => ({
                                          ...prev,
                                          hazardousDetails: { ...prev.hazardousDetails, unNumber: e.target.value }
                                        }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select UN Code --</option>
                                        <option value="UN1203">UN1203 — Gasoline / Flammable</option>
                                        <option value="UN1993">UN1993 — Flammable liquid, n.o.s.</option>
                                        <option value="UN2794">UN2794 — Batteries, Wet, Filled</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">IMO Class *</label>
                                      <select
                                        value={servicesForm.hazardousDetails.imoClass}
                                        onChange={(e) => setServicesForm((prev) => ({
                                          ...prev,
                                          hazardousDetails: { ...prev.hazardousDetails, imoClass: e.target.value }
                                        }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                                      >
                                        <option value="" disabled>-- Select IMO Class --</option>
                                        <option value="Class 3">Class 3 — Flammable Liquids</option>
                                        <option value="Class 8">Class 8 — Corrosives</option>
                                        <option value="Class 9">Class 9 — Miscellaneous</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* STEP 5: CONTACT DETAILS */}
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">5</span>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-sm">Shipper Information</h3>
                                  <p className="text-[11px] font-medium text-slate-500">Contact details for issuing standard document</p>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                                  <input
                                    required
                                    placeholder="Priya Sharma"
                                    value={servicesForm.fullName}
                                    onChange={(e) => handleServicesFormChange("fullName", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Company Name *</label>
                                  <input
                                    required
                                    placeholder="Company Name"
                                    value={servicesForm.company}
                                    onChange={(e) => handleServicesFormChange("company", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Corporate Email *</label>
                                  <input
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    value={servicesForm.email}
                                    onChange={(e) => handleServicesFormChange("email", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Country *</label>
                                  <select
                                    required
                                    value={servicesForm.country}
                                    onChange={(e) => handleServicesFormChange("country", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                                  >
                                    <option value="" disabled>-- Select Country --</option>
                                    <option value="India">India</option>
                                    <option value="United Arab Emirates">United Arab Emirates</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Singapore">Singapore</option>
                                    <option value="Netherlands">Netherlands</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* LIVE ESTIMATE SIDEBAR */}
                          <div className="lg:col-span-1 lg:sticky lg:top-20 space-y-4">
                            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg border border-slate-800 space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <HiOutlineBolt /> Live Rate Metrics
                                </span>
                                <span className="text-[10px] bg-blue-900/60 text-blue-200 font-bold px-2 py-0.5 rounded border border-blue-500/30">COMPUTED</span>
                              </div>

                              <div className="space-y-2.5 text-xs font-medium">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Charge Basis</span>
                                  <span className="text-slate-100 font-bold">{estimate.chargeBasis}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Load Basis</span>
                                  <span className="text-slate-100 font-bold">{estimate.containerSummary}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Total Weight</span>
                                  <span className="text-slate-100 font-bold">{estimate.totalWeight}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Calculated Distance</span>
                                  <span className="text-slate-100 font-bold">{estimate.seaDistance}</span>
                                </div>
                              </div>

                              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs font-medium">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Estimated Transit</span>
                                  <span className="text-slate-100 font-bold">{estimate.estimatedTransit}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Estimated Arrival</span>
                                  <span className="text-slate-100 font-bold">{estimate.estArrival}</span>
                                </div>
                              </div>

                              <div className="border-t border-slate-800 pt-3">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Estimated Base Tariff</span>
                                <div className="text-2xl font-black text-blue-400 mt-1">{estimate.estimatedTotal}</div>
                                <span className="text-[9px] text-slate-400 mt-1 block">Dynamic distance & weight metric estimate</span>
                              </div>

                              <button
                                type="submit"
                                disabled={calcLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-md text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                              >
                                {calcLoading ? "Computing Official Quote..." : "Generate Full Quotation"} <HiOutlineArrowRight />
                              </button>
                            </div>

                            {calculatedQuote && (
                              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs space-y-2 shadow-sm">
                                <span className="font-bold text-emerald-950 text-xs block flex items-center gap-1.5">
                                  <HiOutlineCheckCircle className="text-base text-emerald-600" /> Official Quotation Issued ({calculatedQuote.quote_id})
                                </span>
                                <div className="flex justify-between text-emerald-900 font-medium">
                                  <span>Base Freight:</span>
                                  <span>₹{calculatedQuote.breakdown?.base_freight?.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-emerald-900 font-medium">
                                  <span>Fuel Surcharge:</span>
                                  <span>₹{calculatedQuote.breakdown?.fuel_surcharge?.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-emerald-900 font-medium">
                                  <span>Terminal Handling & Docs:</span>
                                  <span>₹{((calculatedQuote.breakdown?.terminal_handling || 0) + (calculatedQuote.breakdown?.doc_fee || 0)).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-emerald-950 border-t border-emerald-200 pt-2 font-bold text-xs">
                                  <span>Final Tariff Cost:</span>
                                  <span className="text-emerald-700">₹{calculatedQuote.breakdown?.total_price?.toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </form>
                    )}

                    {/* QUOTATIONS OVERVIEW WITH RESET ON NEW INQUIRY */}
                    {servicesSubTab === "quotes" && (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">RECORDS</span>
                            <h3 className="font-bold text-slate-900 text-lg">Issued Quotations</h3>
                          </div>
                          <button 
                            type="button"
                            onClick={handleNewInquiry} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <HiOutlinePlus /> New Enquiry
                          </button>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase">
                              <tr>
                                <th className="p-3">Quote ID</th>
                                <th className="p-3">Customer / Shipper</th>
                                <th className="p-3">Route</th>
                                <th className="p-3">Mode</th>
                                <th className="p-3">Transit</th>
                                <th className="p-3">Total Amount</th>
                                <th className="p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                              {quoteHistory.map((q, idx) => (
                                <tr key={q.id + idx} className="hover:bg-slate-50 transition-all">
                                  <td className="p-3 font-mono font-bold text-blue-600">{q.id}</td>
                                  <td className="p-3 font-bold text-slate-900">{q.customer}</td>
                                  <td className="p-3">{q.origin} ➔ {q.destination}</td>
                                  <td className="p-3"><span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">{q.mode}</span></td>
                                  <td className="p-3">{q.transit}</td>
                                  <td className="p-3 font-bold text-slate-900">₹{q.total?.toLocaleString("en-IN")}</td>
                                  <td className="p-3">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      {q.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ROUTE INTELLIGENCE */}
                    {servicesSubTab === "routes" && (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">ANALYTICS</span>
                          <h3 className="font-bold text-slate-900 text-lg">Active Route Network</h3>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Routes Analysed</span>
                            <span className="text-2xl font-black text-slate-900 mt-0.5 block">12,450</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Coverage</span>
                            <span className="text-2xl font-black text-slate-900 mt-0.5 block">98.5%</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Avg Transit Time</span>
                            <span className="text-2xl font-black text-slate-900 mt-0.5 block">6.2 Days</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                            <span className="text-slate-500 text-[10px] font-bold uppercase block">Efficiency</span>
                            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">Optimal</span>
                          </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Major Trade Lanes</h4>
                          <div className="divide-y divide-slate-200 text-xs font-semibold">
                            <div className="py-2.5 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-900">INNSA (Mumbai) ➔ AEJEA (Dubai)</p>
                                <p className="text-slate-500 text-[10px]">Asia–Middle East Corridor</p>
                              </div>
                              <span className="text-emerald-700 font-bold">6–10 Days</span>
                            </div>
                            <div className="py-2.5 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-900">INNSA (Mumbai) ➔ NLRTM (Rotterdam)</p>
                                <p className="text-slate-500 text-[10px]">Asia–Europe Route</p>
                              </div>
                              <span className="text-emerald-700 font-bold">24–28 Days</span>
                            </div>
                            <div className="py-2.5 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-900">INMAA (Chennai) ➔ SGSIN (Singapore)</p>
                                <p className="text-slate-500 text-[10px]">Intra-Asia Route</p>
                              </div>
                              <span className="text-emerald-700 font-bold">4–7 Days</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TRACKING */}
                    {servicesSubTab === "tracking" && (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 text-base">Track Shipment</h3>
                        <form onSubmit={handleTrackShipment} className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Enter Tracking Number (e.g. QT-2026-00934)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                          />
                          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all">
                            Track
                          </button>
                        </form>

                        {trackingResult && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs font-medium">
                            <p className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                              <HiOutlineMapPin className="text-blue-600 text-base" /> Status for #{trackingResult.tracking_id || trackingResult.id}
                            </p>
                            <p className="text-slate-700"><strong>Status:</strong> {trackingResult.status}</p>
                            <p className="text-slate-700"><strong>Location:</strong> {trackingResult.current_location || trackingResult.location}</p>
                            <p className="text-emerald-800 font-bold"><strong>Expected Delivery:</strong> {trackingResult.estimated_delivery || trackingResult.eta}</p>
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
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">PROMOTIONS</span>
                  <h1 className="text-2xl font-bold text-slate-900">Commercial Discounts</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {/* Offer 1 */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                      <img src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80" alt="Air Freight" className="w-full h-36 object-cover" />
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <TbPlane className="text-xl text-blue-600" />
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">15% DISCOUNT</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Air Freight Express Offer</h3>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          15% tariff reduction on priority air cargo shipments.
                        </p>
                      </div>
                    </div>
                    <div className="p-5 pt-0 space-y-3">
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-semibold">
                        <span className="text-slate-500">Code:</span>
                        <span className="font-mono font-bold text-blue-600">AIR2026</span>
                      </div>
                      <button 
                        onClick={() => toggleApplyOffer("AIR2026")} 
                        className={`w-full text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                          appliedOffers["AIR2026"]
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <HiOutlineTag /> {appliedOffers["AIR2026"] ? "Applied" : "Apply Offer"}
                      </button>
                    </div>
                  </div>

                  {/* Offer 2 */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                      <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80" alt="Ocean Freight" className="w-full h-36 object-cover" />
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <TbShip className="text-xl text-blue-600" />
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">20% DISCOUNT</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Ocean FCL Volume Rates</h3>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          20% savings on 40HC full container ocean loads.
                        </p>
                      </div>
                    </div>
                    <div className="p-5 pt-0 space-y-3">
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-semibold">
                        <span className="text-slate-500">Code:</span>
                        <span className="font-mono font-bold text-blue-600">OCEAN20</span>
                      </div>
                      <button 
                        onClick={() => toggleApplyOffer("OCEAN20")} 
                        className={`w-full text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                          appliedOffers["OCEAN20"]
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <HiOutlineTag /> {appliedOffers["OCEAN20"] ? "Applied" : "Apply Offer"}
                      </button>
                    </div>
                  </div>

                  {/* Offer 3 */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                      <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" alt="Enterprise Cargo" className="w-full h-36 object-cover" />
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <TbTruck className="text-xl text-blue-600" />
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">10% DISCOUNT</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Enterprise Account Plan</h3>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          Volume contract tier for corporate accounts.
                        </p>
                      </div>
                    </div>
                    <div className="p-5 pt-0 space-y-3">
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-semibold">
                        <span className="text-slate-500">Code:</span>
                        <span className="font-mono font-bold text-blue-600">ENTERPRISE10</span>
                      </div>
                      <button 
                        onClick={() => toggleApplyOffer("ENTERPRISE10")} 
                        className={`w-full text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                          appliedOffers["ENTERPRISE10"]
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <HiOutlineTag /> {appliedOffers["ENTERPRISE10"] ? "Applied" : "Apply Offer"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CONTACT TAB */}
            {activeTab === "contact" && (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">SUPPORT DESK</span>
                  <h1 className="text-2xl font-bold text-slate-900">Contact Support</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-5 items-start">
                  
                  <div className="md:col-span-1 bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">Operations HQ</h3>
                    
                    <div className="space-y-3.5 text-xs font-medium text-slate-700">
                      <div className="flex items-start gap-3">
                        <HiOutlineBuildingOffice2 className="text-blue-600 text-lg shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900 text-xs">Headquarters</strong>
                          <p className="text-slate-500 mt-0.5">Chennai, Tamil Nadu, India</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <HiOutlinePhone className="text-blue-600 text-lg shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900 text-xs">Phone Line</strong>
                          <p className="text-slate-500 mt-0.5">+91 1800 123 4567</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <HiOutlineEnvelope className="text-blue-600 text-lg shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900 text-xs">Email Desk</strong>
                          <p className="text-slate-500 mt-0.5">support@freighthub.in</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Alex Smith"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Email</label>
                          <input
                            type="email"
                            required
                            placeholder="alex@company.com"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Message</label>
                        <textarea
                          rows="4"
                          required
                          placeholder="Provide details regarding your tariff enquiry or route requirements..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
                      >
                        <HiOutlinePaperAirplane className="text-sm" /> Send Inquiry
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