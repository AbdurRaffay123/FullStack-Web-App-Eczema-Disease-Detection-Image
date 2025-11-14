import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Droplets, Sun, Thermometer, Heart, Shield, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function TipsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Tips', icon: Lightbulb },
    { id: 'skincare', name: 'Skincare', icon: Droplets },
    { id: 'lifestyle', name: 'Lifestyle', icon: Heart },
    { id: 'weather', name: 'Weather', icon: Sun },
    { id: 'prevention', name: 'Prevention', icon: Shield },
  ];

  const tips = [
    {
      id: 1,
      title: 'Moisturize Immediately After Bathing',
      category: 'skincare',
      icon: Droplets,
      summary: 'Apply moisturizer within 3 minutes of bathing to lock in moisture.',
      content: `The key to effective moisturizing is timing. Your skin is most receptive to moisture when it's still damp from bathing. Here's how to do it right:

• Pat your skin dry with a soft towel, leaving it slightly damp
• Apply a thick, fragrance-free moisturizer within 3 minutes
• Use gentle, upward strokes to avoid irritating the skin
• Pay special attention to areas prone to dryness like elbows and knees
• Choose moisturizers with ceramides, hyaluronic acid, or glycerin

This technique, called "wet skin moisturizing," can significantly improve your skin's hydration levels and reduce eczema flare-ups.`,
      tags: ['moisturizing', 'bathing', 'hydration'],
    },
    {
      id: 2,
      title: 'Choose Lukewarm Water for Bathing',
      category: 'skincare',
      icon: Thermometer,
      summary: 'Hot water strips natural oils from your skin, worsening eczema.',
      content: `Temperature matters when it comes to bathing with eczema. Hot water might feel relaxing, but it's one of the worst things for sensitive skin:

Why lukewarm water is better:
• Preserves your skin's natural protective barrier
• Prevents excessive drying and irritation
• Reduces inflammation and redness
• Helps maintain skin's natural pH balance

Bathing tips:
• Keep baths/showers to 10-15 minutes maximum
• Use a gentle, fragrance-free cleanser
• Add colloidal oatmeal or baking soda to bath water for extra soothing
• Avoid scrubbing with rough washcloths or loofahs`,
      tags: ['bathing', 'temperature', 'skin barrier'],
    },
    {
      id: 3,
      title: 'Identify and Avoid Your Triggers',
      category: 'prevention',
      icon: Shield,
      summary: 'Keep a diary to track what causes your eczema flare-ups.',
      content: `Understanding your personal triggers is crucial for managing eczema effectively. Common triggers include:

Environmental triggers:
• Dust mites, pet dander, pollen
• Harsh chemicals in cleaning products
• Fragrances in soaps, detergents, cosmetics
• Extreme temperatures or humidity changes

Lifestyle triggers:
• Stress and lack of sleep
• Certain foods (dairy, eggs, nuts, wheat)
• Synthetic fabrics and wool
• Excessive sweating

How to identify triggers:
• Keep a detailed symptom diary
• Note what you ate, used, or were exposed to before flare-ups
• Work with your dermatologist to identify patterns
• Consider allergy testing if food triggers are suspected`,
      tags: ['triggers', 'prevention', 'diary'],
    },
    {
      id: 4,
      title: 'Manage Stress for Better Skin',
      category: 'lifestyle',
      icon: Heart,
      summary: 'Stress can trigger eczema flare-ups. Learn healthy coping strategies.',
      content: `The connection between stress and eczema is well-documented. Stress hormones can weaken your immune system and trigger inflammation:

Stress-reduction techniques:
• Practice deep breathing exercises daily
• Try meditation or mindfulness apps
• Engage in regular physical activity
• Maintain a consistent sleep schedule
• Connect with friends and family

Professional help:
• Consider therapy if stress is overwhelming
• Learn cognitive behavioral techniques
• Join support groups for people with eczema
• Practice progressive muscle relaxation

Remember: Managing stress isn't just good for your mental health—it's essential for your skin health too.`,
      tags: ['stress', 'mental health', 'lifestyle'],
    },
    {
      id: 5,
      title: 'Protect Your Skin from Weather',
      category: 'weather',
      icon: Sun,
      summary: 'Both hot and cold weather can trigger eczema. Learn to adapt.',
      content: `Weather changes can be challenging for eczema-prone skin. Here's how to protect yourself year-round:

Hot weather protection:
• Stay in air-conditioned environments when possible
• Wear loose, breathable cotton clothing
• Use a humidifier to maintain 30-50% humidity
• Shower immediately after sweating
• Apply sunscreen designed for sensitive skin

Cold weather care:
• Use a heavier moisturizer in winter
• Wear soft, natural fiber clothing in layers
• Protect exposed skin with scarves and gloves
• Run a humidifier in your bedroom
• Avoid sudden temperature changes

Year-round tips:
• Check weather forecasts and plan accordingly
• Always carry your moisturizer and medications
• Dress in layers you can easily adjust`,
      tags: ['weather', 'seasons', 'protection'],
    },
    {
      id: 6,
      title: 'Choose the Right Fabrics',
      category: 'lifestyle',
      icon: Heart,
      summary: 'Soft, breathable fabrics can prevent skin irritation.',
      content: `What you wear directly affects your skin. The right fabric choices can make a significant difference:

Best fabrics for eczema:
• 100% cotton (soft, breathable)
• Bamboo (naturally antimicrobial)
• Silk (smooth, less friction)
• Linen (breathable, natural)

Fabrics to avoid:
• Wool (can be scratchy and irritating)
• Synthetic materials (trap heat and moisture)
• Rough textures or tight weaves
• Clothing with chemical treatments

Clothing care tips:
• Wash new clothes before wearing
• Use fragrance-free, hypoallergenic detergents
• Double rinse to remove soap residue
• Avoid fabric softeners and dryer sheets
• Choose loose-fitting clothes to reduce friction`,
      tags: ['clothing', 'fabrics', 'comfort'],
    },
  ];

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleTip = (tipId: number) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
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
          <Text style={styles.title}>Skincare Tips</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#B0B0B0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tips..."
              placeholderTextColor="#B0B0B0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipSelected
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <category.icon 
                size={16} 
                color={selectedCategory === category.id ? '#FFFFFF' : '#6A9FB5'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.tipsContainer}>
            {filteredTips.map((tip) => (
              <View key={tip.id} style={styles.tipCard}>
                <TouchableOpacity 
                  style={styles.tipHeader}
                  onPress={() => toggleTip(tip.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tipHeaderLeft}>
                    <View style={styles.tipIcon}>
                      <tip.icon size={20} color="#6A9FB5" />
                    </View>
                    <View style={styles.tipHeaderText}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipSummary}>{tip.summary}</Text>
                    </View>
                  </View>
                  {expandedTip === tip.id ? (
                    <ChevronUp size={20} color="#B0B0B0" />
                  ) : (
                    <ChevronDown size={20} color="#B0B0B0" />
                  )}
                </TouchableOpacity>

                {expandedTip === tip.id && (
                  <View style={styles.tipContent}>
                    <Text style={styles.tipText}>{tip.content}</Text>
                    <View style={styles.tagsContainer}>
                      {tip.tags.map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>

          {filteredTips.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Lightbulb size={48} color="#6A9FB5" />
              <Text style={styles.noResultsTitle}>No tips found</Text>
              <Text style={styles.noResultsText}>
                Try adjusting your search or category filter
              </Text>
            </View>
          )}

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>Important Note</Text>
            <Text style={styles.disclaimerText}>
              These tips are for informational purposes only and should not replace professional medical advice. 
              Always consult with your dermatologist or healthcare provider before making significant changes to your skincare routine.
            </Text>
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
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(106, 159, 181, 0.3)',
    gap: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#6A9FB5',
    borderColor: '#6A9FB5',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  tipsContainer: {
    padding: 16,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  tipHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tipSummary: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    lineHeight: 20,
  },
  tipContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 48,
  },
  noResultsTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
  },
  disclaimerContainer: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.2)',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFA500',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});