import React, { useState } from 'react';
import { Search, Filter, Lightbulb, Heart, Sun, Home, AlertTriangle } from 'lucide-react';

interface Tip {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  readTime: string;
}

const Tips: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const categories = ['All', 'Skincare', 'Lifestyle', 'Weather', 'Diet', 'Prevention'];

  // Tips organized by severity level
  const tipsBySeverity = {
    Low: [
      {
        id: 'low-1',
        title: 'Daily Moisturizing Routine',
        category: 'Skincare',
        content: `For mild eczema, maintaining a consistent moisturizing routine is key. Apply a fragrance-free, hypoallergenic moisturizer twice daily - once in the morning and once before bed.

Key points:
• Use lightweight, non-greasy moisturizers
• Look for ingredients like ceramides and hyaluronic acid
• Apply after showering while skin is still slightly damp
• Keep a travel-sized moisturizer for on-the-go use
• Choose products specifically labeled for sensitive skin

Remember: Consistency is more important than the specific product. Find what works and stick with it.`,
        tags: ['moisturizer', 'daily routine', 'prevention'],
        readTime: '3 min'
      },
      {
        id: 'low-2',
        title: 'Gentle Cleansing Practices',
        category: 'Skincare',
        content: `Proper cleansing helps maintain skin health without causing irritation. Use gentle, fragrance-free cleansers designed for sensitive skin.

Best practices:
• Use lukewarm water (not hot)
• Limit showers to 5-10 minutes
• Choose soap-free or syndet cleansers
• Pat skin dry gently with a soft towel
• Apply moisturizer within 3 minutes of bathing
• Consider cleansing oils for dry skin

Avoid: Harsh scrubs, antibacterial soaps, and products with fragrances or essential oils.`,
        tags: ['cleansing', 'bathing', 'gentle care'],
        readTime: '3 min'
      },
      {
        id: 'low-3',
        title: 'Clothing and Fabric Choices',
        category: 'Lifestyle',
        content: `The clothes you wear can significantly impact your skin. Choose fabrics and styles that minimize irritation.

Recommended:
• Wear 100% cotton or bamboo fabrics
• Avoid wool and synthetic materials directly on skin
• Choose loose-fitting clothing
• Wash new clothes before wearing
• Use fragrance-free, hypoallergenic detergents
• Avoid fabric softeners and dryer sheets
• Remove tags that might scratch skin

Tip: Layer cotton clothing under wool or synthetic materials if you must wear them.`,
        tags: ['clothing', 'fabric', 'comfort'],
        readTime: '3 min'
      },
      {
        id: 'low-4',
        title: 'Hydration and Diet Basics',
        category: 'Diet',
        content: `While food doesn't cause eczema, maintaining good hydration and a balanced diet supports overall skin health.

Hydration tips:
• Drink plenty of water throughout the day
• Limit caffeine and alcohol (they can dehydrate)
• Eat water-rich foods like fruits and vegetables

Diet considerations:
• Include anti-inflammatory foods (berries, leafy greens, fatty fish)
• Consider probiotics (yogurt, kefir)
• Maintain a balanced diet with variety
• Keep a food diary if you suspect food triggers

Note: Only eliminate foods under medical supervision.`,
        tags: ['diet', 'hydration', 'nutrition'],
        readTime: '4 min'
      },
      {
        id: 'low-5',
        title: 'Stress Management Basics',
        category: 'Lifestyle',
        content: `Stress can trigger or worsen eczema symptoms. Simple stress management techniques can help prevent flare-ups.

Easy techniques:
• Practice deep breathing for 5 minutes daily
• Take short breaks during stressful activities
• Maintain a regular sleep schedule
• Try gentle exercise like walking or yoga
• Listen to calming music or nature sounds
• Keep a simple stress journal

Remember: Small, consistent practices are more effective than occasional intensive efforts.`,
        tags: ['stress', 'mental health', 'wellness'],
        readTime: '4 min'
      },
      {
        id: 'low-6',
        title: 'Environmental Protection',
        category: 'Prevention',
        content: `Simple changes to your environment can help prevent eczema flare-ups and maintain healthy skin.

Home environment:
• Use a humidifier in dry climates or winter months
• Keep indoor temperature comfortable (not too hot)
• Vacuum regularly to reduce dust
• Wash bedding weekly in hot water
• Choose fragrance-free household products
• Keep pets out of bedrooms if you have allergies

Outdoor protection:
• Wear protective clothing in extreme weather
• Use gentle sunscreen (mineral-based, fragrance-free)
• Rinse off after swimming (chlorine/salt water)`,
        tags: ['environment', 'prevention', 'home'],
        readTime: '4 min'
      }
    ],
    Moderate: [
      {
        id: 'mod-1',
        title: 'Intensive Moisturizing Protocol',
        category: 'Skincare',
        content: `For moderate eczema, a more intensive moisturizing approach is needed. This includes multiple applications and potentially different products for different areas.

Protocol:
• Apply moisturizer 3-4 times daily
• Use thicker, cream-based products (not lotions)
• Apply immediately after bathing (within 3 minutes)
• Consider using different products for face vs body
• Use occlusive products at night (petroleum jelly, thick creams)
• Keep moisturizer at room temperature for better absorption

Product selection:
• Look for ceramides, hyaluronic acid, glycerin, and dimethicone
• Avoid products with fragrances, dyes, or alcohol
• Consider prescription barrier repair creams if recommended by doctor`,
        tags: ['moisturizer', 'intensive care', 'barrier repair'],
        readTime: '4 min'
      },
      {
        id: 'mod-2',
        title: 'Wet Wrap Therapy',
        category: 'Skincare',
        content: `Wet wrap therapy can be highly effective for moderate eczema. This technique helps lock in moisture and provides a protective barrier.

How to do wet wrap therapy:
1. Take a lukewarm bath or shower (10-15 minutes)
2. Pat skin dry gently, leaving it slightly damp
3. Apply prescribed or recommended moisturizer/medication
4. Soak cotton bandages or clothing in warm water
5. Wring out excess water and apply over treated areas
6. Cover with dry layer (pajamas or dry bandages)
7. Leave on for 2-4 hours or overnight

Frequency: 2-3 times per week during flare-ups, as recommended by your doctor.

Important: Always consult with a healthcare provider before starting wet wrap therapy.`,
        tags: ['wet wrap', 'therapy', 'moisture'],
        readTime: '5 min'
      },
      {
        id: 'mod-3',
        title: 'Topical Treatment Management',
        category: 'Skincare',
        content: `For moderate eczema, topical treatments may be necessary. Proper application and management are crucial for effectiveness.

Application tips:
• Apply topical medications to affected areas only
• Use the "fingertip unit" method for proper dosing
• Apply before moisturizer (unless doctor says otherwise)
• Wash hands after application
• Follow doctor's instructions for frequency and duration
• Don't stop treatment abruptly - taper as directed

Common treatments:
• Topical corticosteroids (as prescribed)
• Topical calcineurin inhibitors
• Barrier repair creams
• Antihistamines for itching (if recommended)

Safety: Always follow your doctor's instructions and report any side effects.`,
        tags: ['treatment', 'medication', 'topical'],
        readTime: '5 min'
      },
      {
        id: 'mod-4',
        title: 'Trigger Identification and Avoidance',
        category: 'Prevention',
        content: `Identifying and avoiding triggers becomes more important with moderate eczema. Keep detailed records to identify patterns.

Tracking methods:
• Maintain a daily symptom and trigger diary
• Note weather conditions, activities, foods, and products used
• Track itchiness levels and affected areas
• Look for patterns over 2-4 weeks
• Share findings with your healthcare provider

Common triggers to monitor:
• Environmental: Weather changes, pollen, dust, pet dander
• Products: Soaps, detergents, cosmetics, fragrances
• Stress: Work pressure, emotional events, lack of sleep
• Foods: Keep detailed food diary (don't eliminate without medical guidance)
• Clothing: Fabrics, tight clothing, tags

Action: Once triggers are identified, develop avoidance strategies with your healthcare team.`,
        tags: ['triggers', 'tracking', 'prevention'],
        readTime: '5 min'
      },
      {
        id: 'mod-5',
        title: 'Bathing and Showering Guidelines',
        category: 'Skincare',
        content: `Proper bathing techniques are essential for moderate eczema management. The goal is to cleanse without further irritating the skin.

Optimal bathing routine:
• Bathe once daily (not more, unless very sweaty)
• Use lukewarm water (not hot or cold)
• Limit bath/shower time to 10-15 minutes
• Add colloidal oatmeal or bath oil to bathwater
• Use gentle, fragrance-free cleansers sparingly
• Avoid scrubbing or using loofahs
• Pat dry gently with soft towel
• Apply moisturizer immediately (within 3 minutes)

Bleach baths (if recommended by doctor):
• Use 1/4 to 1/2 cup of regular bleach per full bathtub
• Soak for 5-10 minutes, 2-3 times per week
• Rinse with fresh water after
• Always follow doctor's specific instructions

Important: Never start bleach baths without medical supervision.`,
        tags: ['bathing', 'cleansing', 'therapy'],
        readTime: '5 min'
      },
      {
        id: 'mod-6',
        title: 'Sleep and Itch Management',
        category: 'Lifestyle',
        content: `Moderate eczema often disrupts sleep due to itching. Managing nighttime symptoms is crucial for overall health and recovery.

Nighttime care:
• Apply thicker moisturizers before bed
• Keep bedroom cool and humidified
• Use cotton bedding and loose cotton pajamas
• Trim fingernails short to prevent scratching damage
• Consider cotton gloves if you scratch in sleep
• Take antihistamines before bed (if recommended by doctor)
• Keep a cool, damp cloth by bedside for immediate relief

Sleep hygiene:
• Maintain consistent sleep schedule
• Create relaxing bedtime routine
• Avoid screens 1 hour before bed
• Keep bedroom dark and quiet
• Consider meditation or gentle stretching before sleep

If itching severely disrupts sleep, consult your healthcare provider about additional management options.`,
        tags: ['sleep', 'itching', 'nighttime'],
        readTime: '5 min'
      }
    ],
    High: [
      {
        id: 'high-1',
        title: 'Medical Treatment Coordination',
        category: 'Skincare',
        content: `Severe eczema requires close coordination with healthcare providers. Multiple treatment approaches may be needed simultaneously.

Treatment options (prescribed by doctor):
• Topical corticosteroids (potent formulations)
• Topical calcineurin inhibitors
• Systemic medications (oral or injectable)
• Phototherapy (light therapy)
• Biologic medications
• Combination therapies

Management strategies:
• Follow treatment plan exactly as prescribed
• Keep all medical appointments
• Report side effects immediately
• Don't stop medications without doctor approval
• Use medications as directed (not more, not less)
• Keep detailed symptom and treatment logs
• Work with dermatologist and primary care provider

Critical: Severe eczema requires professional medical management. Self-treatment can be dangerous.`,
        tags: ['medical', 'treatment', 'severe'],
        readTime: '6 min'
      },
      {
        id: 'high-2',
        title: 'Infection Prevention and Recognition',
        category: 'Prevention',
        content: `Severe eczema increases infection risk. Recognizing and preventing infections is crucial for safety and recovery.

Signs of infection (seek immediate medical care):
• Increased redness, warmth, or swelling
• Yellow or green discharge/crusting
• Fever or chills
• Increased pain (beyond usual itching)
• Red streaks spreading from affected area
• Swollen lymph nodes

Prevention strategies:
• Keep affected areas clean and moisturized
• Avoid scratching (use prescribed anti-itch medications)
• Trim nails very short and keep clean
• Wash hands frequently
• Use prescribed topical antibiotics if recommended
• Cover open wounds with clean dressings
• Avoid sharing towels, clothing, or personal items

Action plan: Have an emergency contact plan with your healthcare provider for suspected infections.`,
        tags: ['infection', 'safety', 'prevention'],
        readTime: '6 min'
      },
      {
        id: 'high-3',
        title: 'Intensive Moisture Barrier Repair',
        category: 'Skincare',
        content: `Severe eczema requires aggressive barrier repair. The skin barrier is significantly compromised and needs intensive support.

Barrier repair protocol:
• Apply thick, occlusive moisturizers 4-6 times daily
• Use prescription barrier repair creams as directed
• Apply immediately after every hand washing
• Use petroleum jelly or similar occlusives at night
• Consider wet wrap therapy (under medical supervision)
• Avoid all potential irritants (fragrances, harsh soaps)
• Use only doctor-approved products

Product selection:
• Prescription barrier repair creams (ceramide-based)
• Thick, fragrance-free creams (not lotions)
• Occlusive ointments for very dry areas
• Gentle, soap-free cleansers only

Timing: Apply moisturizer within 3 minutes of any water contact (bathing, hand washing, etc.).`,
        tags: ['barrier repair', 'moisturizing', 'intensive'],
        readTime: '5 min'
      },
      {
        id: 'high-4',
        title: 'Systemic Treatment Management',
        category: 'Skincare',
        content: `Severe eczema may require systemic treatments (oral or injectable medications). These require careful monitoring and management.

Types of systemic treatments:
• Oral corticosteroids (short-term use)
• Immunosuppressants (cyclosporine, methotrexate, etc.)
• Biologic medications (dupilumab, etc.)
• JAK inhibitors (as approved and prescribed)

Important considerations:
• Regular blood tests and monitoring required
• Report all side effects immediately
• Don't stop medications without doctor approval
• Inform all healthcare providers of medications
• Keep detailed medication and symptom logs
• Follow up appointments are critical
• Understand potential side effects and warning signs

Safety: These medications require close medical supervision. Never adjust dosages independently.`,
        tags: ['systemic', 'medication', 'severe'],
        readTime: '6 min'
      },
      {
        id: 'high-5',
        title: 'Emergency Flare Management',
        category: 'Prevention',
        content: `Severe eczema can have sudden, severe flare-ups. Having an emergency action plan is essential.

Emergency action plan:
1. Contact healthcare provider immediately
2. Follow prescribed "rescue" medication protocol
3. Apply cool compresses (not ice directly)
4. Use prescribed anti-itch medications
5. Avoid all triggers and irritants
6. Increase moisturizing frequency
7. Consider wet wrap therapy if previously prescribed
8. Monitor for signs of infection

When to seek emergency care:
• Signs of infection (fever, spreading redness, discharge)
• Severe pain beyond usual itching
• Difficulty sleeping or functioning
• Widespread flare affecting large body areas
• Symptoms not responding to prescribed treatments

Preparation: Keep emergency contact numbers, medications, and supplies readily available.`,
        tags: ['emergency', 'flare-up', 'management'],
        readTime: '5 min'
      },
      {
        id: 'high-6',
        title: 'Comprehensive Lifestyle Modifications',
        category: 'Lifestyle',
        content: `Severe eczema requires comprehensive lifestyle modifications to support medical treatment and prevent triggers.

Environmental modifications:
• Remove all potential allergens and irritants from home
• Use HEPA air filters throughout living spaces
• Maintain consistent temperature and humidity
• Remove carpets and minimize dust-collecting items
• Use only fragrance-free, hypoallergenic products
• Wash all clothing and bedding in hypoallergenic detergents
• Consider professional cleaning for allergen reduction

Daily routine adjustments:
• Minimize stress through counseling, meditation, or therapy
• Maintain strict sleep schedule (7-9 hours)
• Avoid known triggers completely
• Plan activities around treatment schedule
• Keep treatment supplies accessible at all times
• Modify work/school environment if needed
• Consider support groups for emotional support

Diet and nutrition:
• Work with dietitian if food triggers suspected
• Maintain balanced nutrition despite restrictions
• Stay well-hydrated
• Consider anti-inflammatory diet (under medical guidance)

Remember: These modifications work best when combined with proper medical treatment.`,
        tags: ['lifestyle', 'modifications', 'comprehensive'],
        readTime: '6 min'
      }
    ]
  };

  // Get tips based on selected severity
  const tips: Tip[] = tipsBySeverity[selectedSeverity];

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Skincare':
        return Heart;
      case 'Weather':
        return Sun;
      case 'Lifestyle':
        return Lightbulb;
      case 'Prevention':
        return Home;
      default:
        return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Skincare':
        return 'bg-pink-500 bg-opacity-20 text-pink-300';
      case 'Weather':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
      case 'Lifestyle':
        return 'bg-green-500 bg-opacity-20 text-green-300';
      case 'Diet':
        return 'bg-orange-500 bg-opacity-20 text-orange-300';
      case 'Prevention':
        return 'bg-blue-500 bg-opacity-20 text-blue-300';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Skincare Tips & Advice</h1>
        <p className="text-gray-300 text-lg">
          Expert-backed tips to help you manage eczema effectively
        </p>
      </div>

      {/* Severity Level Selector */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Select Your Eczema Severity Level</h2>
          <p className="text-gray-300 text-sm">Choose the level that best matches your current condition to see relevant advice</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setSelectedSeverity('Low')}
            className={`flex-1 min-w-[120px] px-6 py-4 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'Low'
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            Low
            <p className="text-xs mt-1 opacity-90">Mild symptoms</p>
          </button>
          <button
            onClick={() => setSelectedSeverity('Moderate')}
            className={`flex-1 min-w-[120px] px-6 py-4 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'Moderate'
                ? 'bg-yellow-500 text-white shadow-lg scale-105'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            Moderate
            <p className="text-xs mt-1 opacity-90">Moderate symptoms</p>
          </button>
          <button
            onClick={() => setSelectedSeverity('High')}
            className={`flex-1 min-w-[120px] px-6 py-4 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'High'
                ? 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            High
            <p className="text-xs mt-1 opacity-90">Severe symptoms</p>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tips, keywords, or tags..."
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] appearance-none"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-yellow-300 font-semibold mb-1">Medical Disclaimer</h3>
            <p className="text-yellow-200 text-sm">
              These tips are for informational purposes only and should not replace professional medical advice. 
              Always consult with a qualified healthcare provider before making changes to your treatment plan.
            </p>
          </div>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTips.map(tip => {
          const IconComponent = getCategoryIcon(tip.category);
          const isExpanded = expandedTip === tip.id;
          
          return (
            <div
              key={tip.id}
              className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{tip.title}</h3>
                    <p className="text-gray-400 text-sm">{tip.readTime} read</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                  {tip.category}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 leading-relaxed">
                  {isExpanded ? tip.content : `${tip.content.substring(0, 200)}...`}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {tip.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="bg-[#6A9FB5] bg-opacity-20 text-[#6A9FB5] px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <button
                  onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                  className="text-[#6A9FB5] hover:text-[#C5B4E3] transition-colors font-medium"
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTips.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tips found</h3>
          <p className="text-gray-300">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default Tips;