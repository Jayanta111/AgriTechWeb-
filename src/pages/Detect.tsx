import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface DetectionResult {
  detections: Array<{
    class: string;
    confidence: number;
    bbox: number[];
  }>;
}

interface PrecautionsData {
  disease_name: string;
  immediate_actions: string[];
  short_term_management: string[];
  long_term_prevention: string[];
  organic_alternatives: string[];
  safety_precautions: string[];
  yield_impact: string[];
  fertilizer_recommendations?: any[];
  ai_generated?: boolean;
}

export const Detect = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Please select an image file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post<DetectionResult>(
        'http://localhost:8001/predict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Store results in sessionStorage for the results page
      sessionStorage.setItem('detectionResults', JSON.stringify(response.data));
      sessionStorage.setItem('imagePreview', preview);

      // Fetch precautions using RAG/LLaMA
      const diseaseName = response.data?.detections?.[0]?.class || 'Healthy Crop';
      const userId = 'user_' + Math.random().toString(36).substring(2, 9);
      
      try {
        const precautionsResponse = await axios.post(
          'http://localhost:8000/precautions',
          {
            disease_name: diseaseName,
            user_id: userId,
            include_fertilizers: true
          }
        );
        
        if (precautionsResponse.data?.data) {
          sessionStorage.setItem('precautionsData', JSON.stringify(precautionsResponse.data.data));
        }
      } catch (precautionsErr) {
        console.error('Failed to fetch precautions:', precautionsErr);
        // Continue without precautions - not a critical error
      }
      
      navigate('/results');
    } catch (err) {
      setError('Failed to analyze image. Please make sure the backend server is running on localhost:8001');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Plant Disease Detection
          </h1>
          <p className="text-xl text-gray-600">
            Upload an image of your plant leaf to detect diseases
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-agri-green transition-colors">
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                />
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview('');
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Choose Different Image
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-6 py-2 bg-agri-green text-white rounded-lg hover:bg-agri-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        <span>Analyze Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center space-x-2 px-6 py-3 bg-agri-green text-white rounded-lg hover:bg-agri-dark transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Choose Image</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-gray-500">
                  or drag and drop an image here
                </p>
                <p className="text-sm text-gray-400">
                  Supports: JPG, PNG, GIF, WebP
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Ensure good lighting and clear focus</li>
              <li>Capture the affected area of the leaf</li>
              <li>Include some healthy tissue for comparison</li>
              <li>Avoid blurry or dark images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
