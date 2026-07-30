import React, { useState, useEffect } from 'react';
import {
  FaBoxes,
  FaRocket,
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
  FaTimes,
  FaInfoCircle,
  FaLuggageCart,
  FaUser,
  FaRupeeSign
} from 'react-icons/fa';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [authModal, setAuthModal] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  const [quoteData, setQuoteData] = useState({
    origin: 'Chennai, India (MAA)',
    destination: 'Mumbai, India (BOM)',
    cargoType: 'electronics',
    shipmentMode: 'air',
    weight: 450,
    distanceKm: 1030,
  });

  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [generatedQuote, setGeneratedQuote] = useState(null);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const routeDistances = {
    'Chennai, India (MAA)': {
      'Mumbai, India (BOM)': 1030,
      'New York, USA (JFK)': 13500,
      'London, UK (LHR)': 8200,
      'Dubai, UAE (DXB)': 2900,
    },
    'Mumbai, India (BOM)': {
      'Chennai, India (MAA)': 1030,
      'New York, USA (JFK)': 12500,
      'London, UK (LHR)': 7200,
      'Dubai, UAE (DXB)': 1900,
    }
  };

  useEffect(() => {
    const dist = routeDistances[quoteData.origin]?.[quoteData.destination] || 1200;
    setQuoteData((prev) => ({ ...prev, distanceKm: dist }));
  }, [quoteData.origin, quoteData.destination]);

  const handleGenerateQuote = (e) => {
    e.preventDefault();
    const modeRates = { air: 180, ocean: 45, road: 70, rail: 50 };
    const cargoMultipliers = { general: 1.0, electronics: 1.3, hazardous: 1.75, perishable: 1.4 };

    const baseRatePerKg = modeRates[quoteData.shipmentMode] || 80;
    const cargoMult = cargoMultipliers[quoteData.cargoType] || 1.0;

    const rawCost = (quoteData.weight * baseRatePerKg * cargoMult) + (quoteData.distanceKm * 4.5);
    const fuelSurcharge = rawCost * 0.12;
    const customsHandling = 2500;
    const subtotal = rawCost + fuelSurcharge + customsHandling;
    const discountVal = subtotal * (discountPercent / 100);
    const finalTotal = subtotal - discountVal;

    setGeneratedQuote({
      baseCost: Math.round(rawCost).toLocaleString('en-IN'),
      fuelSurcharge: Math.round(fuelSurcharge).toLocaleString('en-IN'),
      customs: Math.round(customsHandling).toLocaleString('en-IN'),
      subtotal: Math.round(subtotal).toLocaleString('en-IN'),
      discount: Math.round(discountVal).toLocaleString('en-IN'),
      finalTotal: Math.round(finalTotal).toLocaleString('en-IN'),
      transitDays: quoteData.shipmentMode === 'air' ? '1-3 Days' : quoteData.shipmentMode === 'ocean' ? '12-20 Days' : '4-7 Days'
    });
  };

  const handleApplyOffer = (code, discount) => {
    setAppliedPromo(code);
    setDiscountPercent(discount);
    scrollToSection('services');
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) {
      setAuthError('Please enter your email and password.');
      return;
    }
    setIsLoggedIn(true);
    setUserEmail(authForm.email);
    setAuthModal(null);
    setAuthError('');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <FaBoxes className="text-2xl" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block leading-none">
                INTELLIGENT FREIGHT
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase block mt-1 tracking-wider">
                Calculations Engine
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-10 text-xl font-bold text-slate-700">
            {['home', 'about', 'services', 'offers', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize transition-all hover:text-blue-600 ${
                  activeSection === item ? 'text-blue-600 font-black border-b-3 border-blue-600 pb-1' : ''
                }`}
              >
                {item === 'offers' ? 'Special Offers' : item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-base font-semibold">
                <FaUser className="text-blue-600" />
                <span className="text-slate-800">{userEmail}</span>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-red-600 ml-2 font-bold hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setAuthError(''); setAuthModal('login'); }}
                  className="flex items-center gap-2 px-4 py-2 text-lg font-bold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <FaSignInAlt className="text-blue-600" /> Login
                </button>
                <button
                  onClick={() => { setAuthError(''); setAuthModal('register'); }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold transition-all shadow-md"
                >
                  <FaUserPlus /> Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="py-16 sm:py-20 px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 flex justify-start">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
                alt="Logistics Warehouse"
                className="w-full h-80 object-cover opacity-90"
              />
              <div className="p-5 bg-slate-900 text-white space-y-1">
                <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">Real-Time Calculation</span>
                <p className="text-lg font-bold">Global Logistics & Freight Engine</p>
                <p className="text-xs text-slate-400">Multi-Modal Distance & Tariff System</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              Freight Rate & Distance Calculator
            </h1>

            <p className="text-slate-600 text-xl leading-relaxed">
              Calculate accurate freight tariffs in <strong className="text-slate-800">Indian Rupee (₹)</strong> based on actual shipping distances, mode of transport, and cargo weight.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => scrollToSection('services')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold transition-all shadow-md flex items-center gap-3"
              >
                <FaCalculator /> Calculate Freight Quote
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-lg font-bold transition-all border border-slate-300"
              >
                Learn More &gt;
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-16 px-8 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-blue-600 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <FaInfoCircle /> About The System
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Trusted Freight Calculation Engine
            </h2>
            <p className="text-slate-600 text-base">Providing automated freight pricing, distance metrics, and customs tariff estimates in Indian Rupees.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <FaBoxes className="text-3xl text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Tariff Engine</h3>
              <p className="text-sm text-slate-600">Calculates shipping rates dynamically based on cargo weight and transport mode.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <FaGlobe className="text-3xl text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">Distance Matrix</h3>
              <p className="text-sm text-slate-600">Automatic route length calculation between domestic and international hubs.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <FaRupeeSign className="text-3xl text-emerald-600" />
              <h3 className="text-xl font-bold text-slate-900">INR Standard</h3>
              <p className="text-sm text-slate-600">All cost outputs strictly computed in Indian Rupee (₹) with tax breakdowns.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <FaCheckCircle className="text-3xl text-purple-600" />
              <h3 className="text-xl font-bold text-slate-900">Instant Quotes</h3>
              <p className="text-sm text-slate-600">Immediate cost summary output without page reloads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR / SERVICES */}
      <section id="services" className="py-16 px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="space-y-2">
            <span className="text-blue-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <FaLuggageCart /> Services
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Calculate Freight & Distance
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleGenerateQuote} className="lg:col-span-2 bg-slate-50 border border-slate-200 p-8 rounded-2xl space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 mb-2">
                    <FaMapMarkerAlt className="text-red-500" /> Origin Hub
                  </label>
                  <select
                    value={quoteData.origin}
                    onChange={(e) => setQuoteData({ ...quoteData, origin: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option>Chennai, India (MAA)</option>
                    <option>Mumbai, India (BOM)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 mb-2">
                    <FaMapMarkerAlt className="text-emerald-600" /> Destination Hub
                  </label>
                  <select
                    value={quoteData.destination}
                    onChange={(e) => setQuoteData({ ...quoteData, destination: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option>Mumbai, India (BOM)</option>
                    <option>Chennai, India (MAA)</option>
                    <option>New York, USA (JFK)</option>
                    <option>London, UK (LHR)</option>
                    <option>Dubai, UAE (DXB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 mb-2">
                    <FaBoxOpen className="text-amber-500" /> Cargo Type
                  </label>
                  <select
                    value={quoteData.cargoType}
                    onChange={(e) => setQuoteData({ ...quoteData, cargoType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="general">General Cargo</option>
                    <option value="electronics">Electronics</option>
                    <option value="perishable">Perishable Goods</option>
                    <option value="hazardous">Hazardous Materials</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 mb-2">
                    <FaWeightHanging className="text-blue-600" /> Cargo Weight (KG)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quoteData.weight}
                    onChange={(e) => setQuoteData({ ...quoteData, weight: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Transport Mode
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
                        className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <Icon />
                        <span className="text-base">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-blue-100/60 border border-blue-200 rounded-xl flex items-center justify-between text-base">
                <span className="text-blue-900 font-bold flex items-center gap-2">
                  <FaGlobe className="text-blue-600" /> Route Distance:
                </span>
                <span className="font-extrabold text-blue-800 text-lg">{quoteData.distanceKm.toLocaleString('en-IN')} KM</span>
              </div>

              {appliedPromo && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-sm text-emerald-800">
                  <span className="flex items-center gap-2 font-bold">
                    <FaTag /> Promo Code Applied: {appliedPromo} ({discountPercent}% Off)
                  </span>
                  <button type="button" onClick={() => { setAppliedPromo(''); setDiscountPercent(0); }} className="underline font-bold">
                    Remove
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <FaCalculator /> Calculate Freight (₹)
              </button>
            </form>

            {/* QUOTE RESULT */}
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
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
                    
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Discount ({discountPercent}%)</span>
                        <span>-₹{generatedQuote.discount}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-300 flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-lg">Total</span>
                      <span className="text-3xl font-black text-blue-600">₹{generatedQuote.finalTotal}</span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 mt-6">
                      <p className="text-xs text-slate-500 font-bold uppercase">Est. Delivery Time</p>
                      <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-600" /> {generatedQuote.transitDays}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 text-base space-y-3">
                    <FaLuggageCart className="text-4xl mx-auto text-slate-400" />
                    <p>Enter parameters and click <strong>Calculate Freight</strong>.</p>
                  </div>
                )}
              </div>

              {generatedQuote && (
                <button className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2">
                  <FaCheckCircle /> Book Freight
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* OFFERS SECTION */}
      <section id="offers" className="py-16 px-8 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <span className="text-amber-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <FaPercent /> Offers
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Active Promo Discounts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                title: 'Air Freight Promo',
                code: 'AIR2026',
                discount: 15,
                desc: '15% discount on air shipments across domestic metro lanes.',
                icon: FaPlane
              },
              {
                id: 2,
                title: 'Ocean Container Discount',
                code: 'OCEAN20',
                discount: 20,
                desc: '20% off full container load bookings.',
                icon: FaShip
              },
              {
                id: 3,
                title: 'New Account Saver',
                code: 'ENTERPRISE10',
                discount: 10,
                desc: '10% discount applied to first booking.',
                icon: FaGift
              }
            ].map((offer) => {
              const Icon = offer.icon;
              return (
                <div key={offer.id} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-blue-600">
                      <Icon className="text-2xl" />
                      <span className="text-xs font-bold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                        {offer.discount}% OFF
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{offer.title}</h3>
                    <p className="text-sm text-slate-600">{offer.desc}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Code:</span>
                      <span className="font-mono font-bold text-blue-600">{offer.code}</span>
                    </div>
                    <button
                      onClick={() => handleApplyOffer(offer.code, offer.discount)}
                      className="w-full py-3 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <FaTag /> Apply Code
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-16 px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <span className="text-blue-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <FaHeadset /> Contact
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Get In Touch
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Office Details</h3>
              <div className="space-y-4 text-base">
                <div className="flex items-start gap-3">
                  <FaBuilding className="text-blue-600 text-xl mt-1" />
                  <div>
                    <strong className="block text-slate-900">Address</strong>
                    <span className="text-slate-600">Chennai, Tamil Nadu, India</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaPhone className="text-emerald-600 text-xl mt-1" />
                  <div>
                    <strong className="block text-slate-900">Phone</strong>
                    <span className="text-slate-600">+91 1800 123 4567</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaEnvelope className="text-purple-600 text-xl mt-1" />
                  <div>
                    <strong className="block text-slate-900">Email</strong>
                    <span className="text-slate-600">support@freightcalc.in</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="lg:col-span-2 bg-slate-50 border border-slate-200 p-8 rounded-2xl space-y-5">
              {contactSuccess && (
                <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-base font-bold flex items-center gap-2">
                  <FaCheckCircle /> Inquiry submitted successfully!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-bold transition-all flex items-center gap-2"
              >
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-200 py-8 px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-base font-medium">
          <div className="flex items-center gap-3 text-white font-bold">
            <FaBoxes className="text-blue-500 text-xl" />
            <span>INTELLIGENT FREIGHT ENGINE</span>
          </div>

          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Freight Calculator. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-slate-300 text-sm font-semibold">
            <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">Services</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-8 shadow-2xl relative space-y-6">
            
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {authModal === 'login' ? 'Login' : 'Register Account'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Access calculation history and freight quotes.</p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-bold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authModal === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-all shadow-md mt-2"
              >
                {authModal === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="text-center text-sm text-slate-600">
              {authModal === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setAuthError(''); setAuthModal('register'); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button
                    onClick={() => { setAuthError(''); setAuthModal('login'); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Login here
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}