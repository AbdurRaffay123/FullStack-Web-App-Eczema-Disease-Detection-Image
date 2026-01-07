import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { imageService, Image } from '../services/imageService';
import { Trash2, Image as ImageIcon, Calendar, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

const ImageHistory: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const userImages = await imageService.getUserImages();
      setImages(userImages);
    } catch (error: any) {
      console.error('Error loading images:', error);
      showToast(error.message || 'Failed to load images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeletingId(imageId);
      await imageService.deleteImage(imageId);
      setImages(images.filter(img => img._id !== imageId));
      showToast('Image deleted successfully', 'success');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      showToast(error.message || 'Failed to delete image', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-[#6A9FB5]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Image History</h1>
        <p className="text-gray-300 text-lg">
          View all your uploaded images and analysis results
        </p>
      </div>

      {images.length === 0 ? (
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-12 text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Images Yet</h3>
          <p className="text-gray-300 mb-6">
            Upload your first image to get started with AI skin analysis
          </p>
          <a
            href="/upload"
            className="inline-flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <ImageIcon className="h-5 w-5" />
            <span>Upload Image</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image._id}
              className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl overflow-hidden hover:border-opacity-30 transition-all"
            >
              <div className="relative">
                <img
                  src={imageService.getImageUrl(image.path)}
                  alt={image.originalName}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => handleDelete(image._id)}
                  disabled={deletingId === image._id}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all disabled:opacity-50"
                >
                  {deletingId === image._id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(image.createdAt)}</span>
                </div>

                {image.analysisResult ? (
                  <div className="space-y-3">
                    {!image.analysisResult.relevant ? (
                      <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-yellow-400 font-semibold text-sm">Not Relevant</p>
                            <p className="text-gray-300 text-xs mt-1">
                              {image.analysisResult.message || 'Image does not appear to be human skin'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {image.analysisResult.eczema_detected ? (
                              <XCircle className="h-5 w-5 text-red-400" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            )}
                            <span className={`font-semibold ${image.analysisResult.eczema_detected ? 'text-red-400' : 'text-green-400'}`}>
                              {image.analysisResult.eczema_detected ? 'Eczema Detected' : 'No Eczema'}
                            </span>
                          </div>
                          <span className="text-white font-semibold">
                            {(image.analysisResult.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        {image.analysisResult.severity && (
                          <div>
                            <span className="text-gray-400 text-sm">Severity: </span>
                            <span className={`font-semibold ${getSeverityColor(image.analysisResult.severity)}`}>
                              {image.analysisResult.severity}
                            </span>
                          </div>
                        )}

                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    No analysis available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageHistory;









