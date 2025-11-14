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
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const categories = ['All', 'Skincare', 'Lifestyle', 'Weather', 'Diet', 'Prevention'];

  const tips: Tip[] = [
    {
      id: '1',
      title: 'Daily Moisturizing Routine',
      category: 'Skincare',
      content: `Proper moisturizing is crucial for managing eczema. Apply a fragrance-free, hypoallergenic moisturizer immediately after bathing while your skin is still damp. This helps lock in moisture and create a protective barrier.

Key points:
• Use thick, creamy moisturizers rather than lotions
• Look for ingredients like ceramides, hyaluronic acid, and glycerin
• Avoid products with fragrances, dyes, or alcohol
• Apply moisturizer at least twice daily, more if needed
• Consider using different products for face and body

Remember: The best moisturizer is one that works for your skin and that you'll use consistently.`,
      tags: ['moisturizer', 'daily routine', 'barrier repair'],
      readTime: '3 min'
    },
    {
      id: '2',
      title: 'Weather-Proofing Your Skin',
      category: 'Weather',
      content: `Weather changes can significantly impact eczema. Both extreme cold and heat can trigger flare-ups, so it's important to adapt your skincare routine seasonally.

Winter care:
• Use a humidifier to add moisture to dry indoor air
• Switch to heavier, more occlusive moisturizers
• Protect exposed skin when going outside
• Take shorter, lukewarm showers

Summer care:
• Stay hydrated and avoid excessive heat
• Use lightweight, non-comedogenic moisturizers
• Seek shade during peak sun hours
• Rinse off chlorine and salt water immediately after swimming`,
      tags: ['weather', 'seasonal care', 'humidity'],
      readTime: '4 min'
    },
    {
      id: '3',
      title: 'Stress Management for Skin Health',
      category: 'Lifestyle',
      content: `Stress is a common eczema trigger. Learning to manage stress effectively can help reduce flare-ups and improve overall skin health.

Effective stress management techniques:
• Practice deep breathing exercises daily
• Try meditation or mindfulness apps
• Maintain a regular sleep schedule (7-9 hours)
• Exercise regularly, but shower immediately after
• Consider yoga or tai chi for gentle movement
• Keep a stress diary to identify triggers

Professional help: Don't hesitate to speak with a counselor or therapist if stress feels overwhelming.`,
      tags: ['stress', 'mental health', 'lifestyle'],
      readTime: '5 min'
    },
    {
      id: '4',
      title: 'Creating an Eczema-Friendly Home',
      category: 'Prevention',
      content: `Your home environment plays a crucial role in managing eczema. Small changes can make a big difference in reducing triggers.

Home modifications:
• Use fragrance-free, hypoallergenic laundry detergents
• Wash bedding in hot water (130°F) weekly
• Choose cotton or bamboo fabrics over synthetic materials
• Remove or minimize carpets and rugs
• Keep humidity levels between 30-50%
• Use HEPA air filters
• Vacuum regularly with a HEPA filter vacuum

Pet considerations: If you have pets, bathe them regularly and keep them out of bedrooms.`,
      tags: ['home environment', 'allergens', 'prevention'],
      readTime: '4 min'
    },
    {
      id: '5',
      title: 'Gentle Cleansing Practices',
      category: 'Skincare',
      content: `Proper cleansing is essential but can be tricky with eczema-prone skin. The goal is to remove dirt and bacteria without stripping natural oils.

Best practices:
• Use lukewarm (not hot) water
• Limit showers/baths to 5-10 minutes
• Choose gentle, fragrance-free cleansers
• Pat skin dry instead of rubbing
• Apply moisturizer within 3 minutes of bathing
• Consider soap-free cleansers or cleansing oils

Avoid: Harsh scrubs, loofahs, antibacterial soaps, and products with fragrances or essential oils.`,
      tags: ['cleansing', 'bathing', 'gentle care'],
      readTime: '3 min'
    },
    {
      id: '6',
      title: 'Dietary Considerations',
      category: 'Diet',
      content: `While food allergies don't cause eczema, certain foods may trigger flare-ups in some people. Working with a healthcare provider is important for identifying personal triggers.

Common trigger foods:
• Dairy products
• Eggs
• Nuts and seeds
• Soy products
• Wheat/gluten
• Certain fruits (citrus, tomatoes)

Anti-inflammatory foods to include:
• Fatty fish (salmon, mackerel)
• Leafy greens
• Berries
• Probiotics (yogurt, kefir)
• Foods rich in omega-3 fatty acids

Important: Never eliminate major food groups without consulting a healthcare provider or registered dietitian.`,
      tags: ['diet', 'nutrition', 'triggers'],
      readTime: '4 min'
    }
  ];

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