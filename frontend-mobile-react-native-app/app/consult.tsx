import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, TextInput, ActivityIndicator, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Video, Star, MapPin, Clock, Calendar, User, Mail, X, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { consultationService, CreateConsultationData } from '@/services/consultationService';
import { userService, UserProfile } from '@/services/userService';
import AppHeader from '@/components/AppHeader';
import { useModalHelpers } from '@/context/ModalContext';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  image: string;
  availability: string;
  consultationFee: string;
  languages: string[];
  phone: string;
  email: string;
}

export default function ConsultScreen() {
  const router = useRouter();
  const { showSuccess, showError, showConfirm } = useModalHelpers();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [consultationType, setConsultationType] = useState<'video' | 'phone'>('video');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const specialists: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Junaid',
      specialty: 'Dermatologist',
      rating: 4.9,
      reviews: 127,
      experience: '15 years',
      location: 'Sheikhupura, Punjab',
      image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
      availability: 'Available Today',
      consultationFee: '$150',
      languages: ['English', 'Urdu'],
      phone: '+92 300 1234567',
      email: 'abdurraffaykhan0732@gmail.com',
    },
    {
      id: 2,
      name: 'Dr. Senan Rashid',
      specialty: 'Pediatric Dermatologist',
      rating: 4.8,
      reviews: 89,
      experience: '12 years',
      location: 'Lahore, Punjab',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      availability: 'Available Tomorrow',
      consultationFee: '$175',
      languages: ['English', 'Urdu'],
      phone: '+92 300 2345678',
      email: 'dr.senan@healthcare.com',
    },
    {
      id: 3,
      name: 'Dr. Waseem',
      specialty: 'Dermatologist & Allergist',
      rating: 4.9,
      reviews: 203,
      experience: '18 years',
      location: 'Lahore, Punjab',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      availability: 'Available Today',
      consultationFee: '$160',
      languages: ['English', 'Urdu', 'Punjabi'],
      phone: '+92 300 3456789',
      email: 'dr.waseem@healthcare.com',
    },
  ];

  const consultationTypes = [
    {
      id: 'video',
      title: 'Video Call',
      subtitle: 'Face-to-face consultation from home',
      icon: Video,
      color: '#6A9FB5',
      duration: '30 minutes',
    },
    {
      id: 'phone',
      title: 'Audio Call',
      subtitle: 'Quick consultation over the phone',
      icon: Phone,
      color: '#28A745',
      duration: '20 minutes',
    },
  ];

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await userService.getProfile();
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleBookConsultation = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setConsultationType('video'); // Default to video
    setShowBookingModal(true);
    // Reset form - set tomorrow as default date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreferredDate(tomorrow.toISOString().split('T')[0]); // YYYY-MM-DD
    setPreferredTime('09:00'); // Default time
    setReason('');
  };

  const handleSubmitBooking = async () => {
    if (!selectedDoctor) return;

    // Validate form
    if (!reason.trim() || reason.trim().length < 10) {
      showError('Please provide a reason for consultation (at least 10 characters)', 'Validation Error');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(preferredDate)) {
      showError('Please enter a valid date in YYYY-MM-DD format', 'Validation Error');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(preferredTime)) {
      showError('Please enter a valid time in HH:MM format (24-hour)', 'Validation Error');
      return;
    }

    // Check if date is in the future
    const selectedDateTime = new Date(preferredDate);
    const [hours, minutes] = preferredTime.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    if (selectedDateTime <= new Date()) {
      showError('Preferred date and time must be in the future', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract price from consultation fee (remove $ and parse)
      const priceStr = selectedDoctor.consultationFee.replace('$', '');
      const price = parseFloat(priceStr) || 0;

      const bookingData: CreateConsultationData = {
        consultationType,
        preferredDate: preferredDate, // Already in YYYY-MM-DD format
        preferredTime: preferredTime, // Already in HH:MM format
        reason: reason.trim(),
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        doctorEmail: selectedDoctor.email,
        doctorPhone: selectedDoctor.phone,
        price,
      };

      await consultationService.createConsultation(bookingData);
      showSuccess(
        `Consultation with ${selectedDoctor.name} booked successfully! Confirmation emails have been sent to you and the doctor.`,
        'Success',
        () => {
          setShowBookingModal(false);
          setSelectedDoctor(null);
          // Reset form
          setPreferredDate('');
          setPreferredTime('');
          setReason('');
          setConsultationType('video');
        }
      );
    } catch (error: any) {
      // Handle profile incomplete error
      if (error.message?.includes('PROFILE_INCOMPLETE')) {
        const errorMsg = error.message.replace('PROFILE_INCOMPLETE: ', '');
        showConfirm(
          errorMsg,
          'Profile Incomplete',
          () => {
            setShowBookingModal(false);
            router.push('/(tabs)/profile');
          },
          () => {
            // Cancel - do nothing
          }
        );
      } else if (error.message?.includes('Profile incomplete')) {
        showConfirm(
          'Please complete your profile before booking a consultation',
          'Profile Incomplete',
          () => {
            setShowBookingModal(false);
            router.push('/(tabs)/profile');
          },
          () => {
            // Cancel - do nothing
          }
        );
      } else if (error.message?.includes('validation') || error.message?.includes('required')) {
        showError(error.message || 'Please check all required fields', 'Validation Error');
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        showError('Please check your connection and try again.', 'Network Error');
      } else {
        showError(error.message || 'Failed to book consultation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:911');
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <AppHeader title="Healthcare Specialists" showBack showMenu={false} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.emergencySection}>
            <Text style={styles.emergencyTitle}>Emergency?</Text>
            <Text style={styles.emergencySubtitle}>
              If you're experiencing a severe allergic reaction or emergency, call 911 immediately
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>Call Emergency Services</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.specialistsSection}>
            <Text style={styles.sectionTitle}>Available Specialists</Text>
            {specialists.map((doctor) => (
              <View key={doctor.id} style={styles.doctorCard}>
                <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
                
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                  
                  <View style={styles.doctorStats}>
                    <View style={styles.statItem}>
                      <Star size={16} color="#FFA500" />
                      <Text style={styles.statText}>{doctor.rating} ({doctor.reviews})</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Clock size={16} color="#6A9FB5" />
                      <Text style={styles.statText}>{doctor.experience}</Text>
                    </View>
                  </View>

                  <View style={styles.doctorDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <MapPin size={14} color="#B0B0B0" />
                        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{doctor.location}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Calendar size={14} color="#28A745" />
                        <Text style={[styles.detailText, { color: '#28A745' }]} numberOfLines={1} ellipsizeMode="tail">{doctor.availability}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Phone size={14} color="#6A9FB5" />
                        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{doctor.phone}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Mail size={14} color="#6A9FB5" />
                        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{doctor.email}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.languagesContainer}>
                    {doctor.languages.map((lang) => (
                      <View key={lang} style={styles.languageTag}>
                        <Text style={styles.languageText}>{lang}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.consultationActions}>
                    <Text style={styles.consultationFee}>{doctor.consultationFee}</Text>
                    <TouchableOpacity 
                      style={styles.bookNowButton}
                      onPress={() => handleBookConsultation(doctor)}
                    >
                      <Text style={styles.bookNowButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How it works</Text>
              <View style={styles.infoSteps}>
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Select an available specialist</Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Click "Book Now" and fill in the form</Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Choose consultation type (Video or Audio) and confirm booking</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Booking Modal */}
        <Modal
          visible={showBookingModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowBookingModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Consultation</Text>
                <TouchableOpacity
                  onPress={() => setShowBookingModal(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {selectedDoctor && (
                <View style={styles.doctorInfoModal}>
                  <Image source={{ uri: selectedDoctor.image }} style={styles.doctorImageModal} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.doctorNameModal}>{selectedDoctor.name}</Text>
                    <Text style={styles.doctorSpecialtyModal}>{selectedDoctor.specialty}</Text>
                    <View style={{ marginTop: 8, gap: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Phone size={12} color="#6A9FB5" />
                        <Text style={[styles.detailText, { fontSize: 12 }]}>{selectedDoctor.phone}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Mail size={12} color="#6A9FB5" />
                        <Text style={[styles.detailText, { fontSize: 12 }]} numberOfLines={1}>{selectedDoctor.email}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* User Profile Info (Auto-filled, Read-only) */}
              {isLoadingProfile ? (
                <View style={styles.profileSection}>
                  <ActivityIndicator size="small" color="#6A9FB5" />
                  <Text style={styles.profileLoadingText}>Loading profile...</Text>
                </View>
              ) : userProfile ? (
                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>Your Information</Text>
                  <View style={styles.profileInfo}>
                    <View style={styles.profileRow}>
                      <User size={16} color="#6A9FB5" />
                      <Text style={styles.profileText}>{userProfile.fullName || userProfile.name}</Text>
                    </View>
                    <View style={styles.profileRow}>
                      <Mail size={16} color="#6A9FB5" />
                      <Text style={styles.profileText}>{userProfile.email}</Text>
                    </View>
                    {userProfile.phoneNumber && (
                      <View style={styles.profileRow}>
                        <Phone size={16} color="#6A9FB5" />
                        <Text style={styles.profileText}>{userProfile.phoneNumber}</Text>
                      </View>
                    )}
                    {userProfile.dateOfBirth && (
                      <View style={styles.profileRow}>
                        <Calendar size={16} color="#6A9FB5" />
                        <Text style={styles.profileText}>
                          {new Date(userProfile.dateOfBirth).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : null}

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* Consultation Type */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Consultation Type *</Text>
                  <View style={styles.typeButtons}>
                    {consultationTypes.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = consultationType === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.typeButton,
                            isSelected && { backgroundColor: type.color, borderColor: type.color },
                          ]}
                          onPress={() => setConsultationType(type.id as 'video' | 'phone')}
                        >
                          <IconComponent size={20} color={isSelected ? '#FFFFFF' : type.color} />
                          <Text
                            style={[
                              styles.typeButtonText,
                              isSelected && styles.typeButtonTextSelected,
                            ]}
                          >
                            {type.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Preferred Date */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Preferred Date *</Text>
                  <View style={styles.dateTimeButton}>
                    <Calendar size={20} color="#6A9FB5" />
                    <TextInput
                      style={styles.dateTimeInput}
                      value={preferredDate}
                      onChangeText={setPreferredDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#666666"
                      keyboardType="numeric"
                    />
                  </View>
                  {preferredDate && (
                    <Text style={styles.dateDisplayText}>{formatDateDisplay(preferredDate)}</Text>
                  )}
                  <Text style={styles.helperText}>Minimum date: {getMinDate()}</Text>
                </View>

                {/* Preferred Time */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Preferred Time *</Text>
                  <View style={styles.dateTimeButton}>
                    <Clock size={20} color="#6A9FB5" />
                    <TextInput
                      style={styles.dateTimeInput}
                      value={preferredTime}
                      onChangeText={(text) => {
                        // Format as HH:MM
                        const formatted = text.replace(/[^\d]/g, '').slice(0, 4);
                        if (formatted.length <= 2) {
                          setPreferredTime(formatted);
                        } else {
                          setPreferredTime(`${formatted.slice(0, 2)}:${formatted.slice(2)}`);
                        }
                      }}
                      placeholder="HH:MM (24-hour)"
                      placeholderTextColor="#666666"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <Text style={styles.helperText}>Format: HH:MM (e.g., 14:30 for 2:30 PM)</Text>
                </View>

                {/* Reason */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Reason for Consultation *</Text>
                  <TextInput
                    style={styles.reasonInput}
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Briefly describe your symptoms or concerns (minimum 10 characters)..."
                    placeholderTextColor="#666666"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <Text style={styles.charCount}>{reason.length}/1000 characters</Text>
                </View>
              </ScrollView>

              {/* Submit Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmitBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle size={20} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Confirm Booking</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowBookingModal(false)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  emergencySection: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  emergencyTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#DC3545',
    marginBottom: 8,
  },
  emergencySubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  specialistsSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  doctorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    overflow: 'hidden',
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 16,
  },
  doctorInfo: {
    alignItems: 'center',
    width: '100%',
  },
  doctorName: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
    marginBottom: 12,
    textAlign: 'center',
  },
  doctorStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  doctorDetails: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    flex: 1,
    flexShrink: 1,
  },
  languagesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  languageTag: {
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
  },
  consultationActions: {
    width: '100%',
    alignItems: 'center',
  },
  consultationFee: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#28A745',
    marginBottom: 12,
  },
  bookNowButton: {
    backgroundColor: '#6A9FB5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  infoSection: {
    padding: 16,
    paddingTop: 0,
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoSteps: {
    gap: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6A9FB5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  doctorImageModal: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  doctorNameModal: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doctorSpecialtyModal: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
  },
  profileSection: {
    padding: 20,
    backgroundColor: 'rgba(106, 159, 181, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileSectionTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#6A9FB5',
    marginBottom: 12,
  },
  profileInfo: {
    gap: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  profileLoadingText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginTop: 8,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(106, 159, 181, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: 'OpenSans-SemiBold',
    color: '#6A9FB5',
  },
  typeButtonTextSelected: {
    color: '#FFFFFF',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 12,
  },
  dateTimeInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  dateDisplayText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
    marginTop: 4,
  },
  reasonInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
    marginTop: 8,
    textAlign: 'right',
  },
  modalFooter: {
    padding: 20,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A9FB5',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
  },
});
