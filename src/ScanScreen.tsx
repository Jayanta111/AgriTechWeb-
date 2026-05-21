import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Package, Leaf, Droplets, MapPin, Phone, Navigation, Clock, Star } from 'lucide-react';
import axios, { AxiosResponse } from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DetectionResult {
  detections: {
    class: string;
    confidence: number;
    bbox: number[];
  }[];
  precautions?: any;
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
  const [mode, setMode] = useState<'camera' | 'upload' | 'live'>('camera');

  const [detectedCrop, setDetectedCrop] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);

  const [preview, setPreview] = useState('');

  const [error, setError] = useState('');

  const [cameraReady, setCameraReady] = useState(false);

  const [precautions, setPrecautions] = useState<any>(null);

  const [showPrecautions, setShowPrecautions] = useState(false);

  const [fertilizerRecommendations, setFertilizerRecommendations] =
    useState<FertilizerRecommendation[]>([]);

  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);

  const [showStores, setShowStores] = useState(false);

  const [loadingStores, setLoadingStores] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const lastDiseaseRef = useRef('');

  const mapRef = useRef<L.Map | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const userId = 'user_' + Math.random().toString(36).substring(2, 9);

  // ================= CAMERA =================

  const startCamera = useCallback(async () => {
    try {
      setError('');

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to access camera');
      setCameraReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (mode === 'camera' || mode === 'live') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  // ================= LIVE DETECTION =================

  const predictLiveDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async blob => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'live.jpg');

      try {
        const res = await axios.post<DetectionResult>(
          'http://localhost:5000/predict-live',
          formData
        );

        const disease = res.data?.detections?.[0]?.class;

        if (disease && disease !== lastDiseaseRef.current) {
          lastDiseaseRef.current = disease;

          setDetectedCrop(disease);

          if (res.data.precautions) {
            setPrecautions(res.data.precautions);
            setShowPrecautions(true);
          } else {
            await fetchPrecautions(disease);
          }

          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }
      } catch (err) {
        console.log('Live detection failed');
      }
    }, 'image/jpeg', 0.7);
  }, []);

  useEffect(() => {
    if (mode === 'live' && cameraReady) {
      predictLiveDetection();

      liveIntervalRef.current = setInterval(() => {
        predictLiveDetection();
      }, 2500);
    }

    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, [mode, cameraReady, predictLiveDetection]);

  // ================= MANUAL SCAN =================

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

    canvas.toBlob(async blob => {
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

        if (res.data.precautions) {
          setPrecautions(res.data.precautions);
          setShowPrecautions(true);
        } else {
          await fetchPrecautions(disease || 'Healthy Crop');
        }
      } catch {
        setError('Backend error');
      } finally {
        setIsScanning(false);
      }
    }, 'image/jpeg');
  };

  // ================= IMAGE UPLOAD =================

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);

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

      if (res.data.precautions) {
        setPrecautions(res.data.precautions);
        setShowPrecautions(true);
      } else {
        await fetchPrecautions(disease || 'Healthy Crop');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setIsScanning(false);
    }
  };

  // ================= PRECAUTIONS =================

  const fetchPrecautions = async (diseaseName: string) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/precautions',
        {
          disease_name: diseaseName,
          user_id: userId
        }
      );

      if (res.data?.data) {
        setPrecautions(res.data.data);
      } else {
        setPrecautions(res.data);
      }

      setShowPrecautions(true);

      const recommendations =
        res.data?.data?.fertilizer_recommendations ||
        getFertilizerRecommendations();

      setFertilizerRecommendations(recommendations);
    } catch (err) {
      console.error(err);

      setPrecautions({
        immediate_actions: [
          'Remove infected leaves',
          'Use proper fungicide',
          'Avoid overwatering'
        ],
        long_term_prevention: [
          'Crop rotation',
          'Healthy soil management'
        ]
      });

      setShowPrecautions(true);

      setFertilizerRecommendations(
        getFertilizerRecommendations()
      );
    }
  };

  // ================= FERTILIZERS =================

  const getFertilizerRecommendations =
    (): FertilizerRecommendation[] => {
      return [
        {
          name: 'Balanced NPK 20-20-20',
          type: 'chemical',
          npk_ratio: '20-20-20',
          application_rate: '50-100 kg/hectare',
          frequency: 'Every 4 weeks',
          benefits: [
            'Better growth',
            'Improves yield',
            'Healthy leaves'
          ],
          target_diseases: ['General prevention'],
          price_range: '₹150-250'
        }];
  };

  // ================= LOCATION =================



  const fetchNearbyStores = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setLoadingStores(true);

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const lat: number = position.coords.latitude;
        const lng: number = position.coords.longitude;

        setUserLocation({ lat, lng });

        try {
          // OVERPASS API with expanded search criteria
          const query: string = `
            [out:json][timeout:10];
            (
              node["shop"="agrarian"](around:15000,${lat},${lng});
              node["shop"="garden_centre"](around:15000,${lat},${lng});
              node["office"="agricultural"](around:15000,${lat},${lng});
              node["shop"="hardware"]["name"~"agri|farm|seed"](around:15000,${lat},${lng});
              way["shop"="agrarian"](around:15000,${lat},${lng});
              way["shop"="garden_centre"](around:15000,${lat},${lng});
            );
            out center;
          `;

          const response: AxiosResponse<any> = await axios.get(
            'https://overpass-api.de/api/interpreter',
            {
              params: {
                data: query
              }
            }
          );

          let stores: NearbyStore[] = [];
          
          if (response.data.elements && response.data.elements.length > 0) {
            stores = response.data.elements
              .filter((item: any) => item.lat && item.lon)
              .map((item: any, index: number) => {
                const storeLat: number = item.center?.lat || item.lat;
                const storeLng: number = item.center?.lon || item.lon;

                // Distance calculation
                const distanceKm: string = (
                  Math.sqrt(
                    Math.pow(storeLat - lat, 2) +
                      Math.pow(storeLng - lng, 2)
                  ) * 111
                ).toFixed(1);

                return {
                  id: item.id?.toString() || `store_${index}`,
                  name: item.tags?.name || 'Agricultural Store',
                  address: item.tags?.address || 'Near your location',
                  distance: `${distanceKm} km`,
                  phone: item.tags?.phone || 'Contact for details',
                  rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
                  opening_hours: item.tags?.opening_hours || '8:00 AM - 8:00 PM',
                  coordinates: {
                    lat: storeLat,
                    lng: storeLng
                  },
                  products: ['Fertilizers', 'Seeds', 'Pesticides']
                };
              })
              .sort((a: NearbyStore, b: NearbyStore) => 
                parseFloat(a.distance) - parseFloat(b.distance)
              )
              .slice(0, 10);
          }

          if (stores.length === 0) {
            setError('No nearby agri stores found');
            setLoadingStores(false);
            return;
          }

          setNearbyStores(stores);
          setShowStores(true);
          setLoadingStores(false);
        } catch (err: any) {
          console.error('Overpass API error:', err);
          setError('Unable to load nearby stores');
          setLoadingStores(false);
        }
      },
      (error: GeolocationPositionError) => {
        console.error(error);
        setError('Location access denied');
        setLoadingStores(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // ================= MAP =================

  useEffect(() => {
    if (!showStores || nearbyStores.length === 0) {
      return;
    }

    // REMOVE OLD MAP
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapContainer = mapContainerRef.current;

    if (!mapContainer) return;

    try {
      const firstStore = nearbyStores[0];

      // CREATE MAP
      const map = L.map(mapContainer, {
        preferCanvas: true
      }).setView(
        [
          firstStore.coordinates.lat,
          firstStore.coordinates.lng
        ],
        13
      );

      mapRef.current = map;

      // TILE LAYER
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors'
        }
      ).addTo(map);

      // CUSTOM STORE MARKER
      const customIcon = L.icon({
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      // CUSTOM USER LOCATION MARKER
      const userIcon = L.icon({
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      // USER LOCATION MARKER
      if (userLocation) {
        L.marker(
          [
            userLocation.lat,
            userLocation.lng
          ],
          {
            icon: userIcon
          }
        )
          .addTo(map)
          .bindPopup(
            `
            <div style="padding:8px;">
              <strong>Your Location</strong>
            </div>
            `
          );
      }

      // STORE MARKERS
      nearbyStores.forEach(store => {
        L.marker(
          [
            store.coordinates.lat,
            store.coordinates.lng
          ],
          {
            icon: customIcon
          }
        )
          .addTo(map)
          .bindPopup(`
            <div style="padding:8px; min-width:220px;">
              <strong>${store.name}</strong><br/>
              ${store.address}<br/><br/>
              Distance: ${store.distance}<br/>
              Rating: ⭐ ${store.rating}<br/>
              Phone: ${store.phone}<br/>
              Hours: ${store.opening_hours}
            </div>
            `);
      });

      // AUTO FIT ALL MARKERS
      const bounds = L.latLngBounds(
        nearbyStores.map(store => [
          store.coordinates.lat,
          store.coordinates.lng
        ])
      );

      if (userLocation) {
        bounds.extend([
          userLocation.lat,
          userLocation.lng
        ]);
      }

      map.fitBounds(bounds, {
        padding: [50, 50]
      });

      // TRIGGER RESIZE AND REDRAW
      const resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 100);

      return () => {
        clearTimeout(resizeTimer);
      };
    } catch (err) {
      console.error('Error initializing map:', err);
    }
  }, [showStores, nearbyStores, userLocation]);

  // ================= ACTIONS =================

  const callStore = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const getDirections = (store: NearbyStore) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`,
      '_blank'
    );
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center text-green-700">
            Crop Disease Scanner
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* MODE */}

        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-md p-1 inline-flex">
            <button
              onClick={() => setMode('camera')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'camera'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>

            <button
              onClick={() => setMode('live')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'live'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-700'
              }`}
            >
              Live
            </button>

            <button
              onClick={() => setMode('upload')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'upload'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Upload
            </button>
          </div>
        </div>

        {/* CAMERA */}

        {(mode === 'camera' || mode === 'live') && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-96 object-cover bg-black"
            />

            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {mode === 'live' && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full">
                🟢 Live AI Detection
              </div>
            )}

            {mode === 'camera' && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button
                  onClick={scanCrop}
                  disabled={isScanning || !cameraReady}
                  className="bg-green-500 text-white px-6 py-3 rounded-full"
                >
                  {isScanning
                    ? 'Scanning...'
                    : 'Scan Crop'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD */}

        {mode === 'upload' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />

              <button
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="bg-green-500 text-white px-6 py-3 rounded-lg"
              >
                Upload Image
              </button>
            </div>

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-4 rounded-lg w-full max-h-96 object-contain"
              />
            )}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* RESULT */}

        {detectedCrop && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              Detection Result
            </h2>

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg inline-block">
              {detectedCrop}
            </div>
          </div>
        )}

        {/* PRECAUTIONS */}

        {showPrecautions && precautions && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-green-600" />
              Disease Management
            </h2>

            {precautions.immediate_actions?.length >
              0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-600 mb-2">
                  Immediate Actions
                </h3>

                <ul className="list-disc pl-5 space-y-1">
                  {precautions.immediate_actions.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {precautions.long_term_prevention
              ?.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-600 mb-2">
                  Prevention
                </h3>

                <ul className="list-disc pl-5 space-y-1">
                  {precautions.long_term_prevention.map(
                    (
                      item: string,
                      index: number
                    ) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* FERTILIZERS */}

        {fertilizerRecommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-blue-600" />
              Fertilizer Recommendations
            </h2>

            <div className="space-y-4">
              {fertilizerRecommendations.map(
                (fertilizer, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold">
                        {fertilizer.name}
                      </h3>

                      <span className="text-green-600">
                        {fertilizer.price_range}
                      </span>
                    </div>

                    <p className="text-sm mt-2">
                      NPK: {fertilizer.npk_ratio}
                    </p>
                  </div>
                )
              )}
            </div>

            <button
              onClick={fetchNearbyStores}
              className="mt-4 w-full bg-green-500 text-white py-3 rounded-lg"
            >
              Find Nearby Stores
            </button>
          </div>
        )}

        {/* STORES */}

        {showStores && nearbyStores.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-red-600" />
              Nearby Agri Stores
            </h2>

            <div
              ref={mapContainerRef}
              className="h-96 w-full rounded-lg border-2 border-gray-300 mb-6"
              style={{ height: '400px', width: '100%' }}
            />

            <div className="space-y-4">
              {nearbyStores.map(store => (
                <div
                  key={store.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold">
                      {store.name}
                    </h3>

                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      {store.rating}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {store.address}
                  </p>

                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Clock className="w-4 h-4 mr-1" />
                    {store.opening_hours}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() =>
                        callStore(store.phone)
                      }
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </button>

                    <button
                      onClick={() =>
                        getDirections(store)
                      }
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanScreen;