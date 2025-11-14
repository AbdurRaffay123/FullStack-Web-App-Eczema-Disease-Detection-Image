import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Plus, Calendar, MapPin, Thermometer, Droplets } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

export default function LogsScreen() {
  const [showLogForm, setShowLogForm] = useState(false);
  const [itchiness, setItchiness] = useState(3);
  const [selectedArea, setSelectedArea] = useState('');
  const [notes, setNotes] = useState('');

  const areas = ['Face', 'Arms', 'Legs', 'Chest', 'Back', 'Hands'];
  const triggers = ['Stress', 'Weather', 'Food', 'Soap', 'Fabric', 'Other'];
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const logs = [
    {
      id: 1,
      date: '2025-01-15',
      itchiness: 4,
      area: 'Arms',
      triggers: ['Weather', 'Stress'],
      notes: 'Flare-up after cold weather exposure',
    },
    {
      id: 2,
      date: '2025-01-14',
      itchiness: 2,
      area: 'Face',
      triggers: ['Soap'],
      notes: 'Mild irritation after using new cleanser',
    },
    {
      id: 3,
      date: '2025-01-13',
      itchiness: 5,
      area: 'Legs',
      triggers: ['Fabric', 'Stress'],
      notes: 'Severe reaction to wool clothing',
    },
  ];

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const saveLog = () => {
    if (!selectedArea) {
      Alert.alert('Error', 'Please select an affected area');
      return;
    }

    // Here you would save to your backend
    Alert.alert('Success', 'Log saved successfully!');
    setShowLogForm(false);
    setItchiness(3);
    setSelectedArea('');
    setNotes('');
    setSelectedTriggers([]);
  };

  const getItchinessLabel = (value: number) => {
    const labels = ['None', 'Mild', 'Moderate', 'Severe', 'Extreme'];
    return labels[value - 1] || 'Moderate';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Symptom Logs</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowLogForm(!showLogForm)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {showLogForm && (
            <View style={styles.logForm}>
              <Text style={styles.formTitle}>New Symptom Log</Text>
              
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Itchiness Level</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{getItchinessLabel(itchiness)}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={5}
                    step={1}
                    value={itchiness}
                    onValueChange={setItchiness}
                    minimumTrackTintColor="#6A9FB5"
                    maximumTrackTintColor="#444444"
                    thumbStyle={{ backgroundColor: '#6A9FB5' }}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>Mild</Text>
                    <Text style={styles.sliderLabelText}>Extreme</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Affected Area</Text>
                <View style={styles.areaGrid}>
                  {areas.map((area) => (
                    <TouchableOpacity
                      key={area}
                      style={[
                        styles.areaChip,
                        selectedArea === area && styles.areaChipSelected
                      ]}
                      onPress={() => setSelectedArea(area)}
                    >
                      <Text style={[
                        styles.areaChipText,
                        selectedArea === area && styles.areaChipTextSelected
                      ]}>
                        {area}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Possible Triggers</Text>
                <View style={styles.triggerGrid}>
                  {triggers.map((trigger) => (
                    <TouchableOpacity
                      key={trigger}
                      style={[
                        styles.triggerChip,
                        selectedTriggers.includes(trigger) && styles.triggerChipSelected
                      ]}
                      onPress={() => toggleTrigger(trigger)}
                    >
                      <Text style={[
                        styles.triggerChipText,
                        selectedTriggers.includes(trigger) && styles.triggerChipTextSelected
                      ]}>
                        {trigger}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add any additional notes..."
                  placeholderTextColor="#666666"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <LinearGradient
                colors={['#6A9FB5', '#C5B4E3']}
                style={styles.saveButton}
              >
                <TouchableOpacity onPress={saveLog} style={styles.saveButtonTouchable}>
                  <Text style={styles.saveButtonText}>Save Log</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          <View style={styles.logsContainer}>
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            {logs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logDate}>
                    <Calendar size={16} color="#6A9FB5" />
                    <Text style={styles.logDateText}>{log.date}</Text>
                  </View>
                  <View style={styles.itchinessIndicator}>
                    <Text style={styles.itchinessText}>{getItchinessLabel(log.itchiness)}</Text>
                    <View style={[styles.itchinessDot, { backgroundColor: getItchinessColor(log.itchiness) }]} />
                  </View>
                </View>
                
                <View style={styles.logContent}>
                  <View style={styles.logDetail}>
                    <MapPin size={14} color="#B0B0B0" />
                    <Text style={styles.logDetailText}>{log.area}</Text>
                  </View>
                  
                  <View style={styles.triggersContainer}>
                    {log.triggers.map((trigger) => (
                      <View key={trigger} style={styles.triggerTag}>
                        <Text style={styles.triggerTagText}>{trigger}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {log.notes && (
                    <Text style={styles.logNotes}>{log.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function getItchinessColor(level: number) {
  const colors = ['#28A745', '#FFA500', '#FF6B35', '#DC3545', '#8B0000'];
  return colors[level - 1] || '#FFA500';
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6A9FB5',
    justifyContent: 'center',
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
  scrollView: {
    flex: 1,
  },
  logForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    color: '#6A9FB5',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  sliderLabelText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  areaChipSelected: {
    backgroundColor: '#6A9FB5',
    borderColor: '#6A9FB5',
  },
  areaChipText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  areaChipTextSelected: {
    color: '#FFFFFF',
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  triggerChipSelected: {
    backgroundColor: '#C5B4E3',
    borderColor: '#C5B4E3',
  },
  triggerChipText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  triggerChipTextSelected: {
    color: '#FFFFFF',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    minHeight: 80,
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonTouchable: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  logsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  logCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDateText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginLeft: 6,
  },
  itchinessIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itchinessText: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  itchinessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logContent: {
    gap: 8,
  },
  logDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDetailText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  triggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  triggerTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 159, 181, 0.2)',
  },
  triggerTagText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
  },
  logNotes: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
});