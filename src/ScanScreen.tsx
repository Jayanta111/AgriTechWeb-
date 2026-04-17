import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
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
  };
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

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    setCameraReady(false);
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
      return stopCamera;
    } else {
      stopCamera();
    }
  }, [mode]);

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
      
      setPrecautions(res.data);
      setShowPrecautions(true);
    } catch (err: any) {
      console.error('Error fetching precautions:', err);
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

  return (
    <div className="p-4">
      {mode === 'camera' ? (
        <div>
          <video ref={videoRef} autoPlay className="w-full rounded-lg" />
          <canvas ref={canvasRef} className="hidden" />

          <button onClick={scanCrop} className="bg-green-500 text-white px-4 py-2 mt-3 rounded">
            Scan
          </button>

          {!cameraReady && (
            <button onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 mt-3 rounded">
              Retry Camera
            </button>
          )}
        </div>
      ) : (
        <div>
          <button onClick={() => setMode('camera')} className="bg-green-500 text-white px-3 py-2 rounded">
            <Camera className="inline mr-1" /> Camera
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 mt-3 rounded"
          >
            Choose Image
          </button>

          {preview && <img src={preview} alt="Preview of selected image" className="mt-3 rounded" />}

          {error && <p className="text-red-500">{error}</p>}

          {detectedCrop && (
            <div className="mt-3">
              <p className="text-green-600 font-semibold">{detectedCrop}</p>
              
              {precautions && (
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPrecautions(!showPrecautions)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      {showPrecautions ? 'Hide' : 'Show'} Detailed Advice
                    </button>
                    
                    <button
                      onClick={isSpeaking ? stopSpeaking : speakPrecautions}
                      className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
                      disabled={!precautions?.voice_text}
                    >
                      {isSpeaking ? 'Stop' : 'Speak'} Advice
                    </button>
                    
                    <button
                      onClick={saveToHistory}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Save to History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {showPrecautions && precautions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-lg mb-3">Detailed Disease Management</h3>
              
              {precautions.immediate_actions?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-red-600 mb-2">🚨 Immediate Actions (First 24-48 hours)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {precautions.immediate_actions.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {precautions.short_term_management?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-orange-600 mb-2">📅 Short-term Management (1-2 weeks)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {precautions.short_term_management.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {precautions.long_term_prevention?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-green-600 mb-2">🛡️ Long-term Prevention</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {precautions.long_term_prevention.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {precautions.organic_alternatives?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-green-700 mb-2">🌿 Organic Alternatives</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {precautions.organic_alternatives.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {precautions.safety_precautions?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-yellow-600 mb-2">⚠️ Safety Precautions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {precautions.safety_precautions.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {precautions.yield_impact?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-blue-600 mb-2">📊 Yield Impact & Recovery</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {precautions.yield_impact.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScanScreen;