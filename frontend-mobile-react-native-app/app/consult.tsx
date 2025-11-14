import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, MessageCircle, Video, Star, MapPin, Clock, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConsultScreen() {
  const router = useRouter();

  const specialists = [
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
    },
  ];

  const consultationTypes = [
    {
      id: 'video',
      title: 'Video Consultation',
      subtitle: 'Face-to-face consultation from home',
      icon: Video,
      color: '#6A9FB5',
      duration: '30 minutes',
    },
    {
      id: 'phone',
      title: 'Phone Consultation',
      subtitle: 'Quick consultation over the phone',
      icon: Phone,
      color: '#28A745',
      duration: '20 minutes',
    },
    {
      id: 'chat',
      title: 'Text Consultation',
      subtitle: 'Get advice through secure messaging',
      icon: MessageCircle,
      color: '#FFA500',
      duration: '24h response',
    },
  ];

  const handleBookConsultation = (doctorId: number, type: string) => {
    // In a real app, this would navigate to booking flow
    router.push(`/booking?doctor=${doctorId}&type=${type}`);
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:911');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Healthcare Specialists</Text>
          <View style={styles.placeholder} />
        </View>

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

          <View style={styles.consultationTypesSection}>
            <Text style={styles.sectionTitle}>Consultation Types</Text>
            <View style={styles.consultationGrid}>
              {consultationTypes.map((type) => (
                <View key={type.id} style={styles.consultationCard}>
                  <View style={[styles.consultationIcon, { backgroundColor: type.color }]}>
                    <type.icon size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.consultationTitle}>{type.title}</Text>
                  <Text style={styles.consultationSubtitle}>{type.subtitle}</Text>
                  <Text style={styles.consultationDuration}>{type.duration}</Text>
                </View>
              ))}
            </View>
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
                    <View style={styles.detailItem}>
                      <MapPin size={14} color="#B0B0B0" />
                      <Text style={styles.detailText}>{doctor.location}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Calendar size={14} color="#28A745" />
                      <Text style={[styles.detailText, { color: '#28A745' }]}>{doctor.availability}</Text>
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
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.videoButton]}
                        onPress={() => handleBookConsultation(doctor.id, 'video')}
                      >
                        <Video size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Video</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.phoneButton]}
                        onPress={() => handleBookConsultation(doctor.id, 'phone')}
                      >
                        <Phone size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.chatButton]}
                        onPress={() => handleBookConsultation(doctor.id, 'chat')}
                      >
                        <MessageCircle size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
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
                <Text style={styles.stepText}>Choose your preferred consultation type</Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Select an available specialist</Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Book your appointment and get expert care</Text>
              </View>
            </View>
          </View>
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
  consultationTypesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  consultationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  consultationCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  consultationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  consultationTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  consultationSubtitle: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 8,
  },
  consultationDuration: {
    fontSize: 12,
    fontFamily: 'OpenSans-SemiBold',
    color: '#6A9FB5',
  },
  specialistsSection: {
    padding: 16,
    paddingTop: 0,
  },
  doctorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  },
  doctorName: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
    marginBottom: 12,
  },
  doctorStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  languagesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  videoButton: {
    backgroundColor: '#6A9FB5',
  },
  phoneButton: {
    backgroundColor: '#28A745',
  },
  chatButton: {
    backgroundColor: '#FFA500',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
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
});