import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Camera, Upload, Loader, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ImageUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { showToast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis results
    const mockResults = [
      {
        condition: 'Mild Eczema (Atopic Dermatitis)',
        confidence: 87,
        severity: 'Mild',
        recommendations: [
          'Apply fragrance-free moisturizer twice daily',
          'Avoid harsh soaps and detergents',
          'Consider using a humidifier',
          'Consult with a dermatologist for treatment options'
        ]
      },
      {
        condition: 'Contact Dermatitis',
        confidence: 73,
        severity: 'Moderate',
        recommendations: [
          'Identify and avoid the trigger substance',
          'Apply cool, wet compresses',
          'Use topical corticosteroids as prescribed',
          'Keep the area clean and dry'
        ]
      }
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    setAnalysisResult(randomResult);
    setIsAnalyzing(false);
    showToast('Analysis complete!', 'success');
  };

  const getSeverityColor = (severity: string) => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
              <h3 className="text-lg font-semibold text-white mb-2">Detected Condition</h3>
              <p className="text-[#6A9FB5] text-xl font-bold mb-2">{analysisResult.condition}</p>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-gray-300 text-sm">Confidence</p>
                  <p className="text-white font-semibold">{analysisResult.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Severity</p>
                  <p className={`font-semibold ${getSeverityColor(analysisResult.severity)}`}>
                    {analysisResult.severity}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Important Notice</h3>
                  <p className="text-gray-300 text-sm">
                    This AI analysis is for informational purposes only and should not replace professional medical advice. 
                    Please consult with a qualified dermatologist for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
            <div className="flex items-center space-x-3 mb-4">
              <Info className="h-6 w-6 text-[#6A9FB5]" />
              <h3 className="text-lg font-semibold text-white">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-[#6A9FB5] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-[#C5B4E3] hover:bg-[#B5A4D3] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]">
              Book Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;