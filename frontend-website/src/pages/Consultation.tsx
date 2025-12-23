import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { consultationService, CreateConsultationData } from '../services/consultationService';
import { userService } from '../services/userService';
import { 
  Search, 
  Filter, 
  Video, 
  Phone, 
  MessageSquare, 
  Star, 
  MapPin, 
  Clock,
  Calendar,
  AlertCircle,
  Stethoscope,
  User,
  Mail,
  Phone as PhoneIcon
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  avatar: string;
  availability: string;
  consultationTypes: string[];
  languages: string[];
  experience: string;
  phone: string;
  email: string;
  price: {
    video: number;
    phone: number;
    chat: number;
  };
}

const Consultation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [showBooking, setShowBooking] = useState<Doctor | null>(null);
  const [bookingType, setBookingType] = useState<'video' | 'phone' | 'chat'>('video');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const cities = ['All Cities', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio'];
  const consultationTypes = ['All Types', 'Video Call', 'Phone Call', 'Chat'];

  // Load user profile on mount
  useEffect(() => {
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

    if (user) {
      loadProfile();
    }
  }, [user]);

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Dermatologist',
      rating: 4.9,
      reviews: 127,
      location: 'New York, NY',
      avatar: 'https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      availability: 'Available Today',
      consultationTypes: ['video', 'phone', 'chat'],
      languages: ['English', 'Spanish'],
      experience: '12 years',
      phone: '+1 (212) 555-0123',
      email: 'abdurraffaykhan0732@gmail.com',
      price: {
        video: 150,
        phone: 120,
        chat: 80
      }
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Allergist & Immunologist',
      rating: 4.8,
      reviews: 89,
      location: 'Los Angeles, CA',
      avatar: 'https://images.pexels.com/photos/6789888/pexels-photo-6789888.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      availability: 'Next Available: Tomorrow',
      consultationTypes: ['video', 'phone'],
      languages: ['English', 'Mandarin'],
      experience: '8 years',
      phone: '+1 (310) 555-0456',
      email: 'michael.chen@healthcare.com',
      price: {
        video: 180,
        phone: 140,
        chat: 0
      }
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatric Dermatologist',
      rating: 4.9,
      reviews: 156,
      location: 'Chicago, IL',
      avatar: 'https://images.pexels.com/photos/7445017/pexels-photo-7445017.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      availability: 'Available Today',
      consultationTypes: ['video', 'phone', 'chat'],
      languages: ['English', 'Spanish', 'Portuguese'],
      experience: '15 years',
      phone: '+1 (312) 555-0789',
      email: 'emily.rodriguez@healthcare.com',
      price: {
        video: 200,
        phone: 160,
        chat: 100
      }
    },
    {
      id: '4',
      name: 'Dr. David Kumar',
      specialty: 'Dermatologist',
      rating: 4.7,
      reviews: 203,
      location: 'Houston, TX',
      avatar: 'https://images.pexels.com/photos/6129021/pexels-photo-6129021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      availability: 'Next Available: In 2 hours',
      consultationTypes: ['video', 'chat'],
      languages: ['English', 'Hindi'],
      experience: '10 years',
      phone: '+1 (713) 555-0321',
      email: 'david.kumar@healthcare.com',
      price: {
        video: 130,
        phone: 0,
        chat: 70
      }
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'All Cities' || doctor.location.includes(selectedCity);
    const matchesType = selectedType === 'All Types' || 
                       (selectedType === 'Video Call' && doctor.consultationTypes.includes('video')) ||
                       (selectedType === 'Phone Call' && doctor.consultationTypes.includes('phone')) ||
                       (selectedType === 'Chat' && doctor.consultationTypes.includes('chat'));
    return matchesSearch && matchesCity && matchesType;
  });

  const handleBooking = async () => {
    if (!showBooking) return;

    // Validate form
    if (!preferredDate) {
      showToast('Please select a preferred date', 'error');
      return;
    }

    if (!preferredTime) {
      showToast('Please select a preferred time', 'error');
      return;
    }

    if (!reason.trim() || reason.trim().length < 10) {
      showToast('Please provide a reason for consultation (at least 10 characters)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData: CreateConsultationData = {
        consultationType: bookingType,
        preferredDate: preferredDate,
        preferredTime: preferredTime,
        reason: reason.trim(),
        doctorName: showBooking.name,
        doctorSpecialty: showBooking.specialty,
        doctorEmail: showBooking.email,
        doctorPhone: showBooking.phone,
        price: showBooking.price[bookingType],
      };

      await consultationService.createConsultation(bookingData);
      showToast(`Consultation with ${showBooking.name} booked successfully! Confirmation emails have been sent.`, 'success');
      
      // Reset form
      setShowBooking(null);
      setPreferredDate('');
      setPreferredTime('');
      setReason('');
      setBookingType('video');
    } catch (error: any) {
      // Handle profile incomplete error
      if (error.message?.includes('PROFILE_INCOMPLETE')) {
        const errorMsg = error.message.replace('PROFILE_INCOMPLETE: ', '');
        showToast(errorMsg, 'error');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else if (error.message?.includes('Profile incomplete')) {
        showToast('Please complete your profile before booking a consultation', 'error');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else if (error.message?.includes('validation') || error.message?.includes('required')) {
        showToast(error.message || 'Please check all required fields', 'error');
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        showToast('Network error. Please check your connection and try again.', 'error');
      } else {
        showToast(error.message || 'Failed to book consultation. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'phone':
        return Phone;
      case 'chat':
        return MessageSquare;
      default:
        return Video;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  // Calculate minimum date (today)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Healthcare Consultation</h1>
        <p className="text-gray-300 text-lg">
          Connect with certified dermatologists and specialists
        </p>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-red-300 font-semibold">Medical Emergency?</h3>
            <p className="text-red-200 text-sm">
              If you're experiencing a severe allergic reaction or emergency, call 911 immediately or visit your nearest emergency room.
            </p>
          </div>
          <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap">
            Emergency Help
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctors or specialties..."
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] appearance-none"
            >
              {cities.map(city => (
                <option key={city} value={city} className="bg-gray-800">
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] appearance-none"
            >
              {consultationTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map(doctor => (
          <div
            key={doctor.id}
            className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300"
          >
            <div className="flex items-start space-x-4 mb-4">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#6A9FB5]"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{doctor.name}</h3>
                <p className="text-[#6A9FB5] font-medium">{doctor.specialty}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    {renderStars(doctor.rating)}
                  </div>
                  <span className="text-gray-300 text-sm">
                    {doctor.rating} ({doctor.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{doctor.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{doctor.availability}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Stethoscope className="h-4 w-4 flex-shrink-0" />
                <span>{doctor.experience} experience</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{doctor.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{doctor.email}</span>
              </div>
              <div className="text-gray-300 col-span-2 md:col-span-1">
                <span>Languages: {doctor.languages.join(', ')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {doctor.consultationTypes.map(type => {
                  const IconComponent = getConsultationIcon(type);
                  const price = doctor.price[type as keyof typeof doctor.price];
                  return price > 0 ? (
                    <div key={type} className="text-center">
                      <div className="bg-[#6A9FB5] bg-opacity-20 p-2 rounded-lg mb-1">
                        <IconComponent className="h-4 w-4 text-[#6A9FB5]" />
                      </div>
                      <span className="text-xs text-gray-300">${price}</span>
                    </div>
                  ) : null;
                })}
              </div>
              
              <button
                onClick={() => setShowBooking(doctor)}
                className="bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No doctors found</h3>
          <p className="text-gray-300">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A2E] border border-white border-opacity-20 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Book Consultation</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={showBooking.avatar}
                alt={showBooking.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{showBooking.name}</h3>
                <p className="text-[#6A9FB5]">{showBooking.specialty}</p>
                <div className="flex flex-col space-y-1 mt-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <PhoneIcon className="h-3 w-3" />
                    <span>{showBooking.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{showBooking.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile Info (Auto-filled, Read-only) */}
            {isLoadingProfile ? (
              <div className="mb-6 text-center text-gray-400">Loading profile...</div>
            ) : userProfile ? (
              <div className="bg-white bg-opacity-5 rounded-lg p-4 mb-6 space-y-2">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Your Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span>{userProfile.fullName || userProfile.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span>{userProfile.email}</span>
                  </div>
                  {userProfile.phoneNumber && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{userProfile.phoneNumber}</span>
                    </div>
                  )}
                  {userProfile.dateOfBirth && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(userProfile.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Consultation Type *
                </label>
                <div className="space-y-2">
                  {showBooking.consultationTypes.map(type => {
                    const IconComponent = getConsultationIcon(type);
                    const price = showBooking.price[type as keyof typeof showBooking.price];
                    return price > 0 ? (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="consultationType"
                          value={type}
                          checked={bookingType === type}
                          onChange={(e) => setBookingType(e.target.value as 'video' | 'phone' | 'chat')}
                          className="text-[#6A9FB5] focus:ring-[#6A9FB5]"
                        />
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-[#6A9FB5]" />
                          <span className="text-white capitalize">{type} Call</span>
                          <span className="text-[#6A9FB5] font-semibold">${price}</span>
                        </div>
                      </label>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Consultation *
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe your symptoms or concerns (minimum 10 characters)..."
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{reason.length}/1000 characters</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleBooking}
                disabled={isSubmitting}
                className="flex-1 bg-[#6A9FB5] hover:bg-[#5A8FA5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
              <button
                onClick={() => {
                  setShowBooking(null);
                  setPreferredDate('');
                  setPreferredTime('');
                  setReason('');
                }}
                disabled={isSubmitting}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultation;
