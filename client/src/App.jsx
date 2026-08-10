import React, { useState, useMemo, useEffect } from "react";
import AdminDashboard from "./components/AdminDashboard";
import {
  Rocket,
  BarChart3,
  Globe,
  Coins,
  Zap,
  Ship,
  Plane,
  Truck,
  Package,
  Trash2,
  Plus,
  Search,
  User,
  Shield,
  LogOut,
  Mail,
  Phone,
  Building2,
  Tag,
  ChevronRight,
  Calendar,
  MapPin,
  Sparkles,
  Calculator,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Check,
  HelpCircle,
  Clock,
  Percent,
  ArrowUpRight,
  Lock,
  TrendingUp,
  Layers,
  Compass,
  Activity,
  X,
  Eye,
  LayoutDashboard
} from "lucide-react";

const API_BASE = "/api";

const PORT_OPTIONS = [
  { value: "", label: "Select Port / Hub..." },
  { value: "INNSA — Nhava Sheva, Mumbai, India", label: "INNSA — Nhava Sheva, Mumbai, India" },
  { value: "BOM — Chhatrapati Shivaji Airport, Mumbai, India", label: "BOM — Chhatrapati Shivaji Airport, Mumbai, India" },
  { value: "DEL — Indira Gandhi Airport, New Delhi, India", label: "DEL — Indira Gandhi Airport, New Delhi, India" },
  { value: "MAA — Chennai Port & Airport, Tamil Nadu, India", label: "MAA — Chennai Port & Airport, Tamil Nadu, India" },
  { value: "CCU — Kolkata Port & Airport, West Bengal, India", label: "CCU — Kolkata Port & Airport, West Bengal, India" },
  { value: "COK — Cochin Port, Kerala, India", label: "COK — Cochin Port, Kerala, India" },
  { value: "AEJEA — Jebel Ali, Dubai, UAE", label: "AEJEA — Jebel Ali, Dubai, UAE" },
  { value: "DXB — Dubai International Airport, UAE", label: "DXB — Dubai International Airport, UAE" },
  { value: "NLRTM — Port of Rotterdam, Netherlands", label: "NLRTM — Port of Rotterdam, Netherlands" },
  { value: "SGSIN — Port of Singapore, Singapore", label: "SGSIN — Port of Singapore, Singapore" },
  { value: "USNYC — Port of New York & New Jersey, USA", label: "USNYC — Port of New York & New Jersey, USA" },
  { value: "DEHAM — Port of Hamburg, Germany", label: "DEHAM — Port of Hamburg, Germany" },
  { value: "GBLON — London Gateway, United Kingdom", label: "GBLON — London Gateway, United Kingdom" },
  { value: "CNSHA — Port of Shanghai, China", label: "CNSHA — Port of Shanghai, China" }
];

const PICKUP_ADDRESS_OPTIONS = [
  { value: "", label: "Select Door Pickup Hub / Depot..." },
  { value: "Door Pickup — Shipper Warehouse (Mumbai Industrial Zone)", label: "Door Pickup — Shipper Warehouse (Mumbai Industrial Zone)" },
  { value: "Inland Container Depot — ICD Tughlakabad (Delhi NCR)", label: "Inland Container Depot — ICD Tughlakabad (Delhi NCR)" },
  { value: "Cargo Terminal Warehouse — Air Cargo Complex (BOM)", label: "Cargo Terminal Warehouse — Air Cargo Complex (BOM)" },
  { value: "Port Logistics Gate 4 — Nhava Sheva (INNSA Terminal)", label: "Port Logistics Gate 4 — Nhava Sheva (INNSA Terminal)" },
  { value: "Manufacturing Hub — Sriperumbudur Industrial Estate (Chennai)", label: "Manufacturing Hub — Sriperumbudur Industrial Estate (Chennai)" },
  { value: "Customs Bonded Warehouse — ICD Whitefield (Bengaluru)", label: "Customs Bonded Warehouse — ICD Whitefield (Bengaluru)" }
];

const DELIVERY_ADDRESS_OPTIONS = [
  { value: "", label: "Select Door Delivery Hub / Depot..." },
  { value: "Door Delivery — Consignee Distribution Center (Jebel Ali Free Zone, Dubai)", label: "Door Delivery — Consignee Distribution Center (Jebel Ali Free Zone, Dubai)" },
  { value: "Inland Logistics Park — Rotterdam Waalhaven Depot", label: "Inland Logistics Park — Rotterdam Waalhaven Depot" },
  { value: "Air Express Freight Hub — Changi Cargo Complex (Singapore)", label: "Air Express Freight Hub — Changi Cargo Complex (Singapore)" },
  { value: "Port Terminal Import Yard — New York Outer Harbor", label: "Port Terminal Import Yard — New York Outer Harbor" },
  { value: "Commercial Customs Bonded Facility — Hamburg Logistics Park", label: "Commercial Customs Bonded Facility — Hamburg Logistics Park" },
  { value: "Industrial Import Zone — London Gateway Logistics Park", label: "Industrial Import Zone — London Gateway Logistics Park" }
];

const CURRENCY_CONFIG = {
  INR: { symbol: "₹", factor: 1.0, locale: "en-IN", name: "Indian Rupee" },
  USD: { symbol: "$", factor: 0.012, locale: "en-US", name: "US Dollar" },
  EUR: { symbol: "€", factor: 0.011, locale: "de-DE", name: "Euro" },
  GBP: { symbol: "£", factor: 0.0095, locale: "en-GB", name: "British Pound" },
  AED: { symbol: "AED ", factor: 0.044, locale: "en-AE", name: "UAE Dirham" }
};

const getCurrencySymbol = (code = "INR") => {
  return CURRENCY_CONFIG[code]?.symbol || "₹";
};

const INITIAL_SERVICES_FORM = {
  originPort: "",
  destinationPort: "",
  pickupAddress: "",
  deliveryAddress: "",
  readyDate: "",
  requiredDeliveryDate: "",
  mode: "ocean",
  loadType: "FCL",
  incoterm: "FOB",
  items: [
    {
      id: 1,
      packageType: "Container",
      containerType: "40HC",
      containerCount: 0,
      grossWeightKg: "0",
      commodityDescription: "",
      hsCode: ""
    }
  ],
  declaredValue: "0",
  currency: "INR",
  specialInstructions: "",
  isFragile: false,
  isHazardous: false,
  isTempControlled: false,
  addInsurance: false,
  hazardousDetails: {
    unNumber: "",
    imoClass: "",
    msdsFile: null
  },
  fullName: "",
  company: "",
  email: "",
  country: "India"
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [activeSection, setActiveSection] = useState("home");
  const [activeTab, setActiveTab] = useState("calculation");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Applied Promo Offers State
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

  // Services State for Logged-in User
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

  // Scroll spy to update navbar active item automatically
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "advertisement", "dashboard", "contact"];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId, tabName) => {
    if (tabName) setActiveTab(tabName);
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Dynamic Estimate Logic - Starts at 0, updates live as ports, cargo, mode & details change
  const estimate = useMemo(() => {
    const totalCargoCount = servicesForm.items.reduce(
      (acc, item) => acc + (Number(item.containerCount) || 0),
      0
    );
    const totalWeightNum = servicesForm.items.reduce(
      (acc, item) => acc + (Number(item.grossWeightKg) || 0),
      0
    );

    const mainSpec = servicesForm.items[0]?.containerType || servicesForm.items[0]?.packageType || "40HC";

    let containerSummary = "";
    if (servicesForm.mode === "ocean") {
      containerSummary = servicesForm.loadType === "FCL"
        ? `${totalCargoCount} × ${mainSpec}`
        : `${totalCargoCount} LCL Pkg${totalCargoCount !== 1 ? "s" : ""}`;
    } else if (servicesForm.mode === "air") {
      containerSummary = `${totalCargoCount} Air Cargo Pkg${totalCargoCount !== 1 ? "s" : ""}`;
    } else if (servicesForm.mode === "express") {
      containerSummary = `${totalCargoCount} Express Courier Pkg${totalCargoCount !== 1 ? "s" : ""}`;
    } else {
      containerSummary = `${totalCargoCount} Inland Truckload${totalCargoCount !== 1 ? "s" : ""}`;
    }

    const currCode = servicesForm.currency || "INR";
    const currCfg = CURRENCY_CONFIG[currCode] || CURRENCY_CONFIG.INR;

    if (!servicesForm.originPort || !servicesForm.destinationPort) {
      return {
        chargeBasis: "Select Origin & Destination Ports",
        containerSummary: `${totalCargoCount} Items`,
        totalWeight: `${totalWeightNum.toLocaleString()} kg`,
        seaDistance: "0 nm",
        estimatedTransit: "-",
        estArrival: "-",
        numericTotal: 0,
        estimatedTotal: `${currCfg.symbol} 0`,
        isReady: false
      };
    }

    let distNm = 1205;
    const orig = servicesForm.originPort.toLowerCase();
    const dest = servicesForm.destinationPort.toLowerCase();

    if (orig.includes("nhava") || orig.includes("mumbai") || orig.includes("innsa")) {
      if (dest.includes("jebel") || dest.includes("dubai") || dest.includes("aejea")) distNm = 1205;
      else if (dest.includes("singapore") || dest.includes("sg")) distNm = 2120;
      else if (dest.includes("rotterdam") || dest.includes("nl")) distNm = 6380;
      else if (dest.includes("los angeles") || dest.includes("lax")) distNm = 9240;
      else distNm = 1850;
    } else if (orig.includes("chennai") || orig.includes("maa")) {
      if (dest.includes("jebel") || dest.includes("dubai")) distNm = 1850;
      else if (dest.includes("singapore")) distNm = 1480;
      else distNm = 2400;
    } else if (orig.includes("delhi") || orig.includes("del")) {
      if (dest.includes("dubai")) distNm = 1180;
      else distNm = 2200;
    } else {
      distNm = 1500;
    }

    let totalItemsPrice = 0;
    let chargeBasis = "Flat Rate";
    let distanceFormatted = `${distNm.toLocaleString()} nm`;

    const SPEC_MULTIPLIER = {
      "20GP": 0.68,
      "40GP": 0.90,
      "40HC": 1.00,
      "40RF": 1.45
    };

    const PKG_MULTIPLIER = {
      "Container": 1.15,
      "Pallet": 1.05,
      "Crate": 1.10,
      "Carton": 0.90
    };

    if (servicesForm.mode === "ocean") {
      distanceFormatted = `${distNm.toLocaleString()} nm (Nautical)`;
      if (servicesForm.loadType === "FCL") {
        chargeBasis = "Per Container Spec & Distance (Ocean FCL)";
        const base40HCRate = distNm > 3000 ? 275000 : 192250;
        servicesForm.items.forEach((item) => {
          const count = Math.max(1, Number(item.containerCount) || 1);
          const weight = Math.max(0, Number(item.grossWeightKg) || 0);
          const spec = item.containerType || "40HC";
          const pkgType = item.packageType || "Container";
          const specFactor = SPEC_MULTIPLIER[spec] || 1.0;
          const pkgFactor = PKG_MULTIPLIER[pkgType] || 1.0;
          const cargoBase = count * base40HCRate * specFactor * pkgFactor;
          const weightFee = weight * 2.8;
          totalItemsPrice += cargoBase + weightFee;
        });
      } else {
        chargeBasis = "Per CBM / Weight Ton (Ocean LCL)";
        const baseLclRatePerTon = distNm > 3000 ? 42000 : 28500;
        servicesForm.items.forEach((item) => {
          const count = Math.max(1, Number(item.containerCount) || 1);
          const weight = Math.max(0, Number(item.grossWeightKg) || 0);
          const spec = item.containerType || "40HC";
          const pkgType = item.packageType || "Container";
          const specFactor = SPEC_MULTIPLIER[spec] || 1.0;
          const pkgFactor = PKG_MULTIPLIER[pkgType] || 1.0;
          const weightTons = Math.max(0.5, weight / 1000);
          totalItemsPrice += (weightTons * baseLclRatePerTon * specFactor * pkgFactor) + (count * 2500 * pkgFactor);
        });
      }
    } else if (servicesForm.mode === "air") {
      const airKm = Math.round(distNm * 0.85);
      distanceFormatted = `${airKm.toLocaleString()} km (Airway)`;
      chargeBasis = "Per Chargeable KG & Spec (Air Freight)";
      servicesForm.items.forEach((item) => {
        const count = Math.max(1, Number(item.containerCount) || 1);
        const weight = Math.max(50, Number(item.grossWeightKg) || 0);
        const spec = item.containerType || "40HC";
        const pkgType = item.packageType || "Container";
        const specFactor = SPEC_MULTIPLIER[spec] || 1.0;
        const pkgFactor = PKG_MULTIPLIER[pkgType] || 1.0;
        const distFactor = 1 + (airKm / 8000);
        const airItemCost = Math.max(18000, ((weight * 280 * distFactor) + (count * 2500)) * specFactor * pkgFactor);
        totalItemsPrice += airItemCost;
      });
    } else if (servicesForm.mode === "express") {
      const airKm = Math.round(distNm * 0.85);
      distanceFormatted = `${airKm.toLocaleString()} km (Express Flight)`;
      chargeBasis = "Priority Express Air Courier Rate";
      servicesForm.items.forEach((item) => {
        const count = Math.max(1, Number(item.containerCount) || 1);
        const weight = Math.max(20, Number(item.grossWeightKg) || 0);
        const spec = item.containerType || "40HC";
        const pkgType = item.packageType || "Container";
        const specFactor = SPEC_MULTIPLIER[spec] || 1.0;
        const pkgFactor = PKG_MULTIPLIER[pkgType] || 1.0;
        const expressItemCost = Math.max(35000, ((weight * 580) + (count * 4500)) * specFactor * pkgFactor);
        totalItemsPrice += expressItemCost;
      });
    } else if (servicesForm.mode === "ground") {
      const roadKm = Math.round(distNm * 1.15);
      distanceFormatted = `${roadKm.toLocaleString()} km (Land Corridor)`;
      chargeBasis = "Inland Truckload & Rail Distance";
      servicesForm.items.forEach((item) => {
        const count = Math.max(1, Number(item.containerCount) || 1);
        const weight = Math.max(100, Number(item.grossWeightKg) || 0);
        const spec = item.containerType || "40HC";
        const pkgType = item.packageType || "Container";
        const specFactor = SPEC_MULTIPLIER[spec] || 1.0;
        const pkgFactor = PKG_MULTIPLIER[pkgType] || 1.0;
        const groundCost = Math.max(12000, ((roadKm * 28) + (weight * 14) + (count * 4500)) * specFactor * pkgFactor);
        totalItemsPrice += groundCost;
      });
    }

    let basePriceInInr = Math.round(totalItemsPrice);

    // Incoterm adjusters
    if (servicesForm.incoterm === "EXW") basePriceInInr += 18500;
    else if (servicesForm.incoterm === "CIF") basePriceInInr += 12500;
    else if (servicesForm.incoterm === "DAP") basePriceInInr += 22000;
    else if (servicesForm.incoterm === "DDP") basePriceInInr += 38000;

    // Door pickup/delivery
    if (servicesForm.pickupAddress) basePriceInInr += 8500;
    if (servicesForm.deliveryAddress) basePriceInInr += 10500;

    // Options
    if (servicesForm.addInsurance) {
      const decVal = Number(servicesForm.declaredValue) || 0;
      basePriceInInr += decVal > 0 ? Math.max(12500, Math.round(decVal * 0.003)) : 12500;
    }
    if (servicesForm.isHazardous) basePriceInInr += 18000;
    if (servicesForm.isTempControlled) basePriceInInr += 22000;

    const transitDays = servicesForm.mode === "express" ? "1–2 d" : servicesForm.mode === "air" ? "2–4 d" : servicesForm.mode === "ground" ? "3–5 d" : `${Math.round(distNm / 200)}–${Math.round(distNm / 160)} d`;

    let estArrivalStr = "In 3 Days";
    if (servicesForm.readyDate) {
      const d = new Date(servicesForm.readyDate);
      if (!isNaN(d.getTime())) {
        const addDays = servicesForm.mode === "express" ? 2 : servicesForm.mode === "air" ? 4 : servicesForm.mode === "ground" ? 5 : Math.round(distNm / 160);
        d.setDate(d.getDate() + addDays);
        estArrivalStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      }
    }

    const finalConverted = Math.round(basePriceInInr * currCfg.factor);

    return {
      chargeBasis,
      containerSummary: totalCargoCount > 0 ? containerSummary : `${totalCargoCount} Items`,
      totalWeight: `${totalWeightNum.toLocaleString()} kg`,
      seaDistance: distanceFormatted,
      estimatedTransit: transitDays,
      estArrival: estArrivalStr,
      numericTotal: finalConverted,
      estimatedTotal: `${currCfg.symbol} ${finalConverted.toLocaleString(currCfg.locale)}`,
      isReady: true
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
          containerCount: 0,
          grossWeightKg: "0",
          commodityDescription: "",
          hsCode: ""
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setServicesForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
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
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
      if (!data.token) throw new Error("No token returned from server.");

      const token = data.token || data.access_token;
      localStorage.setItem("token", token);
      setToken(token);

      const fullName = formData.full_name || data.user?.full_name || data.full_name || data.username || formData.username || (formData.email ? formData.email.split("@")[0] : "Valued User");
      const userObj = {
        email: formData.email || data.user?.email || "user@freighthub.in",
        full_name: fullName,
        username: formData.username || data.username || fullName,
        role: data.role || authRole
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
      setShowLoginModal(false);
      setServicesForm(INITIAL_SERVICES_FORM);
      setCalculatedQuote(null);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setServicesForm(INITIAL_SERVICES_FORM);
    setCalculatedQuote(null);
  };

  const handleFreightCalculate = async (e) => {
    e.preventDefault();
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!servicesForm.originPort || !servicesForm.destinationPort || !servicesForm.readyDate) {
      alert("Please select Origin Port, Destination Port, and Cargo Ready Date.");
      return;
    }

    const totalCargoCount = servicesForm.items.reduce(
      (acc, item) => acc + (Number(item.containerCount) || 0),
      0
    );
    const totalWeight = servicesForm.items.reduce(
      (acc, item) => acc + (Number(item.grossWeightKg) || 0),
      0
    );

    if (totalCargoCount === 0 || totalWeight === 0) {
      alert("Please enter a valid Quantity and Gross Weight greater than 0.");
      return;
    }

    setCalcLoading(true);

    const firstItem = servicesForm.items[0] || {};
    const exactTotal = estimate.numericTotal || 192250;
    const currCode = servicesForm.currency || "INR";
    const currCfg = CURRENCY_CONFIG[currCode] || CURRENCY_CONFIG.INR;

    const apiPayload = {
      weight: totalWeight,
      distance: parseInt(estimate.seaDistance) || 1205,
      origin: servicesForm.originPort,
      destination: servicesForm.destinationPort,
      cargo_type: firstItem.commodityDescription || "General Cargo",
      weight_kg: totalWeight,
      mode: servicesForm.mode,
      currency: currCode,
      client_estimated_total: exactTotal,
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

    let generatedData = null;

    try {
      const res = await fetch(`${API_BASE}/calculate-freight/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(apiPayload)
      });
      if (res.ok) {
        generatedData = await res.json();
      }
    } catch (err) {
      console.log("Using client-side calculation engine:", err);
    }

    if (!generatedData || !generatedData.breakdown) {
      const baseFreight = Math.round(exactTotal * 0.68);
      const fuelSurcharge = Math.round(exactTotal * 0.15);
      const terminalHandling = Math.round(exactTotal * 0.10);
      const docCustomsFee = Math.round(exactTotal * 0.04);
      const peakSeasonFee = exactTotal - (baseFreight + fuelSurcharge + terminalHandling + docCustomsFee);

      generatedData = {
        quote_id: `QT-${servicesForm.mode.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        origin: servicesForm.originPort,
        destination: servicesForm.destinationPort,
        mode: servicesForm.mode.toUpperCase(),
        incoterm: servicesForm.incoterm,
        load_type: servicesForm.loadType,
        ready_date: servicesForm.readyDate,
        transit: estimate.estimatedTransit,
        distance: estimate.seaDistance,
        currency: currCode,
        estimated_price: exactTotal,
        breakdown: {
          base_freight: baseFreight,
          fuel_surcharge_baf: fuelSurcharge,
          terminal_handling_thc: terminalHandling,
          documentation_customs: docCustomsFee,
          peak_season_isps: peakSeasonFee,
          total_price: exactTotal
        }
      };
    }

    setCalculatedQuote(generatedData);
    setQuoteHistory((prev) => [
      {
        id: generatedData.quote_id || `QT-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: servicesForm.company || servicesForm.fullName || "Direct Shipper",
        origin: servicesForm.originPort.split("—")[0].trim(),
        destination: servicesForm.destinationPort.split("—")[0].trim(),
        mode: servicesForm.mode.toUpperCase(),
        basis: estimate.containerSummary,
        transit: estimate.estimatedTransit,
        total: exactTotal,
        currency: currCode,
        status: "Issued",
        created: "Just now"
      },
      ...prev
    ]);

    setCalcLoading(false);
    alert(`Quotation generated successfully! Total Freight Tariff: ${currCfg.symbol} ${exactTotal.toLocaleString(currCfg.locale)}`);
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

  const handlePrintQuoteDetails = (quoteItem) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Commercial Freight Quote - ${quoteItem.id || 'QT-2026-REF'}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px; }
            .badge { background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
            .val { font-size: 14px; font-weight: 700; color: #0f172a; }
            .total-box { background: #0f172a; color: white; border-radius: 16px; padding: 24px; text-align: center; margin-top: 30px; }
            .total-amt { font-size: 32px; font-weight: 900; color: #fbbf24; margin-top: 8px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">FREIGHTHUB LOGISTICS</div>
              <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-top: 4px;">Commercial Export Quotation PDF</div>
            </div>
            <div class="badge">${quoteItem.status || "Issued"}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Quote Reference ID</div>
              <div class="val">${quoteItem.id || 'QT-2026-REF'}</div>
              <div class="label" style="margin-top: 12px;">Shipper / Customer</div>
              <div class="val">${quoteItem.customer || user?.email || "Enterprise Shipper"}</div>
            </div>
            <div class="card">
              <div class="label">Route Corridor</div>
              <div class="val">${quoteItem.origin || originPort} ➔ ${quoteItem.destination || destPort}</div>
              <div class="label" style="margin-top: 12px;">Transport Mode & Basis</div>
              <div class="val">${quoteItem.mode || selectedMode} (${quoteItem.basis || containerSpec})</div>
            </div>
          </div>

          <div class="total-box">
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #94a3b8; text-transform: uppercase;">Total Freight Tariff (${servicesForm.currency || 'Currency'})</div>
            <div class="total-amt">${getCurrencySymbol(servicesForm.currency)} ${(quoteItem.total || calculatedCost?.total_cost_inr || 0).toLocaleString()}</div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 8px;">Includes Base Freight, BAF, THC & Fuel Surcharge</div>
          </div>

          <div class="footer">
            <p>This is an official commercial freight quote generated via FreightHub Intelligent Logistics Engine.</p>
            <p>Valid for 14 calendar days from date of issue. GST & Customs duties subject to statutory regulations.</p>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const isAdminUser = user?.role === "admin" || authRole === "admin";

  // --- ADMIN VIEW ---
  if (token && isAdminUser) {
    return <AdminDashboard token={token} handleLogout={handleLogout} userEmail={user?.email || "admin@freighthub.in"} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. STICKY NAVBAR */}
      <header className="bg-slate-900/95 text-white backdrop-blur-md border-b border-blue-500/30 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => scrollToSection("home")}
          >
            <div className="w-9 h-9 bg-linear-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md border border-blue-400/40 group-hover:scale-105 transition-transform duration-300">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight block leading-none text-white drop-shadow">FREIGHTHUB</span>
              <span className="text-[8px] sm:text-[9px] font-black text-blue-400 tracking-widest block mt-0.5 uppercase">
                {token ? "FREIGHT QUOTE SYSTEM" : "SMART LOGISTICS ENGINE"}
              </span>
            </div>
          </div>

          {/* Nav Items - Only shown on Commercial Home Page when NOT logged in */}
          {!token && (
            <nav className="hidden md:flex items-center gap-2 text-xs font-black">
              <button
                onClick={() => scrollToSection("home")}
                className={`transition-all py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
                  activeSection === "home" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Calculator className="w-3.5 h-3.5" /> Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className={`transition-all py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
                  activeSection === "about" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> About
              </button>
              <button
                onClick={() => scrollToSection("advertisement")}
                className={`transition-all py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
                  activeSection === "advertisement" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Tag className="w-3.5 h-3.5" /> Advertisement
              </button>
              <button
                onClick={() => scrollToSection("dashboard")}
                className={`transition-all py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
                  activeSection === "dashboard" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Dashboard
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`transition-all py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
                  activeSection === "contact" ? "text-white bg-blue-600 shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Contact Us
              </button>
            </nav>
          )}

          {/* Auth Header Buttons */}
          <div className="flex items-center gap-2">
            {token ? (
              <>
                <div className="bg-blue-950/80 border border-blue-500/40 text-blue-200 px-3 py-1 rounded-xl text-xs font-black flex items-center gap-2 shadow-inner">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="max-w-55 sm:max-w-none truncate font-bold text-white">
                    {user?.full_name || user?.username || "Shipper"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-red-600/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl border border-red-400 font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-sm border border-blue-400/50 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5" /> Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only when NOT logged in */}
        {!token && (
          <div className="md:hidden flex justify-around border-t border-slate-800 py-1.5 px-2 bg-slate-950/90 text-[11px] font-bold">
            <button onClick={() => scrollToSection("home")} className={`px-2 py-1 rounded ${activeSection === "home" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Home</button>
            <button onClick={() => scrollToSection("about")} className={`px-2 py-1 rounded ${activeSection === "about" ? "bg-blue-600 text-white" : "text-slate-300"}`}>About</button>
            <button onClick={() => scrollToSection("advertisement")} className={`px-2 py-1 rounded ${activeSection === "advertisement" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Offers</button>
            <button onClick={() => scrollToSection("dashboard")} className={`px-2 py-1 rounded ${activeSection === "dashboard" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Dashboard</button>
            <button onClick={() => scrollToSection("contact")} className={`px-2 py-1 rounded ${activeSection === "contact" ? "bg-blue-600 text-white" : "text-slate-300"}`}>Contact</button>
          </div>
        )}
      </header>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-black z-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-cyan-300" />
                <h3 className="font-black text-lg">FreightHub User Access</h3>
              </div>
              <p className="text-xs text-blue-100 font-medium">Sign in to calculate freight rates, track shipments, and generate official quotes.</p>
            </div>

            <div className="p-5">
              {authError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg justify-center text-xs font-black text-slate-800 border border-slate-200">
                  <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer py-1.5 px-2 rounded transition-all has-checked:bg-blue-600 has-checked:text-white">
                    <input type="radio" name="modalRole" checked={authRole === "user"} onChange={() => setAuthRole("user")} className="hidden" />
                    <User className="w-3.5 h-3.5" /> User Portal
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer py-1.5 px-2 rounded transition-all has-checked:bg-blue-600 has-checked:text-white">
                    <input type="radio" name="modalRole" checked={authRole === "admin"} onChange={() => setAuthRole("admin")} className="hidden" />
                    <Shield className="w-3.5 h-3.5" /> Admin Control
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
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
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
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-0.5">Email or Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter email or username"
                    value={formData.email}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-lg transition-all shadow-md text-xs flex items-center justify-center gap-1.5 uppercase mt-2"
                >
                  <span>{isRegistering ? "Register Account" : "Sign In to Portal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-3 text-center">
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthError("");
                  }}
                  className="text-xs text-blue-700 hover:text-blue-900 font-extrabold hover:underline"
                >
                  {isRegistering ? "Already registered? Sign In" : "Need an account? Register now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTINUOUS SINGLE PAGE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-12 sm:space-y-16">
        {token ? (
          /* =================================================== */
          /* LOGGED IN USER: FREIGHT QUOTE GENERATION SYSTEM    */
          /* =================================================== */
          <div className="space-y-10">
            {/* AUTHENTICATED SHIPPER HEADER BANNER */}
            <div id="dashboard-overview" className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-cyan-300 border border-blue-500/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> Authenticated Shipper Workspace
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Freight Quote Generation System</h1>
                <p className="text-xs text-slate-300 font-medium max-w-2xl">
                  Welcome back <strong className="text-white font-bold">{user?.full_name || user?.username || "Shipper"}</strong>. Select date, destination, cargo parameters and generate instant commercial freight quotes.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center min-w-27.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Saved Quotes</span>
                  <span className="text-xl font-black text-amber-400">{quoteHistory.length} Issued</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center min-w-27.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Tariff Engine</span>
                  <span className="text-xl font-black text-emerald-400">Live</span>
                </div>
              </div>
            </div>

            {/* FREIGHT CALCULATOR WORKBENCH & LIVE TRACKING */}
            <div id="freight-workbench" className="space-y-6">
              <form onSubmit={handleFreightCalculate}>
                {/* 3-COLUMN GRID LAYOUT */}
                <div className="grid lg:grid-cols-12 gap-6 items-start relative">
                  
                  {/* COLUMN 1: LEFT NAVIGATION SIDEBAR (Sticky) */}
                  <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start space-y-4">
                    <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" /> Freight Navigation
                      </div>
                      <nav className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => scrollToSection("dashboard-overview", "dashboard")}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                            activeTab === "dashboard"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToSection("freight-workbench", "calculation")}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                            activeTab === "calculation"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Calculator className="w-4 h-4" /> Calculation
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToSection("routes-section", "routes")}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                            activeTab === "routes"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Routes
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToSection("tracking-section", "tracking")}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                            activeTab === "tracking"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Package className="w-4 h-4" /> Tracking
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToSection("quote-history-section", "quotations")}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                            activeTab === "quotations"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Quotations
                          </span>
                          <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                            {quoteHistory.length}
                          </span>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* COLUMN 2: MIDDLE INPUT FORM (6 Cols - Scrollable) */}
                  <div className="lg:col-span-6 space-y-6">
                    
                    {/* STEP 1: Route Details */}
                    <div id="routes-section" className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">1</span>
                          <div>
                            <h3 className="font-black text-slate-900 text-sm sm:text-base">Route Details</h3>
                            <p className="text-[11px] font-bold text-slate-500">Origin, destination, and dispatch dates</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" /> ORIGIN PORT / HUB *
                          </label>
                          <select
                            required
                            value={servicesForm.originPort}
                            onChange={(e) => handleServicesFormChange("originPort", e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                          >
                            {PORT_OPTIONS.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-600" /> DESTINATION PORT / HUB *
                          </label>
                          <select
                            required
                            value={servicesForm.destinationPort}
                            onChange={(e) => handleServicesFormChange("destinationPort", e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                          >
                            {PORT_OPTIONS.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" /> PICKUP HUB / ADDRESS (DOOR PICKUP)
                            </label>
                            <select
                              value={servicesForm.pickupAddress}
                              onChange={(e) => handleServicesFormChange("pickupAddress", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                            >
                              {PICKUP_ADDRESS_OPTIONS.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> DELIVERY HUB / ADDRESS (DOOR DELIVERY)
                            </label>
                            <select
                              value={servicesForm.deliveryAddress}
                              onChange={(e) => handleServicesFormChange("deliveryAddress", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                            >
                              {DELIVERY_ADDRESS_OPTIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" /> CARGO READY DATE *
                            </label>
                            <input
                              type="date"
                              required
                              value={servicesForm.readyDate}
                              onChange={(e) => handleServicesFormChange("readyDate", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" /> REQUIRED DELIVERY DATE
                            </label>
                            <input
                              type="date"
                              placeholder="dd-mm-yyyy"
                              value={servicesForm.requiredDeliveryDate}
                              onChange={(e) => handleServicesFormChange("requiredDeliveryDate", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* STEP 2: Service & Commercial Terms */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">2</span>
                        <div>
                          <h3 className="font-black text-slate-900 text-sm sm:text-base">Service & Commercial Terms</h3>
                          <p className="text-[11px] font-bold text-slate-500">Transport mode and commercial terms</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-2">
                            TRANSPORT MODE *
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: "ocean", label: "Ocean Freight", Icon: Ship },
                              { id: "air", label: "Air Freight", Icon: Plane },
                              { id: "ground", label: "Ground & Rail", Icon: Truck },
                              { id: "express", label: "Express Air", Icon: Zap }
                            ].map(({ id, label, Icon }) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => handleServicesFormChange("mode", id)}
                                className={`p-2.5 rounded-2xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 ${
                                  servicesForm.mode === id
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {servicesForm.mode === "ocean" && (
                          <div className="bg-blue-50/80 border-2 border-blue-200 p-4 rounded-2xl space-y-3">
                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">OCEAN PARAMETERS</span>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">LOAD TYPE *</label>
                                <div className="flex gap-2">
                                  {["FCL", "LCL"].map((lt) => (
                                    <button
                                      key={lt}
                                      type="button"
                                      onClick={() => handleServicesFormChange("loadType", lt)}
                                      className={`flex-1 py-2 text-xs font-black rounded-xl border-2 transition-all ${
                                        servicesForm.loadType === lt
                                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                          : "bg-white text-slate-900 border-slate-300"
                                      }`}
                                    >
                                      {lt === "FCL" ? "FCL (Full Container)" : "LCL (Shared)"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">INCOTERM *</label>
                                <select
                                  value={servicesForm.incoterm}
                                  onChange={(e) => handleServicesFormChange("incoterm", e.target.value)}
                                  className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 text-xs font-black text-slate-900 focus:border-blue-600 outline-none"
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
                    </div>

                    {/* STEP 3: Cargo & Cargo Line Items */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">3</span>
                        <div>
                          <h3 className="font-black text-slate-900 text-sm sm:text-base">Cargo & Cargo Line Items</h3>
                          <p className="text-[11px] font-bold text-slate-500">Package dimensions, weights, and descriptions</p>
                        </div>
                      </div>

                      {servicesForm.items.map((item, idx) => (
                        <div key={item.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-black text-slate-900 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                              <Package className="w-3.5 h-3.5 text-blue-600" /> ITEM #{String(idx + 1).padStart(2, "0")}
                            </span>
                            {servicesForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-xs text-red-600 font-extrabold flex items-center gap-1 hover:underline"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">PACKAGE TYPE *</label>
                              <select
                                value={item.packageType}
                                onChange={(e) => handleItemChange(idx, "packageType", e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                              >
                                <option>Container</option>
                                <option>Pallet</option>
                                <option>Carton</option>
                                <option>Crate</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">CONTAINER SPEC *</label>
                              <select
                                value={item.containerType}
                                onChange={(e) => handleItemChange(idx, "containerType", e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                              >
                                <option value="40HC">40HC — High Cube Container</option>
                                <option value="20GP">20GP — General Purpose</option>
                                <option value="40GP">40GP — General Purpose</option>
                                <option value="40RF">40RF — Reefer</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">QUANTITY / COUNT *</label>
                              <input
                                type="number"
                                min="0"
                                value={item.containerCount}
                                onChange={(e) => handleItemChange(idx, "containerCount", e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">GROSS WEIGHT (KG) *</label>
                              <input
                                type="number"
                                min="0"
                                required
                                placeholder="0"
                                value={item.grossWeightKg}
                                onChange={(e) => handleItemChange(idx, "grossWeightKg", e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">COMMODITY DESCRIPTION *</label>
                              <input
                                type="text"
                                required
                                placeholder="Cotton textile rolls, unbleached"
                                value={item.commodityDescription}
                                onChange={(e) => handleItemChange(idx, "commodityDescription", e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">HS CODE</label>
                              <input
                                type="text"
                                placeholder="5208.11"
                                value={item.hsCode}
                                onChange={(e) => handleItemChange(idx, "hsCode", e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full py-2.5 border-2 border-dashed border-blue-400 rounded-2xl text-blue-700 hover:bg-blue-50 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add Line Item
                      </button>
                    </div>

                    {/* STEP 4: Additional Details */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">4</span>
                        <div>
                          <h3 className="font-black text-slate-900 text-sm sm:text-base">Additional Details</h3>
                          <p className="text-[11px] font-bold text-slate-500">Value, handling and special requirements</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">
                              DECLARED VALUE
                            </label>
                            <input
                              type="text"
                              placeholder="0.00"
                              value={servicesForm.declaredValue}
                              onChange={(e) => handleServicesFormChange("declaredValue", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              CURRENCY * <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">NEW</span>
                            </label>
                            <select
                              value={servicesForm.currency}
                              onChange={(e) => handleServicesFormChange("currency", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            >
                              <option value="INR">INR — Indian Rupee</option>
                              <option value="USD">USD — US Dollar</option>
                              <option value="EUR">EUR — Euro</option>
                              <option value="AED">AED — UAE Dirham</option>
                              <option value="GBP">GBP — British Pound</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">
                            SPECIAL INSTRUCTIONS (OPTIONAL)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. call before delivery"
                            value={servicesForm.specialInstructions}
                            onChange={(e) => handleServicesFormChange("specialInstructions", e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none resize-none"
                          />
                        </div>

                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={servicesForm.isFragile}
                              onChange={(e) => handleServicesFormChange("isFragile", e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            Fragile goods
                          </label>

                          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={servicesForm.isHazardous}
                              onChange={(e) => handleServicesFormChange("isHazardous", e.target.checked)}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                            />
                            Hazardous materials
                          </label>

                          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={servicesForm.isTempControlled}
                              onChange={(e) => handleServicesFormChange("isTempControlled", e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            Temperature controlled
                          </label>

                          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={servicesForm.addInsurance}
                              onChange={(e) => handleServicesFormChange("addInsurance", e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            Add cargo insurance
                          </label>
                        </div>

                        {/* Conditional Hazardous Box */}
                        {servicesForm.isHazardous && (
                          <div className="border-2 border-amber-300 bg-amber-50/70 p-4 rounded-2xl space-y-3">
                            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                              HAZARDOUS TICKED — THESE THREE BECOME REQUIRED
                            </span>
                            <div className="grid sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  UN NUMBER * <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">NEW</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="UN1234"
                                  value={servicesForm.hazardousDetails.unNumber}
                                  onChange={(e) =>
                                    setServicesForm((prev) => ({
                                      ...prev,
                                      hazardousDetails: { ...prev.hazardousDetails, unNumber: e.target.value }
                                    }))
                                  }
                                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  IMO CLASS * <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">NEW</span>
                                </label>
                                <select
                                  value={servicesForm.hazardousDetails.imoClass}
                                  onChange={(e) =>
                                    setServicesForm((prev) => ({
                                      ...prev,
                                      hazardousDetails: { ...prev.hazardousDetails, imoClass: e.target.value }
                                    }))
                                  }
                                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none"
                                >
                                  <option value="">Select...</option>
                                  <option value="Class 3">Class 3 — Flammable Liquids</option>
                                  <option value="Class 8">Class 8 — Corrosive Substances</option>
                                  <option value="Class 9">Class 9 — Miscellaneous Dangerous Goods</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  MSDS * <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">NEW</span>
                                </label>
                                <input
                                  type="file"
                                  className="w-full text-xs font-bold text-slate-700 bg-white border-2 border-amber-300 rounded-xl p-1.5 outline-none file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-amber-500 file:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STEP 5: Contact Details */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">5</span>
                        <div>
                          <h3 className="font-black text-slate-900 text-sm sm:text-base">Contact Details</h3>
                          <p className="text-[11px] font-bold text-slate-500">Who receives the quotation</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">FULL NAME *</label>
                            <input
                              type="text"
                              required
                              placeholder="Priya Sharma"
                              value={servicesForm.fullName}
                              onChange={(e) => handleServicesFormChange("fullName", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">COMPANY *</label>
                            <input
                              type="text"
                              placeholder="Company name"
                              value={servicesForm.company}
                              onChange={(e) => handleServicesFormChange("company", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">EMAIL *</label>
                            <input
                              type="email"
                              required
                              placeholder="you@company.com"
                              value={servicesForm.email}
                              onChange={(e) => handleServicesFormChange("email", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              COUNTRY * <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">NEW</span>
                            </label>
                            <select
                              value={servicesForm.country}
                              onChange={(e) => handleServicesFormChange("country", e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            >
                              <option value="India">India</option>
                              <option value="United Arab Emirates">United Arab Emirates</option>
                              <option value="United States">United States</option>
                              <option value="Singapore">Singapore</option>
                              <option value="Netherlands">Netherlands</option>
                              <option value="Germany">Germany</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* COLUMN 3: RIGHT LIVE ESTIMATE CALCULATION BOX (Sticky) */}
                  <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start space-y-4">
                    <div className="bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 border-2 border-slate-800 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span className="font-black text-xs uppercase text-slate-100 tracking-wider">LIVE ESTIMATE</span>
                        </div>
                        <span className="bg-blue-600/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          REALTIME
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs font-semibold text-slate-300">
                        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                          <span className="text-slate-400">Charge Basis</span>
                          <span className="text-white font-black">{estimate.chargeBasis}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                          <span className="text-slate-400">Cargo Count</span>
                          <span className="text-white font-black">{estimate.containerSummary}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                          <span className="text-slate-400">Total Weight</span>
                          <span className="text-white font-black">{estimate.totalWeight}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                          <span className="text-slate-400">Est. Distance</span>
                          <span className="text-white font-black">{estimate.seaDistance}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                          <span className="text-slate-400">Est. Transit</span>
                          <span className="text-white font-black">{estimate.estimatedTransit}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-slate-400">Est. Arrival</span>
                          <span className="text-white font-black">{estimate.estArrival}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          ESTIMATED TARIFF TOTAL
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight my-1">
                          {estimate.estimatedTotal}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold">
                          ◆ Indicative Base Calculation (Excludes Taxes & Customs)
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={calcLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        {calcLoading ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" /> Generating...
                          </>
                        ) : (
                          <>
                            → GENERATE FULL QUOTATION
                          </>
                        )}
                      </button>

                      {calculatedQuote && (
                        <div className="bg-emerald-950/90 border-2 border-emerald-500/60 p-4 rounded-2xl text-left space-y-3 shadow-xl">
                          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ISSUED QUOTATION
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-300 font-mono">
                              {calculatedQuote.quote_id}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px] font-semibold text-emerald-100">
                            <div className="flex justify-between">
                              <span className="text-emerald-400">Base Freight:</span>
                              <span>{CURRENCY_CONFIG[servicesForm.currency || "INR"]?.symbol} {(calculatedQuote.breakdown?.base_freight || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-400">Fuel Surcharge (BAF):</span>
                              <span>{CURRENCY_CONFIG[servicesForm.currency || "INR"]?.symbol} {(calculatedQuote.breakdown?.fuel_surcharge_baf || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-400">Terminal Handling (THC):</span>
                              <span>{CURRENCY_CONFIG[servicesForm.currency || "INR"]?.symbol} {(calculatedQuote.breakdown?.terminal_handling_thc || 0).toLocaleString()}</span>
                            </div>
                            {calculatedQuote.breakdown?.documentation_customs > 0 && (
                              <div className="flex justify-between">
                                <span className="text-emerald-400">Doc & Customs Fee:</span>
                                <span>{CURRENCY_CONFIG[servicesForm.currency || "INR"]?.symbol} {calculatedQuote.breakdown.documentation_customs.toLocaleString()}</span>
                              </div>
                            )}
                            {calculatedQuote.breakdown?.peak_season_isps > 0 && (
                              <div className="flex justify-between">
                                <span className="text-emerald-400">Security & ISPS:</span>
                                <span>{CURRENCY_CONFIG[servicesForm.currency || "INR"]?.symbol} {calculatedQuote.breakdown.peak_season_isps.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-emerald-800 text-xs font-black text-amber-300">
                              <span>TOTAL QUOTATION TARIFF:</span>
                              <span>{CURRENCY_CONFIG[servicesForm.currency || "INR"]?.symbol} {(calculatedQuote.breakdown?.total_price || 0).toLocaleString()}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePrintQuoteDetails({
                              id: calculatedQuote.quote_id,
                              customer: servicesForm.company || servicesForm.fullName || "Direct Shipper",
                              origin: servicesForm.originPort,
                              destination: servicesForm.destinationPort,
                              mode: servicesForm.mode.toUpperCase(),
                              basis: estimate.containerSummary,
                              total: calculatedQuote.breakdown?.total_price,
                              currency: servicesForm.currency || "INR",
                              status: "Issued"
                            })}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2 rounded-xl text-[11px] uppercase flex items-center justify-center gap-1.5 transition-all shadow-md mt-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Official PDF Quote
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </form>
            </div>

            {/* LIVE SHIPMENT TRACKING CONSOLE */}
            <div id="tracking-section" className="mt-8 pt-6 border-t border-slate-200">
              <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-800 space-y-5 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center font-black border border-cyan-500/30">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base uppercase text-white tracking-wide">Live Container Shipment Tracking</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Enter Tracking Number (e.g. FH-99201) to trace real-time status</p>
                    </div>
                  </div>

                  {/* Pulsing Live Radar Indicator */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-[10px] font-black text-cyan-400 self-start sm:self-auto">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                    RADAR ACTIVE
                  </div>
                </div>

                <form onSubmit={handleTrackShipment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Tracking ID (e.g. FH-99201)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1 bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white placeholder-slate-500 focus:border-cyan-400 outline-none shadow-inner"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shrink-0 transition-all active:scale-95 shadow-md uppercase tracking-wider"
                  >
                    <Search className="w-4 h-4" /> Track Container
                  </button>
                </form>

                {trackingResult && (
                  <div className="bg-slate-900 border border-cyan-500/40 p-5 rounded-2xl text-xs space-y-3 shadow-inner">
                    <div className="flex justify-between items-center text-cyan-300 font-mono font-bold">
                      <span>ID: {trackingResult.tracking_id}</span>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                        {trackingResult.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-300 pt-3 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-black tracking-wider">Current Location</span>
                        <strong className="text-white text-xs">{trackingResult.current_location}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-black tracking-wider">Carrier Vessel</span>
                        <strong className="text-white text-xs">{trackingResult.carrier}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-black tracking-wider">Estimated Arrival</span>
                        <strong className="text-emerald-400 text-xs">{trackingResult.estimated_delivery}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* SAVED COMMERCIAL QUOTATION HISTORY & ISSUED PDFS */}
          <div id="quote-history-section" className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-tr from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center font-black shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Commercial Quotation History & Issued PDFs</h3>
                  <p className="text-xs text-slate-500 font-bold">Export, print, and review all active freight quote records</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-semibold text-slate-800">
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Quote ID</th>
                    <th className="p-3.5">Shipper</th>
                    <th className="p-3.5">Route</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Tariff ({servicesForm.currency || 'Currency'})</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {quoteHistory.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-black text-blue-700">{q.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{q.customer}</td>
                      <td className="p-3.5 text-slate-700">{q.origin} ➔ {q.destination}</td>
                      <td className="p-3.5"><span className="bg-slate-100 border border-slate-300 text-slate-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold">{q.mode}</span></td>
                      <td className="p-3.5 font-black text-slate-900">{getCurrencySymbol(q.currency || servicesForm.currency)} {(q.total || 0).toLocaleString()}</td>
                      <td className="p-3.5"><span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">{q.status}</span></td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handlePrintQuoteDetails(q)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-[11px] shadow-sm transition-all active:scale-95 inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* =================================================== */
        /* PUBLIC COMMERCIAL HOME PAGE                        */
        /* =================================================== */
        <>
          {/* SECTION 1: HOME (COMMERCIAL HERO ONLY) */}
          <section id="home" className="scroll-mt-20 space-y-8">
            <div className="bg-linear-to-br from-white via-slate-50 to-blue-50/30 rounded-3xl p-6 sm:p-10 border-2 border-slate-200/80 shadow-lg grid lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="lg:col-span-5 relative group">
                <div className="absolute -top-3 -right-2 z-20 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-lg transform rotate-3 flex items-center gap-1.5 border border-white/20">
                  <Zap className="w-3.5 h-3.5 text-amber-300" /> INSTANT TARIFFS 2026
                </div>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group-hover:shadow-blue-500/10 transition-all duration-500 transform -rotate-1 group-hover:rotate-0">
                  <img
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                    alt="Warehouse & Cargo Logistics"
                    className="w-full h-56 sm:h-72 lg:h-88 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent p-5 sm:p-6 text-white">
                    <p className="text-[10px] font-black tracking-widest uppercase text-cyan-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> MULTI-MODAL LOGISTICS ENGINE
                    </p>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1">Port Distance & Freight Calculator</h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">Calculated with Multi-Currency & Itemized Tariffs</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-900 border border-blue-300/80 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  <Tag className="w-3.5 h-3.5 text-blue-700" /> ENTERPRISE LOGISTICS PORTAL
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  Automated Freight Management & Port Distance Matrix
                </h1>

                <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                  FreightHub delivers automated port-to-port ocean, air, and ground transport freight pricing. All calculations are computed in your selected currency with full itemized breakdowns for commercial logistics teams.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
                  >
                    <User className="w-4 h-4" /> Sign In / Register to Access Freight System
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

        {/* SECTION 2: ABOUT (SYSTEM DETAILS & CORE CAPABILITIES) */}
        <section id="about" className="scroll-mt-20 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-md space-y-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
            <div className="w-11 h-11 bg-linear-to-br from-indigo-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-black shadow-md transform -rotate-1">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">About Intelligent Freight System</h2>
              <p className="text-xs text-slate-500 font-bold">Automated Quotation Architecture & Port Distance Engine</p>
            </div>
          </div>

          {/* ASYMMETRIC BENTO GRID layout for capabilities */}
          <div className="grid md:grid-cols-12 gap-5">
            {/* Card 1: Dark Elevated Arch (5 cols) */}
            <div className="md:col-span-5 bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-6 rounded-3xl border-2 border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-blue-500/20 text-cyan-400 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="bg-blue-900/80 text-cyan-300 border border-blue-500/30 text-[10px] font-mono font-black px-2.5 py-1 rounded-full uppercase">
                    NAUTICAL MATRIX
                  </span>
                </div>
                <h3 className="font-black text-white text-lg">Global Port Distance Matrix</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Calculates precise nautical and airway distances between major Indian hubs (Nhava Sheva, Mumbai BOM, Delhi DEL, Chennai MAA) and global international gateways.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-[10px] text-cyan-400 font-mono font-black">
                <Check className="w-3.5 h-3.5" /> 14 International Trade Corridors Monitored
              </div>
            </div>

            {/* Card 2: Light Skewed Card (7 cols) */}
            <div className="md:col-span-7 bg-linear-to-br from-indigo-50/90 via-blue-50/60 to-white border-2 border-indigo-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-md">
                    <Coins className="w-5 h-5" />
                  </div>
                  <span className="bg-amber-100 text-slate-900 border border-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    TRANSPARENT TARIFFS
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-lg">Transparent Multi-Currency Tariff Breakdown</h3>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  Computes base ocean/air tariffs, bunker adjustment factors (BAF), terminal handling charges (THC), and fuel surcharges in your selected currency with itemized audit records.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-black text-indigo-900">
                <Zap className="w-4 h-4 text-amber-500" /> Automated Currency & Fuel Adjustment Engine
              </div>
            </div>

            {/* Card 3: Horizontal Pill Ribbon (12 cols) */}
            <div className="md:col-span-12 bg-linear-to-r from-emerald-50 via-teal-50/40 to-white border-2 border-emerald-200/80 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shrink-0 shadow-md">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Automated Commercial Quotation Engine</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                    Generates instant export-ready quote PDFs and records historical quotation logs for commercial auditing and freight forwarder compliance.
                  </p>
                </div>
              </div>
              <span className="bg-emerald-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-sm shrink-0 self-start sm:self-auto uppercase tracking-wide">
                100% Audit Compliance
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: ADVERTISEMENT & SPECIAL OFFERS (TICKET STUB NOTCHES) */}
        <section id="advertisement" className="scroll-mt-20 space-y-6">
          <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-md transform rotate-2">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Logistics Special Offers & Promo Coupons</h2>
                  <p className="text-xs text-blue-200 font-medium">Seasonal container discounts and volume freight incentives</p>
                </div>
              </div>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto shadow-sm">
                Exclusive Deals 2026
              </span>
            </div>

            {/* TICKET COUPONS GRID WITH SIDE CIRCULAR NOTCHES */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  code: "OCEAN15",
                  title: "15% Off Ocean FCL Shipments",
                  desc: "Save 15% on all 40HC and 20GP container routes from Nhava Sheva to Jebel Ali & Rotterdam.",
                  valid: "Valid till 31 Aug 2026"
                },
                {
                  code: "AIRFREIGHT20",
                  title: "Flat Discount Off Air Freight",
                  desc: "Applies to express air cargo bookings exceeding 500 kg chargeable weight from BOM or DEL.",
                  valid: "Valid till 15 Sep 2026"
                },
                {
                  code: "FIRSTSHIP",
                  title: "Zero Customs Doc Fee",
                  desc: "Complimentary customs clearance paperwork filing for all first-time registered shippers.",
                  valid: "New User Incentive"
                }
              ].map((promo) => (
                <div
                  key={promo.code}
                  className="relative bg-slate-950/95 border-2 border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl overflow-hidden group hover:border-blue-500/50 transition-all"
                >
                  {/* Left & Right Circular Notch Cuts for Coupon Look */}
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-800"></div>
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-800"></div>

                  <div className="space-y-3 px-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-black px-3 py-1 rounded-full shadow-inner">
                        PROMO: {promo.code}
                      </span>
                      <span className="text-[10px] text-amber-400 font-extrabold">{promo.valid}</span>
                    </div>

                    <h3 className="font-black text-white text-base leading-snug">{promo.title}</h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{promo.desc}</p>
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-b-2 border-dashed border-slate-800 my-1"></div>

                  <button
                    onClick={() => toggleApplyOffer(promo.code)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
                      appliedOffers[promo.code]
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {appliedOffers[promo.code] ? (
                      <>
                        <Check className="w-4 h-4" /> Promo Code Applied!
                      </>
                    ) : (
                      <>
                        <Tag className="w-4 h-4" /> Apply Offer to Account
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: DASHBOARD FOR ATTRACTION / REFERENCE */}
        <section id="dashboard" className="scroll-mt-20 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-black shadow-md">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Reference Logistics Dashboard</h2>
                <p className="text-xs text-slate-500 font-bold">Public Market Analytics & Transport Tariff Benchmarks</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase self-start sm:self-auto shadow-sm">
              Market Index 2026
            </span>
          </div>

          {/* ASYMMETRICAL STAT CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stat 1: Dark Ocean Index Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border-2 border-slate-800 shadow-lg space-y-2 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Average Ocean Freight Index</span>
              <div className="text-2xl font-black text-white">₹ 1,92,250 <span className="text-xs font-bold text-emerald-400">↓ 4.2%</span></div>
              <p className="text-[10px] text-slate-400 font-medium">Per 40HC Container (Nhava Sheva to Jebel Ali)</p>
            </div>

            {/* Stat 2: Soft Blue Air Tariff Pill Card */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-5 space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Air Freight Tariff Index</span>
              <div className="text-2xl font-black text-slate-900">₹ 250 / kg <span className="text-xs font-bold text-blue-600">↑ 1.8%</span></div>
              <p className="text-[10px] text-slate-600 font-semibold">Chargeable Weight (BOM to Dubai DXB)</p>
            </div>

            {/* Stat 3: Emerald SLA Status Card */}
            <div className="bg-linear-to-br from-emerald-950 to-slate-900 text-white border-2 border-emerald-500/40 rounded-3xl p-5 space-y-2 shadow-lg">
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">Global Transit Efficiency</span>
              <div className="text-2xl font-black text-white">98.4% <span className="text-xs font-bold text-emerald-400">On-Time</span></div>
              <p className="text-[10px] text-slate-300 font-medium">Port-to-Port SLA Tracking Metric</p>
            </div>

            {/* Stat 4: Amber Trade Corridors Card */}
            <div className="bg-amber-50/90 border-2 border-amber-200 rounded-3xl p-5 space-y-2 shadow-sm">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Monitored Trade Corridors</span>
              <div className="text-2xl font-black text-slate-900">14 Major Ports</div>
              <p className="text-[10px] text-slate-600 font-semibold">India, Gulf, Europe, Singapore & US</p>
            </div>
          </div>

          {/* Reference Rate Comparison Table */}
          <div className="bg-slate-50/90 rounded-3xl p-5 border-2 border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Reference Corridor Tariff Matrix (INR)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-semibold text-slate-800">
                <thead className="bg-slate-200/80 text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Origin Hub</th>
                    <th className="p-3">Destination Gateway</th>
                    <th className="p-3">Transport Mode</th>
                    <th className="p-3">Transit Time</th>
                    <th className="p-3">Benchmark Rate (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-3 font-bold">INNSA (Nhava Sheva, India)</td>
                    <td className="p-3">AEJEA (Jebel Ali, Dubai)</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[10px] font-black">Ocean FCL</span></td>
                    <td className="p-3">6–10 Days</td>
                    <td className="p-3 font-black text-slate-900">₹ 1,92,250</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">BOM (Mumbai Airport, India)</td>
                    <td className="p-3">DXB (Dubai Airport, UAE)</td>
                    <td className="p-3"><span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-[10px] font-black">Air Cargo</span></td>
                    <td className="p-3">2–4 Days</td>
                    <td className="p-3 font-black text-slate-900">₹ 250 / kg</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">INNSA (Nhava Sheva, India)</td>
                    <td className="p-3">NLRTM (Rotterdam, Netherlands)</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[10px] font-black">Ocean FCL</span></td>
                    <td className="p-3">24–28 Days</td>
                    <td className="p-3 font-black text-slate-900">₹ 2,15,800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 5: CONTACT US (FOOTER AREA) */}
        <section id="contact" className="scroll-mt-20 bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border-2 border-slate-800 shadow-2xl space-y-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Contact FreightHub Support</h2>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Have custom enterprise shipping inquiries, API integration questions, or contract freight forwarder requests? Get in touch with our commercial operations team.
              </p>

              <div className="space-y-3 text-xs text-slate-300 font-semibold pt-2">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>FreightHub Center, Bandra-Kurla Complex (BKC), Mumbai, 400051</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>+91 (022) 8800-4492 / Commercial Support Desk</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>support@freighthub.in / rates@freighthub.in</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 space-y-4 shadow-xl">
              <h3 className="font-black text-base text-white">Send Us a Direct Inquiry</h3>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your freight inquiry..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:border-blue-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Submit Support Inquiry
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500 font-bold">
            © 2026 FreightHub Intelligent Logistics Management System. All rights reserved.
          </div>
        </section>
        </>
      )}
      </main>
    </div>
  );
}
