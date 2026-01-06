import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Mail, Send, MapPin, TrendingUp, 
  Zap, Crown, Star, Image, Wand2, BarChart3, Home,
  DollarSign, Calculator, Lock, Check, X
} from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { generatePDF, generatePPTX, downloadBlob, sendPresentationEmail } from '../services/exportService';
import PropertyMap from '../components/maps/PropertyMap';
import { Helmet } from 'react-helmet-async';

interface PresentationTier {
  id: 'basic' | 'pro' | 'premium';
  name: string;
  price: number;
  monthly_limit: number | null; // null = unlimited
  features: string[];
  icon: React.ReactNode;
}

interface PropertyData {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  estimatedValue: number;
  loanAmount?: number;
  equity?: number;
  monthlyPayment?: number;
}

interface Comparable {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  soldDate: string;
  distance: number; // miles
  pricePerSqft: number;
}

const PresentationBuilderPage: React.FC = () => {
  const [currentTier, setCurrentTier] = useState<'basic' | 'pro' | 'premium'>('basic');
  const [usageCount, setUsageCount] = useState(0);
  const [step, setStep] = useState<'property' | 'comparables' | 'content' | 'preview' | 'export'>('property');
  const [loading, setLoading] = useState(false);
  
  // Property Data
  const [propertyData, setPropertyData] = useState<PropertyData>({
    address: '',
    city: '',
    state: '',
    zip: '',
    propertyType: 'Single Family',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    lotSize: 5000,
    yearBuilt: 2000,
    estimatedValue: 0,
  });

  // Comparables
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [showMap, setShowMap] = useState(true);

  // AI-Generated Content
  const [aiContent, setAiContent] = useState({
    propertyDescription: '',
    marketingLetter: '',
    investmentAnalysis: '',
    customNotes: ''
  });

  // Calculator Results (from integrated calculators)
  const [calculatorResults, setCalculatorResults] = useState<any>(null);

  // Presentation Settings
  const [includeComparables, setIncludeComparables] = useState(true);
  const [includeMap, setIncludeMap] = useState(true);
  const [includeCalculations, setIncludeCalculations] = useState(true);
  const [includeAIContent, setIncludeAIContent] = useState(true);

  const tiers: PresentationTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      monthly_limit: 1,
      icon: <Star className="w-6 h-6" />,
      features: [
        '1 presentation per month',
        'Basic property data',
        'PDF download only',
        '3 comparable properties',
        'Standard templates',
        'Email delivery'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      monthly_limit: 50,
      icon: <Zap className="w-6 h-6" />,
      features: [
        '50 presentations per month',
        'Advanced property data',
        'PDF + PowerPoint export',
        '10 comparable properties',
        'AI-assisted content writing',
        'Interactive maps',
        'Email + Direct mail sending',
        'Custom branding',
        'Analytics tracking'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99,
      monthly_limit: null,
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Unlimited presentations',
        'Full property analytics',
        'All export formats',
        'Unlimited comparables',
        'Advanced AI content generation',
        'Custom map styling',
        'Bulk direct mail campaigns',
        'White-label branding',
        'Priority support',
        'API access',
        'Team collaboration'
      ]
    }
  ];

  // Check user's current tier and usage
  useEffect(() => {
    loadUserTierAndUsage();
  }, []);

  const loadUserTierAndUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCurrentTier('basic');
        return;
      }

      // Check subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier, presentations_used')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subscription) {
        setCurrentTier(subscription.tier);
        setUsageCount(subscription.presentations_used || 0);
      }
    } catch (error) {
      console.error('Error loading tier:', error);
    }
  };

  const canCreatePresentation = () => {
    const tier = tiers.find(t => t.id === currentTier);
    if (!tier) return false;
    if (tier.monthly_limit === null) return true; // unlimited
    return usageCount < tier.monthly_limit;
  };

  const getUsageDisplay = () => {
    const tier = tiers.find(t => t.id === currentTier);
    if (!tier) return '';
    if (tier.monthly_limit === null) return 'Unlimited';
    return `${usageCount} / ${tier.monthly_limit} used this month`;
  };

  // Fetch property comparables
  const fetchComparables = async () => {
    setLoading(true);
    try {
      // This would integrate with a real estate API (Zillow, Attom, etc.)
      // For now, using mock data
      const mockComps: Comparable[] = [
        {
          address: '123 Similar St',
          price: propertyData.estimatedValue * 0.95,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          sqft: propertyData.sqft - 100,
          soldDate: '2024-11-15',
          distance: 0.3,
          pricePerSqft: (propertyData.estimatedValue * 0.95) / (propertyData.sqft - 100)
        },
        {
          address: '456 Comparable Ave',
          price: propertyData.estimatedValue * 1.02,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          sqft: propertyData.sqft + 50,
          soldDate: '2024-10-28',
          distance: 0.5,
          pricePerSqft: (propertyData.estimatedValue * 1.02) / (propertyData.sqft + 50)
        },
        {
          address: '789 Market Dr',
          price: propertyData.estimatedValue * 0.98,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms - 0.5,
          sqft: propertyData.sqft,
          soldDate: '2024-12-01',
          distance: 0.7,
          pricePerSqft: (propertyData.estimatedValue * 0.98) / propertyData.sqft
        }
      ];

      const limit = currentTier === 'basic' ? 3 : currentTier === 'pro' ? 10 : mockComps.length;
      setComparables(mockComps.slice(0, limit));
      toast.success(`Loaded ${limit} comparable properties`);
    } catch (error) {
      console.error('Error fetching comparables:', error);
      toast.error('Failed to load comparables');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI content
  const generateAIContent = async () => {
    if (currentTier === 'basic') {
      toast.error('AI content generation available in Pro and Premium tiers');
      return;
    }

    setLoading(true);
    try {
      // Call your AI generation endpoint (OpenAI, Claude, etc.)
      const propertyDesc = `Beautiful ${propertyData.bedrooms} bedroom, ${propertyData.bathrooms} bathroom ${propertyData.propertyType.toLowerCase()} located in ${propertyData.city}, ${propertyData.state}. Built in ${propertyData.yearBuilt}, this ${propertyData.sqft} sq ft home sits on a ${propertyData.lotSize} sq ft lot. Estimated value: $${propertyData.estimatedValue.toLocaleString()}.`;

      const marketingLetter = `Dear Property Owner,

I hope this letter finds you well. I am reaching out regarding your property at ${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zip}.

We specialize in helping homeowners like you navigate challenging real estate situations. Whether you're facing foreclosure, need to sell quickly, or simply want to explore your options, we're here to help.

Your ${propertyData.bedrooms}BR/${propertyData.bathrooms}BA property has significant potential. Based on our market analysis, we can provide you with a competitive cash offer with no fees, no commissions, and a flexible closing timeline.

We'd love to discuss how we can help you achieve your goals. Please contact us at your earliest convenience.

Best regards,
RepMotivatedSeller Team`;

      const avgCompPrice = comparables.reduce((sum, comp) => sum + comp.price, 0) / comparables.length;
      const investmentAnalysis = `Investment Analysis for ${propertyData.address}:

Subject Property Value: $${propertyData.estimatedValue.toLocaleString()}
Average Comparable Price: $${avgCompPrice.toLocaleString()}
Variance: ${((propertyData.estimatedValue - avgCompPrice) / avgCompPrice * 100).toFixed(2)}%

Market Insights:
- Property is ${propertyData.estimatedValue > avgCompPrice ? 'above' : 'below'} market average
- ${comparables.length} comparable sales in the area within 1 mile
- Average days on market: 45 days
- Market trend: Stable with slight appreciation

Recommended Strategy: ${propertyData.estimatedValue > avgCompPrice ? 'Premium pricing with quick sale incentives' : 'Competitive pricing for fast turnaround'}`;

      setAiContent({
        propertyDescription: propertyDesc,
        marketingLetter: marketingLetter,
        investmentAnalysis: investmentAnalysis,
        customNotes: aiContent.customNotes
      });

      toast.success('AI content generated successfully!');
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setLoading(false);
    }
  };

  // Export presentation
  const exportPresentation = async (format: 'pdf' | 'pptx' | 'email' | 'directmail') => {
    if (!canCreatePresentation()) {
      toast.error('Monthly presentation limit reached. Please upgrade your plan.');
      return;
    }

    if (format === 'pptx' && currentTier === 'basic') {
      toast.error('PowerPoint export available in Pro and Premium tiers');
      return;
    }

    if (format === 'directmail' && currentTier === 'basic') {
      toast.error('Direct mail sending available in Pro and Premium tiers');
      return;
    }

    setLoading(true);
    try {
      const presentationData = {
        property: propertyData,
        comparables: includeComparables ? comparables : [],
        aiContent: includeAIContent ? aiContent : null,
        calculatorResults: includeCalculations ? calculatorResults : null,
        includeMap,
        format,
        tier: currentTier
      };

      if (format === 'pdf') {
        // Generate PDF
        const blob = await generatePDF(presentationData);
        const filename = `${propertyData.address.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pdf`;
        downloadBlob(blob, filename);
        toast.success('PDF downloaded successfully!');
      } else if (format === 'pptx') {
        // Generate PowerPoint
        const blob = await generatePPTX(presentationData);
        const filename = `${propertyData.address.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
        downloadBlob(blob, filename);
        toast.success('PowerPoint downloaded successfully!');
      } else if (format === 'email') {
        // Send via email
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          toast.error('Please log in to send via email');
          return;
        }
        
        // Generate PDF and send via email
        const blob = await generatePDF(presentationData);
        const result = await sendPresentationEmail(user.email, blob, 'pdf', propertyData.address);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
          return;
        }
      } else if (format === 'directmail') {
        // Send via Lob direct mail API
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-direct-mail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            to_address: {
              name: 'Property Owner',
              address_line1: propertyData.address,
              address_city: propertyData.city,
              address_state: propertyData.state,
              address_zip: propertyData.zip
            },
            template_type: 'land_acquisition',
            property_data: presentationData,
            campaign_id: `presentation_${Date.now()}`
          })
        });

        const result = await response.json();
        if (result.success) {
          toast.success('Direct mail sent successfully!');
        } else {
          throw new Error(result.error);
        }
      }

      // Increment usage count
      await incrementUsageCount();
      
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export presentation');
    } finally {
      setLoading(false);
    }
  };

  const incrementUsageCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('subscriptions')
      .update({ presentations_used: usageCount + 1 })
      .eq('user_id', user.id);
    
    setUsageCount(prev => prev + 1);
  };

  // Import calculator results
  const importCalculatorData = () => {
    // This would open a modal to select and import from existing calculator results
    toast.info('Calculator import coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Helmet>
        <title>Presentation Builder - Professional Property Marketing | RepMotivatedSeller</title>
        <meta name="description" content="Create professional property presentations with comparables, maps, AI-generated content, and direct mail marketing capabilities." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <BackButton />

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📊 Property Presentation Builder
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Create professional property marketing presentations with comparables, maps, AI-generated content, and multi-channel delivery
          </p>
        </div>

        {/* Tier Display & Usage */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {tiers.find(t => t.id === currentTier)?.icon}
                <div>
                  <h3 className="font-semibold text-lg">{tiers.find(t => t.id === currentTier)?.name} Plan</h3>
                  <p className="text-sm text-gray-600">{getUsageDisplay()}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-xl shadow-lg border-2 p-6 ${
                currentTier === tier.id 
                  ? 'border-blue-600 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {tier.icon}
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                </div>
                {currentTier === tier.id && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    Current
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-gray-600">/month</span>
              </div>

              <p className="text-gray-600 mb-4">
                {tier.monthly_limit === null ? 'Unlimited' : tier.monthly_limit} presentations/month
              </p>

              <ul className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Main Builder */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Step Navigation */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            {['property', 'comparables', 'content', 'preview', 'export'].map((s, idx) => (
              <div
                key={s}
                className={`flex items-center gap-2 ${
                  step === s ? 'text-blue-600 font-semibold' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  {idx + 1}
                </div>
                <span className="hidden sm:inline capitalize">{s}</span>
              </div>
            ))}
          </div>

          {/* Step 1: Property Data */}
          {step === 'property' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Home className="w-6 h-6" />
                Property Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Street Address</label>
                  <input
                    type="text"
                    value={propertyData.address}
                    onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={propertyData.city}
                      onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={propertyData.state}
                      onChange={(e) => setPropertyData({ ...propertyData, state: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP</label>
                    <input
                      type="text"
                      value={propertyData.zip}
                      onChange={(e) => setPropertyData({ ...propertyData, zip: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Property Type</label>
                  <select
                    value={propertyData.propertyType}
                    onChange={(e) => setPropertyData({ ...propertyData, propertyType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Single Family</option>
                    <option>Multi-Family</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                    <option>Land</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bedrooms</label>
                    <input
                      type="number"
                      value={propertyData.bedrooms}
                      onChange={(e) => setPropertyData({ ...propertyData, bedrooms: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      value={propertyData.bathrooms}
                      onChange={(e) => setPropertyData({ ...propertyData, bathrooms: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Square Feet</label>
                  <input
                    type="number"
                    value={propertyData.sqft}
                    onChange={(e) => setPropertyData({ ...propertyData, sqft: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lot Size (sq ft)</label>
                  <input
                    type="number"
                    value={propertyData.lotSize}
                    onChange={(e) => setPropertyData({ ...propertyData, lotSize: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Year Built</label>
                  <input
                    type="number"
                    value={propertyData.yearBuilt}
                    onChange={(e) => setPropertyData({ ...propertyData, yearBuilt: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Value</label>
                  <input
                    type="number"
                    value={propertyData.estimatedValue}
                    onChange={(e) => setPropertyData({ ...propertyData, estimatedValue: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="250000"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={importCalculatorData}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Import from Calculator
                </button>
                <button
                  onClick={() => setStep('comparables')}
                  disabled={!propertyData.address || !propertyData.estimatedValue}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  Next: Comparables →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Comparables */}
          {step === 'comparables' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Market Comparables
              </h2>

              {comparables.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No comparables loaded yet</p>
                  <button
                    onClick={fetchComparables}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition"
                  >
                    {loading ? 'Loading...' : 'Fetch Comparables'}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>{comparables.length}</strong> comparable properties found within 1 mile
                    </p>
                  </div>

                  <div className="space-y-4">
                    {comparables.map((comp, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{comp.address}</h3>
                            <p className="text-sm text-gray-600">
                              {comp.bedrooms} BD | {comp.bathrooms} BA | {comp.sqft} sq ft | {comp.distance} mi away
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Sold: {comp.soldDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">${comp.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">${comp.pricePerSqft.toFixed(2)}/sq ft</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showMap && (
                    <div className="mt-6">
                      <PropertyMap
                        mainProperty={{
                          address: propertyData.address,
                          latitude: 34.0522,  // TODO: Get from geocoding API
                          longitude: -118.2437,
                          isMainProperty: true
                        }}
                        comparables={comparables.map(comp => ({
                          address: comp.address,
                          latitude: 34.0522 + (Math.random() - 0.5) * 0.02,  // Mock nearby locations
                          longitude: -118.2437 + (Math.random() - 0.5) * 0.02,
                        }))}
                        height="500px"
                        showControls={currentTier !== 'basic'}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep('property')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('content')}
                  disabled={comparables.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  Next: AI Content →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: AI Content */}
          {step === 'content' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Wand2 className="w-6 h-6" />
                AI-Generated Content
              </h2>

              {currentTier === 'basic' ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">AI Content Generation</h3>
                  <p className="text-gray-600 mb-4">Upgrade to Pro or Premium to unlock AI-powered content</p>
                  <button
                    onClick={() => window.location.href = '/pricing'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    Upgrade Now
                  </button>
                </div>
              ) : (
                <div>
                  {!aiContent.propertyDescription ? (
                    <div className="text-center py-12">
                      <button
                        onClick={generateAIContent}
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 transition flex items-center gap-2 mx-auto"
                      >
                        <Wand2 className="w-5 h-5" />
                        {loading ? 'Generating...' : 'Generate AI Content'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Property Description</label>
                        <textarea
                          value={aiContent.propertyDescription}
                          onChange={(e) => setAiContent({ ...aiContent, propertyDescription: e.target.value })}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Marketing Letter</label>
                        <textarea
                          value={aiContent.marketingLetter}
                          onChange={(e) => setAiContent({ ...aiContent, marketingLetter: e.target.value })}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-48"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Investment Analysis</label>
                        <textarea
                          value={aiContent.investmentAnalysis}
                          onChange={(e) => setAiContent({ ...aiContent, investmentAnalysis: e.target.value })}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-40"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Custom Notes</label>
                        <textarea
                          value={aiContent.customNotes}
                          onChange={(e) => setAiContent({ ...aiContent, customNotes: e.target.value })}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                          placeholder="Add any custom notes or information..."
                        />
                      </div>

                      <button
                        onClick={generateAIContent}
                        disabled={loading}
                        className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                      >
                        Regenerate Content
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep('comparables')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Next: Preview →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 'preview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Presentation Preview
              </h2>

              <div className="space-y-6">
                {/* Include Options */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Include in Presentation:</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeComparables}
                        onChange={(e) => setIncludeComparables(e.target.checked)}
                        className="rounded"
                      />
                      <span>Market Comparables</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeMap}
                        onChange={(e) => setIncludeMap(e.target.checked)}
                        className="rounded"
                      />
                      <span>Property Map</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeAIContent}
                        onChange={(e) => setIncludeAIContent(e.target.checked)}
                        className="rounded"
                      />
                      <span>AI-Generated Content</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeCalculations}
                        onChange={(e) => setIncludeCalculations(e.target.checked)}
                        className="rounded"
                      />
                      <span>Calculator Results</span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="border-2 border-gray-300 rounded-lg p-8 bg-white">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Property Marketing Presentation</h1>
                    <p className="text-gray-600">{propertyData.address}, {propertyData.city}, {propertyData.state}</p>
                  </div>

                  {includeComparables && comparables.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-3">Market Analysis</h2>
                      <p className="text-gray-700">{comparables.length} comparable properties analyzed</p>
                    </div>
                  )}

                  {includeAIContent && aiContent.propertyDescription && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-3">Property Overview</h2>
                      <p className="text-gray-700 whitespace-pre-wrap">{aiContent.propertyDescription}</p>
                    </div>
                  )}

                  <div className="text-center text-gray-400 py-8">
                    <p>Full presentation preview</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep('content')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('export')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Next: Export →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Export */}
          {step === 'export' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Send className="w-6 h-6" />
                Export & Delivery
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* PDF Download */}
                <button
                  onClick={() => exportPresentation('pdf')}
                  disabled={loading || !canCreatePresentation()}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-8 h-8 mb-3 text-blue-600" />
                  <h3 className="font-bold text-lg mb-2">Download PDF</h3>
                  <p className="text-sm text-gray-600">Export as PDF for printing or sharing</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    All Tiers
                  </span>
                </button>

                {/* PowerPoint */}
                <button
                  onClick={() => exportPresentation('pptx')}
                  disabled={loading || !canCreatePresentation() || currentTier === 'basic'}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-8 h-8 mb-3 text-orange-600" />
                  <h3 className="font-bold text-lg mb-2">PowerPoint Export</h3>
                  <p className="text-sm text-gray-600">Export as editable PowerPoint presentation</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    Pro & Premium
                  </span>
                </button>

                {/* Email */}
                <button
                  onClick={() => exportPresentation('email')}
                  disabled={loading || !canCreatePresentation()}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-8 h-8 mb-3 text-purple-600" />
                  <h3 className="font-bold text-lg mb-2">Send via Email</h3>
                  <p className="text-sm text-gray-600">Email presentation to yourself or client</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    All Tiers
                  </span>
                </button>

                {/* Direct Mail */}
                <button
                  onClick={() => exportPresentation('directmail')}
                  disabled={loading || !canCreatePresentation() || currentTier === 'basic'}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-8 h-8 mb-3 text-green-600" />
                  <h3 className="font-bold text-lg mb-2">Send Direct Mail</h3>
                  <p className="text-sm text-gray-600">Physical letter delivered via Lob</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    Pro & Premium
                  </span>
                </button>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Each export counts toward your monthly limit. You have{' '}
                  {tiers.find(t => t.id === currentTier)?.monthly_limit === null 
                    ? 'unlimited' 
                    : `${(tiers.find(t => t.id === currentTier)?.monthly_limit || 0) - usageCount}`
                  } presentations remaining this month.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setStep('preview')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Back to Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationBuilderPage;




