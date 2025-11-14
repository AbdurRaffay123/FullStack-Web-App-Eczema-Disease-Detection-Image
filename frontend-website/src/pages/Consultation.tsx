import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
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
  Stethoscope
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
  price: {
    video: number;
    phone: number;
    chat: number;
  };
}

const Consultation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [showBooking, setShowBooking] = useState<Doctor | null>(null);
  const [bookingType, setBookingType] = useState('video');
  const { showToast } = useToast();

  const cities = ['All Cities', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio'];
  const consultationTypes = ['All Types', 'Video Call', 'Phone Call', 'Chat'];

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

  const handleBooking = () => {
    if (!showBooking) return;
    
    showToast(`Consultation with ${showBooking.name} booked successfully!`, 'success');
    setShowBooking(null);
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
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="h-4 w-4" />
                <span>{doctor.availability}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Stethoscope className="h-4 w-4" />
                <span>{doctor.experience} experience</span>
              </div>
              <div className="text-gray-300">
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
          <div className="bg-[#1A1A2E] border border-white border-opacity-20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Book Consultation</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={showBooking.avatar}
                alt={showBooking.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-white">{showBooking.name}</h3>
                <p className="text-[#6A9FB5]">{showBooking.specialty}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Consultation Type
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
                          onChange={(e) => setBookingType(e.target.value)}
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
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Consultation
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your symptoms or concerns..."
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleBooking}
                className="flex-1 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowBooking(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
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