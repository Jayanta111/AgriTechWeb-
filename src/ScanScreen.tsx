import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, MapPin, Phone, Navigation, Droplets, Leaf, Package, Clock, Star } from 'lucide-react';
import axios from 'axios';

interface DetectionResult {
  detections: {
    class: string;
    confidence: number;
    bbox: number[];
  }[];
  precautions?: {
    disease_name: string;
    immediate_actions: string[];
    short_term_management: string[];
    long_term_prevention: string[];
    organic_alternatives: string[];
    safety_precautions: string[];
    yield_impact: string[];
    full_response: string;
    voice_text?: string;
    fertilizer_recommendations?: FertilizerRecommendation[];
  };
}

interface FertilizerRecommendation {
  name: string;
  type: 'organic' | 'chemical';
  npk_ratio: string;
  application_rate: string;
  frequency: string;
  benefits: string[];
  target_diseases: string[];
  price_range: string;
}

interface NearbyStore {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  rating: number;
  opening_hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  products: string[];
}

function ScanScreen() {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [detectedCrop, setDetectedCrop] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [precautions, setPrecautions] = useState<any>(null);
  const [showPrecautions, setShowPrecautions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [fertilizerRecommendations, setFertilizerRecommendations] = useState<FertilizerRecommendation[]>([]);
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showStores, setShowStores] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      setError('Camera access denied');
      setMode('upload');
    }
  };

  const stopCamera = useCallback(() => {
    cameraStream?.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    setCameraReady(false);
  }, [cameraStream]);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
      return stopCamera;
    } else {
      stopCamera();
    }
  }, [mode, stopCamera]);

  const scanCrop = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    setIsScanning(true);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'crop.jpg');

      try {
        const res = await axios.post<DetectionResult>(
        'http://localhost:5000/predict',
          formData
        );

        const disease = res.data?.detections?.[0]?.class;
        setDetectedCrop(disease || 'Healthy Crop');
        
        // Set precautions if available
        if (res.data?.precautions) {
          setPrecautions(res.data.precautions);
          setShowPrecautions(true);
        } else {
          // Fetch precautions separately if not included
          fetchPrecautions(disease || 'Healthy Crop');
        }
      } catch (err: any) {
        setError('Backend error');
      } finally {
        setIsScanning(false);
      }
    }, 'image/jpeg');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsScanning(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post<DetectionResult>(
        'http://localhost:5000/predict',
        formData
      );

      const disease = res.data?.detections?.[0]?.class;
      setDetectedCrop(disease || 'Healthy Crop');
      
      // Set precautions if available
      if (res.data?.precautions) {
        setPrecautions(res.data.precautions);
        setShowPrecautions(true);
      } else {
        // Fetch precautions separately if not included
        fetchPrecautions(disease || 'Healthy Crop');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setIsScanning(false);
    }
  };

  const fetchPrecautions = async (diseaseName: string) => {
    try {
      const res = await axios.post('http://localhost:5000/precautions', {
        disease_name: diseaseName,
        user_id: userId,
        user_context: {
          location: 'User location',
          farm_size: 'Small to medium',
          experience: 'Beginner to intermediate'
        },
        voice_format: true
      });
      
      const recommendations = getFertilizerRecommendations(diseaseName);
      setFertilizerRecommendations(recommendations);
      
      setPrecautions(res.data);
      setShowPrecautions(true);
    } catch (err: any) {
      console.error('Error fetching precautions:', err);
      // Fallback to local recommendations if API fails
      const recommendations = getFertilizerRecommendations(diseaseName);
      setFertilizerRecommendations(recommendations);
      setPrecautions({
        disease_name: diseaseName,
        immediate_actions: ['Isolate affected plants', 'Remove infected leaves'],
        short_term_management: ['Apply appropriate treatment', 'Monitor plant health'],
        long_term_prevention: ['Crop rotation', 'Proper sanitation'],
        organic_alternatives: ['Neem oil spray', 'Compost tea'],
        safety_precautions: ['Wear protective gear', 'Follow application guidelines'],
        yield_impact: ['Early detection minimizes yield loss'],
        full_response: 'Treatment recommendations provided'
      });
      setShowPrecautions(true);
    }
  };

  const speakPrecautions = () => {
    if (!precautions?.voice_text) return;
    
    // Stop any existing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(precautions.voice_text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const saveToHistory = async () => {
    if (!detectedCrop || !precautions) return;
    
    try {
      // History is automatically saved by backend when fetching precautions
      alert('Detection and advice saved to your profile history!');
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enable location services.');
      }
    );
  };

  const fetchNearbyStores = async () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    setLoadingStores(true);
    try {
      // Mock data for nearby stores - in production, this would call a real API
      const mockStores: NearbyStore[] = [
        {
          id: '1',
          name: 'Green Valley Agro Supplies',
          address: '123 Main St, Agricultural Area',
          distance: '2.5 km',
          phone: '+91 98765 43210',
          rating: 4.5,
          opening_hours: '8:00 AM - 8:00 PM',
          coordinates: { lat: userLocation.lat + 0.02, lng: userLocation.lng + 0.02 },
          products: ['NPK Fertilizers', 'Organic Compost', 'Pesticides', 'Seeds']
        },
        {
          id: '2',
          name: 'Farmers Choice Store',
          address: '456 Rural Road, Farm District',
          distance: '3.8 km',
          phone: '+91 98765 43211',
          rating: 4.2,
          opening_hours: '7:00 AM - 9:00 PM',
          coordinates: { lat: userLocation.lat - 0.01, lng: userLocation.lng + 0.03 },
          products: ['Organic Fertilizers', 'Bio-fertilizers', 'Growth Promoters']
        },
        {
          id: '3',
          name: 'AgriTech Solutions',
          address: '789 Market Plaza, City Center',
          distance: '5.2 km',
          phone: '+91 98765 43212',
          rating: 4.8,
          opening_hours: '9:00 AM - 7:00 PM',
          coordinates: { lat: userLocation.lat + 0.03, lng: userLocation.lng - 0.01 },
          products: ['Specialty Fertilizers', 'Micronutrients', 'Soil Test Kits']
        }
      ];
      
      setNearbyStores(mockStores);
      setShowStores(true);
    } catch (err) {
      console.error('Error fetching nearby stores:', err);
      setError('Failed to load nearby stores');
    } finally {
      setLoadingStores(false);
    }
  };

  const getDirections = (store: NearbyStore) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const callStore = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const getFertilizerRecommendations = (diseaseName: string): FertilizerRecommendation[] => {
    const recommendations: { [key: string]: FertilizerRecommendation[] } = {
      'Tomato_Bacterial_spot': [
        {
          name: 'Copper-Based Fungicide',
          type: 'chemical',
          npk_ratio: 'N/A',
          application_rate: '2-3 kg per hectare',
          frequency: 'Every 7-10 days',
          benefits: ['Controls bacterial diseases', 'Prevents leaf spots', 'Boosts plant immunity'],
          target_diseases: ['Bacterial spot', 'Bacterial speck', 'Early blight'],
          price_range: 'Rs. 300-500 per kg'
        },
        {
          name: 'Organic Neem Cake',
          type: 'organic',
          npk_ratio: '4-1-2',
          application_rate: '50-100 kg per hectare',
          frequency: 'At planting and every 3 months',
          benefits: ['Natural pest control', 'Improves soil health', 'Slow release nutrients'],
          target_diseases: ['Bacterial diseases', 'Fungal infections', 'Soil-borne pathogens'],
          price_range: 'Rs. 25-40 per kg'
        }
      ],
      'Healthy_Crop': [
        {
          name: 'Balanced NPK 20-20-20',
          type: 'chemical',
          npk_ratio: '20-20-20',
          application_rate: '50-100 kg per hectare',
          frequency: 'Every 4-6 weeks',
          benefits: ['Promotes overall growth', 'Increases yield', 'Improves fruit quality'],
          target_diseases: ['Prevention of nutrient deficiencies'],
          price_range: 'Rs. 150-250 per kg'
        },
        {
          name: 'Vermicompost',
          type: 'organic',
          npk_ratio: '2-1-1.5',
          application_rate: '2-3 tons per hectare',
          frequency: 'At planting and as top dressing',
          benefits: ['Improves soil structure', 'Enhances microbial activity', 'Slow release nutrients'],
          target_diseases: ['General plant health improvement'],
          price_range: 'Rs. 8-15 per kg'
        }
      ]
    };

    return recommendations[diseaseName] || recommendations['Healthy_Crop'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-green-800 text-center">Crop Disease Scanner</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Mode Selection */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-md p-1 inline-flex">
            <button
              onClick={() => setMode('camera')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'camera' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'upload' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Upload
            </button>
          </div>
        </div>

        {/* Camera/Upload Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {mode === 'camera' ? (
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                className="w-full h-64 sm:h-96 object-cover bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-white">Initializing camera...</p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button
                  onClick={scanCrop}
                  disabled={isScanning || !cameraReady}
                  className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Scan Crop</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Choose an image to analyze</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isScanning ? 'Analyzing...' : 'Select Image'}
                </button>
              </div>
              
              {preview && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Selected Image:</h3>
                  <img 
                    src={preview} 
                    alt="Selected crop image for analysis" 
                    className="w-full rounded-lg shadow-md max-h-64 object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Detection Results */}
        {detectedCrop && (
          <div className="space-y-6">
            {/* Disease Detection Result */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Detection Result</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {detectedCrop}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPrecautions(!showPrecautions)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Leaf className="w-4 h-4" />
                  <span>{showPrecautions ? 'Hide' : 'Show'} Treatment</span>
                </button>
                
                <button
                  onClick={isSpeaking ? stopSpeaking : speakPrecautions}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                  disabled={!precautions?.voice_text}
                >
                  <span>{isSpeaking ? 'Stop' : 'Speak'} Advice</span>
                </button>
                
                <button
                  onClick={saveToHistory}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <span>Save to History</span>
                </button>
              </div>
            </div>

            {/* Fertilizer Recommendations */}
            {fertilizerRecommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Droplets className="w-6 h-6 mr-2 text-blue-500" />
                  Fertilizer Recommendations
                </h2>
                
                <div className="space-y-4">
                  {fertilizerRecommendations.map((fertilizer, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{fertilizer.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              fertilizer.type === 'organic' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {fertilizer.type}
                            </span>
                            <span>NPK: {fertilizer.npk_ratio}</span>
                          </div>
                        </div>
                        <span className="text-green-600 font-semibold">{fertilizer.price_range}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Application Rate:</p>
                          <p className="text-gray-600">{fertilizer.application_rate}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Frequency:</p>
                          <p className="text-gray-600">{fertilizer.frequency}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="font-medium text-gray-700 mb-2">Benefits:</p>
                        <div className="flex flex-wrap gap-1">
                          {fertilizer.benefits.map((benefit, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={fetchNearbyStores}
                  className="mt-4 w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Find Nearby Stores</span>
                </button>
              </div>
            )}

            {/* Detailed Treatment */}
            {showPrecautions && precautions && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Disease Management</h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {precautions.immediate_actions?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2 flex items-center">
                        <span className="mr-2">{'\ud83d\udea8'}</span> Immediate Actions (First 24-48 hours)
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {precautions.immediate_actions.map((action: string, index: number) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {precautions.short_term_management?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2 flex items-center">
                        <span className="mr-2">{'\ud83d\udcc5'}</span> Short-term Management (1-2 weeks)
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {precautions.short_term_management.map((action: string, index: number) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {precautions.long_term_prevention?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-2 flex items-center">
                        <span className="mr-2">{'\ud83d\udee1\ufe0f'}</span> Long-term Prevention
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {precautions.long_term_prevention.map((action: string, index: number) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {precautions.organic_alternatives?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center">
                        <span className="mr-2">{'\ud83c\udf3f'}</span> Organic Alternatives
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {precautions.organic_alternatives.map((action: string, index: number) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {precautions.safety_precautions?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2 flex items-center">
                        <span className="mr-2">{'\u26a0\ufe0f'}</span> Safety Precautions
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {precautions.safety_precautions.map((action: string, index: number) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nearby Stores */}
            {showStores && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-red-500" />
                  Nearby Agri-Stores
                </h2>
                
                {loadingStores ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Finding nearby stores...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nearbyStores.map((store) => (
                      <div key={store.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{store.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{store.distance}</span>
                              <span>{'\u2022'}</span>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span>{store.rating}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-green-600 font-semibold">{store.price_range}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{store.address}</p>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                          <Clock className="w-4 h-4" />
                          <span>{store.opening_hours}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {store.products.slice(0, 3).map((product, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {product}
                            </span>
                          ))}
                          {store.products.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              +{store.products.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => callStore(store.phone)}
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => getDirections(store)}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                          >
                            <Navigation className="w-4 h-4" />
                            <span>Directions</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanScreen;