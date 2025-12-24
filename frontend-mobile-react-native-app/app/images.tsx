import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Image as ImageIcon, Calendar, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react-native';
import { imageService, Image as ImageType } from '@/services/imageService';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useModalHelpers } from '@/context/ModalContext';

export default function ImagesScreen() {
  const { showSuccess, showError, showConfirm } = useModalHelpers();
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

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
      showError(error.message || 'Failed to load images');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadImages();
  };

  const handleDelete = async (imageId: string) => {
    showConfirm(
      'Are you sure you want to delete this image?',
      'Delete Image',
      async () => {
            try {
              setDeletingId(imageId);
              await imageService.deleteImage(imageId);
              setImages(images.filter(img => img._id !== imageId));
          showSuccess('Image deleted successfully');
            } catch (error: any) {
              console.error('Error deleting image:', error);
          showError(error.message || 'Failed to delete image');
            } finally {
              setDeletingId(null);
            }
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSeverityColor = (severity: string | null | undefined) => {
    if (!severity) return '#B0B0B0';
    switch (severity.toLowerCase()) {
      case 'mild':
        return '#28A745';
      case 'moderate':
        return '#FFA500';
      case 'severe':
        return '#DC3545';
      default:
        return '#B0B0B0';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1A1A2E', '#16213E', '#0F3460']}
          style={styles.backgroundGradient}
        >
          <View style={styles.loadingContainer}>
            <Loader size={32} color="#6A9FB5" />
            <Text style={styles.loadingText}>Loading images...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <AppHeader title="Image History" showBack showMenu={false} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {images.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ImageIcon size={64} color="#6A9FB5" />
              <Text style={styles.emptyTitle}>No Images Yet</Text>
              <Text style={styles.emptyText}>
                Upload your first image to get started with AI skin analysis
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => router.push('/ai')}
              >
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            images.map((image) => (
              <View key={image._id} style={styles.imageCard}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageService.getImageUrl(image.path) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(image._id)}
                    disabled={deletingId === image._id}
                  >
                    {deletingId === image._id ? (
                      <Loader size={16} color="#FFFFFF" />
                    ) : (
                      <Trash2 size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color="#B0B0B0" />
                    <Text style={styles.dateText}>{formatDate(image.createdAt)}</Text>
                  </View>

                  {image.analysisResult ? (
                    <View style={styles.analysisContainer}>
                      {!image.analysisResult.relevant ? (
                        <View style={styles.warningCard}>
                          <AlertCircle size={20} color="#FFA500" />
                          <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>Not Relevant</Text>
                            <Text style={styles.warningText}>
                              {image.analysisResult.message || 'Image does not appear to be human skin'}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <>
                          <View style={styles.resultRow}>
                            <View style={styles.resultLeft}>
                              {image.analysisResult.eczema_detected ? (
                                <XCircle size={20} color="#DC3545" />
                              ) : (
                                <CheckCircle size={20} color="#28A745" />
                              )}
                              <Text
                                style={[
                                  styles.resultText,
                                  {
                                    color: image.analysisResult.eczema_detected
                                      ? '#DC3545'
                                      : '#28A745',
                                  },
                                ]}
                              >
                                {image.analysisResult.eczema_detected
                                  ? 'Eczema Detected'
                                  : 'No Eczema'}
                              </Text>
                            </View>
                            <Text style={styles.confidenceText}>
                              {(image.analysisResult.confidence * 100).toFixed(0)}%
                            </Text>
                          </View>

                          {image.analysisResult.severity && (
                            <View style={styles.severityContainer}>
                              <Text style={styles.severityLabel}>Severity: </Text>
                              <Text
                                style={[
                                  styles.severityValue,
                                  { color: getSeverityColor(image.analysisResult.severity) },
                                ]}
                              >
                                {image.analysisResult.severity}
                              </Text>
                            </View>
                          )}

                          {image.analysisResult.explanation && (
                            <Text style={styles.explanationText} numberOfLines={2}>
                              {image.analysisResult.explanation}
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.noAnalysisText}>No analysis available</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#6A9FB5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  imageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC3545',
    borderRadius: 20,
    padding: 8,
  },
  cardContent: {
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  analysisContainer: {
    gap: 8,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
    gap: 8,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#FFA500',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
  },
  confidenceText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  severityContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  severityLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  severityValue: {
    fontSize: 14,
    fontFamily: 'OpenSans-Bold',
  },
  explanationText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  noAnalysisText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
});

