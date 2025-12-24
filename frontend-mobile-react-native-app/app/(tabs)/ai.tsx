import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, RotateCcw, Upload, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { imageService, ImageAnalysisResult } from '@/services/imageService';

export default function AIScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo?.uri || null);
        setShowCamera(false);
        analyzeImage(photo?.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string | undefined) => {
    if (!imageUri) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await imageService.uploadImage(imageUri);
      setAnalysisResult(result.analysis);
      Alert.alert('Success', 'Image analyzed successfully!');
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert('Error', error.message || 'Failed to analyze image. Please try again.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const resetAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1A1A2E', '#16213E', '#0F3460']}
          style={styles.backgroundGradient}
        >
          <View style={styles.permissionContainer}>
            <Camera size={64} color="#6A9FB5" />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to analyze your skin condition
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          facing={facing}
          ref={cameraRef}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cameraButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={toggleCameraFacing}
              >
                <RotateCcw size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cameraFooter}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI Skin Analysis</Text>
          <Text style={styles.subtitle}>
            Get instant insights about your skin condition
          </Text>
        </View>

        {!capturedImage && !analysisResult && (
          <View style={styles.uploadContainer}>
            <View style={styles.uploadIcon}>
              <Camera size={48} color="#6A9FB5" />
            </View>
            <Text style={styles.uploadTitle}>Take or Upload a Photo</Text>
            <Text style={styles.uploadDescription}>
              Capture a clear photo of the affected skin area for AI analysis
            </Text>
            
            <View style={styles.buttonContainer}>
              <LinearGradient
                colors={['#6A9FB5', '#C5B4E3']}
                style={styles.actionButton}
              >
                <TouchableOpacity 
                  onPress={() => setShowCamera(true)} 
                  style={styles.actionButtonTouchable}
                >
                  <Camera size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </LinearGradient>
              
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Upload size={20} color="#6A9FB5" />
                <Text style={styles.uploadButtonText}>Upload from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {capturedImage && isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            <View style={styles.analyzingContent}>
              <Text style={styles.analyzingTitle}>Analyzing...</Text>
              <Text style={styles.analyzingDescription}>
                Our AI is examining your image. This may take a few moments.
              </Text>
              <View style={styles.loadingIndicator}>
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
              </View>
            </View>
          </View>
        )}

        {analysisResult && (
          <View style={styles.resultContainer}>
            <Image source={{ uri: capturedImage }} style={styles.resultImage} />
            
            <View style={styles.resultContent}>
              <View style={styles.resultHeader}>
                <CheckCircle size={24} color="#28A745" />
                <Text style={styles.resultTitle}>Analysis Complete</Text>
              </View>
              
              {!analysisResult.relevant ? (
                <View style={styles.warningCard}>
                  <AlertCircle size={24} color="#FFA500" />
                  <Text style={styles.warningTitle}>Image Not Relevant</Text>
                  <Text style={styles.warningText}>
                    {analysisResult.message || analysisResult.explanation || 'The uploaded image does not appear to be human skin.'}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.diagnosisCard}>
                    <Text style={styles.diagnosisTitle}>Analysis Result</Text>
                    <Text style={[
                      styles.diagnosisCondition,
                      { color: analysisResult.eczema_detected ? '#DC3545' : '#28A745' }
                    ]}>
                      {analysisResult.eczema_detected ? 'Eczema Detected' : 'No Eczema Detected'}
                    </Text>
                    <View style={styles.confidenceContainer}>
                      <Text style={styles.confidenceLabel}>Confidence: </Text>
                      <Text style={styles.confidenceValue}>
                        {(analysisResult.confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                    {analysisResult.severity && (
                      <Text style={styles.severityText}>
                        Severity: {analysisResult.severity}
                      </Text>
                    )}
                  </View>
                  
                  {analysisResult.explanation && (
                    <View style={styles.explanationCard}>
                      <Text style={styles.explanationTitle}>Explanation</Text>
                      <Text style={styles.explanationText}>{analysisResult.explanation}</Text>
                    </View>
                  )}
                  
                  <View style={styles.disclaimerCard}>
                    <AlertCircle size={16} color="#FFA500" />
                    <Text style={styles.disclaimerText}>
                      {analysisResult.disclaimer || 'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a dermatologist for proper diagnosis and treatment.'}
                    </Text>
                  </View>
                </>
              )}
              
              <TouchableOpacity style={styles.newAnalysisButton} onPress={resetAnalysis}>
                <Text style={styles.newAnalysisButtonText}>Analyze Another Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#6A9FB5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
  },
  cameraButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  cameraFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6A9FB5',
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#6A9FB5',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadButtonText: {
    color: '#6A9FB5',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  analyzingContainer: {
    flex: 1,
    padding: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  analyzingContent: {
    alignItems: 'center',
  },
  analyzingTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  analyzingDescription: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6A9FB5',
  },
  resultContainer: {
    flex: 1,
    padding: 24,
  },
  resultImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  diagnosisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diagnosisTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  diagnosisCondition: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#6A9FB5',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  confidenceValue: {
    fontSize: 14,
    fontFamily: 'OpenSans-Bold',
    color: '#28A745',
  },
  severityText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  recommendationsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#6A9FB5',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.2)',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#FFA500',
    marginLeft: 8,
    lineHeight: 16,
  },
  newAnalysisButton: {
    backgroundColor: '#6A9FB5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newAnalysisButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFA500',
    textAlign: 'center',
    lineHeight: 20,
  },
  explanationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  explanationTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});