import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Camera, Upload, Loader, AlertTriangle, CheckCircle, Stethoscope, Lightbulb } from 'lucide-react';
import { imageService, ImageAnalysisResult } from '../services/imageService';

const ImageUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [showTips, setShowTips] = useState(false);
  const { showToast } = useToast();

  // Skincare tips based on analysis result
  const getTips = () => {
    if (!analysisResult) return [];
    
    if (analysisResult.eczema_detected) {
      const severity = analysisResult.severity?.toLowerCase();
      const baseTips = [
        '🧴 Keep your skin moisturized with fragrance-free lotions',
        '🚿 Take lukewarm showers instead of hot baths',
        '👕 Wear soft, breathable cotton clothing',
        '💧 Stay hydrated - drink plenty of water',
        '🌿 Avoid known triggers like harsh soaps or certain foods',
        '😴 Ensure you get enough sleep to help skin heal',
      ];
      
      if (severity === 'severe') {
        return [
          '⚠️ Consider consulting a dermatologist as soon as possible',
          '💊 Discuss prescription treatments with your doctor',
          '🧊 Apply cold compresses to reduce inflammation',
          ...baseTips,
        ];
      } else if (severity === 'moderate') {
        return [
          '📅 Schedule a consultation with a dermatologist',
          '🏥 Over-the-counter hydrocortisone cream may help',
          ...baseTips,
        ];
      } else {
        return [
          '✨ Continue with a consistent skincare routine',
          ...baseTips,
        ];
      }
    } else {
      return [
        '✅ Great news! No eczema patterns were detected',
        '🧴 Continue moisturizing regularly',
        '☀️ Protect your skin from sun exposure',
        '💧 Stay hydrated for healthy skin',
        '🥗 Maintain a balanced diet rich in vitamins',
        '😌 Manage stress for better skin health',
      ];
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        showToast('Image size must be less than 10MB', 'error');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      showToast('Please select an image first', 'error');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const result = await imageService.uploadImage(selectedFile);
      setAnalysisResult(result.analysis);
      showToast('Analysis complete!', 'success');
    } catch (error: any) {
      console.error('Analysis error:', error);
      showToast(error.message || 'Failed to analyze image. Please try again.', 'error');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string | null | undefined) => {
    if (!severity) return 'text-gray-400';
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'severe':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">AI Skin Analysis</h1>
        <p className="text-gray-300 text-lg">
          Upload a photo of your skin for instant AI-powered analysis
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        {!selectedImage ? (
          <div className="text-center">
            <div className="border-2 border-dashed border-[#6A9FB5] border-opacity-50 rounded-2xl p-12 hover:border-opacity-100 transition-colors">
              <Camera className="h-16 w-16 text-[#6A9FB5] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Upload Your Image</h3>
              <p className="text-gray-300 mb-6">
                Take a clear photo of the affected skin area
              </p>
              <label className="inline-flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <img
                src={selectedImage}
                alt="Uploaded skin"
                className="max-w-md mx-auto rounded-lg border border-white border-opacity-20"
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span>Analyze Image</span>
                  </>
                )}
              </button>
              
              <label className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Upload New</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
          </div>
          
          {!analysisResult.relevant ? (
            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Image Not Relevant</h3>
                  <p className="text-gray-300">{analysisResult.message || analysisResult.explanation || 'The uploaded image does not appear to be human skin.'}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                  <h3 className="text-lg font-semibold text-white mb-2">Analysis Result</h3>
                  <p className={`text-xl font-bold mb-2 ${analysisResult.eczema_detected ? 'text-red-400' : 'text-green-400'}`}>
                    {analysisResult.eczema_detected ? 'Eczema Detected' : 'No Eczema Detected'}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-gray-300 text-sm">Confidence</p>
                      <p className="text-white font-semibold">{(analysisResult.confidence * 100).toFixed(1)}%</p>
                    </div>
                    {analysisResult.severity && (
                      <div>
                        <p className="text-gray-300 text-sm">Severity</p>
                        <p className={`font-semibold ${getSeverityColor(analysisResult.severity)}`}>
                          {analysisResult.severity}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Important Notice</h3>
                      <p className="text-gray-300 text-sm">
                        {analysisResult.disclaimer || 'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a qualified dermatologist for proper diagnosis and treatment.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
            </>
          )}
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button 
              onClick={resetAnalysis}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Analyze Another Image
            </button>
            <button 
              onClick={() => setShowTips(!showTips)}
              className="flex items-center space-x-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <Lightbulb className="h-5 w-5" />
              <span>{showTips ? 'Hide Tips' : 'Get Tips'}</span>
            </button>
            <button 
              onClick={() => navigate('/consult')}
              className="flex items-center space-x-2 bg-[#C5B4E3] hover:bg-[#B5A4D3] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Book Consultation</span>
            </button>
          </div>

          {/* Tips Section */}
          {showTips && (
            <div className="mt-6 bg-[#F59E0B] bg-opacity-10 border border-[#F59E0B] border-opacity-30 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="h-6 w-6 text-[#F59E0B]" />
                <h3 className="text-lg font-semibold text-white">Personalized Tips</h3>
              </div>
              <ul className="space-y-3">
                {getTips().map((tip, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="mr-2">{tip}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-[#F59E0B] border-opacity-30">
                <button 
                  onClick={() => navigate('/tips')}
                  className="text-[#F59E0B] hover:text-[#D97706] font-semibold flex items-center space-x-2"
                >
                  <span>View all skincare tips</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;