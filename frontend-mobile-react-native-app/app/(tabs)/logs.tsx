import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Edit, Trash2, X, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { symptomService, SymptomLog as SymptomLogType } from '../../services/symptomService';
import AppHeader from '@/components/AppHeader';
import { useDrawer } from '@/context/DrawerContext';
import { useModalHelpers } from '@/context/ModalContext';

export default function LogsScreen() {
  const { openDrawer } = useDrawer();
  const { showSuccess, showError } = useModalHelpers();
  const [showLogForm, setShowLogForm] = useState(false);
  const [logs, setLogs] = useState<SymptomLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    itchinessLevel: 5,
    affectedArea: '',
    possibleTriggers: '',
    additionalNotes: ''
  });

  const areas = ['Face', 'Neck', 'Arms', 'Forearm', 'Hands', 'Chest', 'Back', 'Legs', 'Feet', 'Other'];
  const triggers = ['Stress', 'Dry weather', 'Humid weather', 'New soap', 'New detergent', 'Certain foods', 'Pet dander', 'Dust', 'Pollen', 'Fabric softener'];

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const result = await symptomService.getLogs();
      setLogs(result.logs);
    } catch (error: any) {
      showError(error.message || 'Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLog = async () => {
    if (!formData.affectedArea) {
      showError('Please select an affected area');
      return;
    }

    if (formData.itchinessLevel < 1 || formData.itchinessLevel > 10) {
      showError('Itchiness level must be between 1 and 10');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await symptomService.updateLog(editingId, formData);
        showSuccess('Log updated successfully!');
        setEditingId(null);
      } else {
        await symptomService.createLog(formData);
        showSuccess('Log saved successfully!');
      }
      
      resetForm();
      loadLogs();
    } catch (error: any) {
      showError(error.message || 'Failed to save log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (log: SymptomLogType) => {
    setFormData({
      itchinessLevel: log.itchinessLevel,
      affectedArea: log.affectedArea,
      possibleTriggers: log.possibleTriggers || '',
      additionalNotes: log.additionalNotes || ''
    });
    setEditingId(log.id);
    setShowLogForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await symptomService.deleteLog(deleteId);
      loadLogs();
      setDeleteId(null);
    } catch (error: any) {
      // Error will be shown via toast or error handling
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setIsDeleting(false);
  };

  const resetForm = () => {
    setFormData({
      itchinessLevel: 5,
      affectedArea: '',
      possibleTriggers: '',
      additionalNotes: ''
    });
    setEditingId(null);
    setShowLogForm(false);
  };

  const addTrigger = (trigger: string) => {
    const currentTriggers = formData.possibleTriggers ? formData.possibleTriggers.split(',').map(t => t.trim()).filter(t => t) : [];
    if (!currentTriggers.includes(trigger)) {
      setFormData(prev => ({
        ...prev,
        possibleTriggers: currentTriggers.length > 0 ? `${prev.possibleTriggers}, ${trigger}` : trigger
      }));
    }
  };

  const getItchinessLabel = (value: number) => {
    if (value <= 2) return 'Very Mild';
    if (value <= 4) return 'Mild';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Severe';
    return 'Very Severe';
  };

  const getItchinessColor = (level: number) => {
    if (level <= 3) return '#28A745';
    if (level <= 6) return '#FFA500';
    return '#DC3545';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderLogItem = ({ item }: { item: SymptomLogType }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logDate}>
          <Calendar size={16} color="#6A9FB5" />
          <Text style={styles.logDateText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.logActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.actionButton}
          >
            <Edit size={16} color="#6A9FB5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteClick(item.id)}
            style={styles.actionButton}
          >
            <Trash2 size={16} color="#DC3545" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.logContent}>
        <View style={styles.logDetailRow}>
          <View style={styles.itchinessIndicator}>
            <Text style={styles.itchinessText}>Level {item.itchinessLevel}/10</Text>
            <View style={[styles.itchinessDot, { backgroundColor: getItchinessColor(item.itchinessLevel) }]} />
          </View>
          <View style={styles.logDetail}>
            <MapPin size={14} color="#B0B0B0" />
            <Text style={styles.logDetailText}>{item.affectedArea}</Text>
          </View>
        </View>
        
        {item.possibleTriggers && item.possibleTriggers.trim() && (
          <View style={styles.triggersContainer}>
            <Text style={styles.triggerLabel}>Triggers:</Text>
            <Text style={styles.triggerText}>{item.possibleTriggers}</Text>
          </View>
        )}
        
        {item.additionalNotes && item.additionalNotes.trim() && (
          <Text style={styles.logNotes}>{item.additionalNotes}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <AppHeader title="Symptom Logs" onMenuPress={openDrawer} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                if (showLogForm) {
                  resetForm();
                } else {
                  setShowLogForm(true);
                }
              }}
            >
              {showLogForm ? <X size={24} color="#FFFFFF" /> : <Plus size={24} color="#FFFFFF" />}
              <Text style={styles.addButtonText}>{showLogForm ? 'Cancel' : 'Add New Log'}</Text>
            </TouchableOpacity>
          </View>
          {showLogForm && (
            <View style={styles.logForm}>
              <Text style={styles.formTitle}>
                {editingId ? 'Edit Symptom Log' : 'New Symptom Log'}
              </Text>
              
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  Itchiness Level: {formData.itchinessLevel}/10 ({getItchinessLabel(formData.itchinessLevel)})
                </Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={formData.itchinessLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, itchinessLevel: value }))}
                    minimumTrackTintColor="#6A9FB5"
                    maximumTrackTintColor="#444444"
                    thumbStyle={{ backgroundColor: '#6A9FB5' }}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>1 - Very Mild</Text>
                    <Text style={styles.sliderLabelText}>10 - Unbearable</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Affected Area <Text style={styles.required}>*</Text></Text>
                <View style={styles.areaGrid}>
                  {areas.map((area) => (
                    <TouchableOpacity
                      key={area}
                      style={[
                        styles.areaChip,
                        formData.affectedArea === area && styles.areaChipSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, affectedArea: area }))}
                    >
                      <Text style={[
                        styles.areaChipText,
                        formData.affectedArea === area && styles.areaChipTextSelected
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
                      style={styles.triggerChip}
                      onPress={() => addTrigger(trigger)}
                    >
                      <Text style={styles.triggerChipText}>{trigger}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.triggerInput}
                  placeholder="Enter triggers (comma-separated)"
                  placeholderTextColor="#666666"
                  value={formData.possibleTriggers}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, possibleTriggers: text }))}
                  multiline
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Additional Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add any additional notes..."
                  placeholderTextColor="#666666"
                  value={formData.additionalNotes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, additionalNotes: text }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formButtons}>
                {editingId && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetForm}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <LinearGradient
                  colors={['#6A9FB5', '#C5B4E3']}
                  style={[styles.saveButton, editingId && styles.saveButtonFlex]}
                >
                  <TouchableOpacity
                    onPress={saveLog}
                    style={styles.saveButtonTouchable}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Saving...</Text>
                      </View>
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {editingId ? 'Update Log' : 'Save Log'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          )}

          <View style={styles.logsContainer}>
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6A9FB5" />
                <Text style={styles.loadingText}>Loading logs...</Text>
              </View>
            ) : logs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No symptom logs yet. Start tracking your symptoms!</Text>
              </View>
            ) : (
              <FlatList
                data={logs}
                renderItem={renderLogItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AlertCircle size={24} color="#DC3545" />
              <Text style={styles.modalTitle}>Delete Symptom Log</Text>
            </View>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this symptom log? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleDeleteCancel}
                disabled={isDeleting}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteButton, isDeleting && styles.modalDeleteButtonDisabled]}
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalDeleteButtonText}>Deleting...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  addButtonContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A9FB5',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
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
  required: {
    color: '#DC3545',
  },
  sliderContainer: {
    alignItems: 'center',
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
    marginTop: 8,
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
    fontFamily: 'OpenSans-SemiBold',
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  triggerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  triggerChipText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  triggerInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    minHeight: 60,
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
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  saveButton: {
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
  saveButtonFlex: {
    flex: 1,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginTop: 12,
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
  logActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logContent: {
    gap: 8,
  },
  logDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itchinessIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itchinessText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  itchinessDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    marginTop: 8,
  },
  triggerLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#B0B0B0',
    marginBottom: 4,
  },
  triggerText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  logNotes: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalDeleteButtonDisabled: {
    opacity: 0.6,
  },
  modalDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
});
