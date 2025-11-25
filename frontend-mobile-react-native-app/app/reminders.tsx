import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Bell, Clock, Trash2, CreditCard as Edit3, Pill, Droplets, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { reminderService, Reminder } from '@/services/reminderService';
import {
  scheduleRecurringReminderNotifications,
  cancelReminderNotifications,
  requestNotificationPermissions,
} from '@/utils/notificationScheduler';

export default function RemindersScreen() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderType, setReminderType] = useState<'medication' | 'appointment' | 'custom'>('medication');
  const [reminderDays, setReminderDays] = useState<string[]>(['daily']);
  const [reminderNote, setReminderNote] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const reminderTypes = [
    { id: 'medication', name: 'Medication', icon: Pill, color: '#DC3545' },
    { id: 'appointment', name: 'Appointment', icon: Bell, color: '#6A9FB5' },
    { id: 'custom', name: 'Custom', icon: Sun, color: '#FFA500' },
  ];

  // Load reminders on mount
  useEffect(() => {
    loadReminders();
    requestNotificationPermissions();
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const result = await reminderService.getReminders();
      setReminders(result.reminders);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = [
    { id: 'mon', name: 'Mon' },
    { id: 'tue', name: 'Tue' },
    { id: 'wed', name: 'Wed' },
    { id: 'thu', name: 'Thu' },
    { id: 'fri', name: 'Fri' },
    { id: 'sat', name: 'Sat' },
    { id: 'sun', name: 'Sun' },
    { id: 'daily', name: 'Daily' },
  ];

  const toggleReminder = async (reminder: Reminder) => {
    try {
      const updatedReminder = await reminderService.updateReminder(reminder.id, {
        isActive: !reminder.isActive,
      });

      // Cancel or schedule local notifications
      if (!updatedReminder.reminder.isActive) {
        await cancelReminderNotifications(reminder.id);
      } else {
        await scheduleRecurringReminderNotifications(updatedReminder.reminder);
      }

      await loadReminders();
      Alert.alert('Success', `Reminder ${updatedReminder.reminder.isActive ? 'enabled' : 'disabled'}!`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update reminder');
    }
  };

  const deleteReminder = (reminder: Reminder) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel local notifications first
              await cancelReminderNotifications(reminder.id);
              // Delete from backend
              await reminderService.deleteReminder(reminder.id);
              await loadReminders();
              Alert.alert('Success', 'Reminder deleted successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (reminder: Reminder) => {
    setReminderTitle(reminder.title);
    setReminderTime(reminder.time.includes('T') ? reminder.time.split('T')[1].substring(0, 5) : reminder.time.substring(0, 5));
    setReminderType(reminder.type);
    setReminderDays(reminder.days);
    setReminderNote(reminder.customMessage || '');
    setEditingReminder(reminder);
    setShowAddForm(true);
  };

  const addReminder = async () => {
    if (!reminderTitle.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    if (reminderDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    setIsSubmitting(true);
    try {
      const reminderData = {
        title: reminderTitle.trim(),
        type: reminderType,
        time: reminderTime,
        days: reminderDays,
        customMessage: reminderNote.trim() || undefined,
      };

      let result;
      if (editingReminder) {
        result = await reminderService.updateReminder(editingReminder.id, reminderData);
        // Cancel old notifications and schedule new ones
        await cancelReminderNotifications(editingReminder.id);
        if (result.reminder.isActive) {
          await scheduleRecurringReminderNotifications(result.reminder);
        }
        Alert.alert('Success', 'Reminder updated successfully!');
      } else {
        result = await reminderService.createReminder(reminderData);
        // Schedule local notifications
        if (result.reminder.isActive) {
          await scheduleRecurringReminderNotifications(result.reminder);
        }
        Alert.alert('Success', 'Reminder created successfully!');
      }

      resetForm();
      await loadReminders();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    if (day === 'daily') {
      setReminderDays(['daily']);
    } else {
      const newDays = reminderDays.includes('daily')
        ? [day]
        : reminderDays.includes(day)
          ? reminderDays.filter(d => d !== day)
          : [...reminderDays.filter(d => d !== 'daily'), day];
      setReminderDays(newDays.length === 0 ? ['daily'] : newDays);
    }
  };

  const resetForm = () => {
    setReminderTitle('');
    setReminderTime('09:00');
    setReminderType('medication');
    setReminderDays(['daily']);
    setReminderNote('');
    setEditingReminder(null);
    setShowAddForm(false);
  };

  const formatDays = (days: string[]) => {
    if (days.includes('daily')) return 'Daily';
    if (days.length === 7) return 'Daily';
    const dayMap: { [key: string]: string } = {
      mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
      fri: 'Fri', sat: 'Sat', sun: 'Sun'
    };
    if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) return 'Weekdays';
    if (days.length === 2 && days.includes('sat') && days.includes('sun')) return 'Weekends';
    return days.map(d => dayMap[d.toLowerCase()] || d).join(', ');
  };

  const formatTime = (time: string) => {
    if (time.includes('T')) {
      return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return time.substring(0, 5);
  };

  const getTypeColor = (type: string) => {
    return reminderTypes.find(t => t.id === type)?.color || '#6A9FB5';
  };

  const getTypeIcon = (type: string) => {
    return reminderTypes.find(t => t.id === type)?.icon || Bell;
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
          <Text style={styles.title}>Reminders</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              if (editingReminder) {
                resetForm();
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>
                {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
              </Text>
              
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter reminder title..."
                  placeholderTextColor="#666666"
                  value={reminderTitle}
                  onChangeText={setReminderTitle}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Type</Text>
                <View style={styles.typeGrid}>
                  {reminderTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeChip,
                        reminderType === type.id && { backgroundColor: type.color }
                      ]}
                      onPress={() => setReminderType(type.id)}
                    >
                      <type.icon 
                        size={16} 
                        color={reminderType === type.id ? '#FFFFFF' : type.color} 
                      />
                      <Text style={[
                        styles.typeText,
                        reminderType === type.id && { color: '#FFFFFF' }
                      ]}>
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Time</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM"
                  placeholderTextColor="#666666"
                  value={reminderTime}
                  onChangeText={setReminderTime}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Days</Text>
                <View style={styles.daysGrid}>
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.dayChip,
                        reminderDays.includes(day.id) && styles.dayChipSelected
                      ]}
                      onPress={() => toggleDay(day.id)}
                    >
                      <Text style={[
                        styles.dayText,
                        reminderDays.includes(day.id) && styles.dayTextSelected
                      ]}>
                        {day.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Note (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Add a note..."
                  placeholderTextColor="#666666"
                  value={reminderNote}
                  onChangeText={setReminderNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={resetForm}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                  onPress={addReminder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingReminder ? 'Update Reminder' : 'Add Reminder'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.remindersContainer}>
            <Text style={styles.sectionTitle}>Your Reminders</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6A9FB5" />
                <Text style={styles.loadingText}>Loading reminders...</Text>
              </View>
            ) : reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={48} color="#6A9FB5" />
                <Text style={styles.emptyTitle}>No reminders yet</Text>
                <Text style={styles.emptyText}>
                  Add your first reminder to stay on top of your skincare routine
                </Text>
              </View>
            ) : (
              reminders.map((reminder) => {
                const IconComponent = getTypeIcon(reminder.type);
                return (
                  <View key={reminder.id} style={[styles.reminderCard, !reminder.isActive && styles.reminderCardInactive]}>
                    <View style={styles.reminderHeader}>
                      <View style={styles.reminderLeft}>
                        <View style={[styles.reminderIcon, { backgroundColor: getTypeColor(reminder.type) }]}>
                          <IconComponent size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.reminderInfo}>
                          <Text style={styles.reminderTitle}>{reminder.title}</Text>
                          <View style={styles.reminderDetails}>
                            <Clock size={14} color="#B0B0B0" />
                            <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
                            <Text style={styles.reminderDays}>• {formatDays(reminder.days)}</Text>
                          </View>
                          {reminder.customMessage && (
                            <Text style={styles.reminderNote}>{reminder.customMessage}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.reminderActions}>
                        <Switch
                          value={reminder.isActive}
                          onValueChange={() => toggleReminder(reminder)}
                          trackColor={{ false: '#444444', true: '#6A9FB5' }}
                          thumbColor={reminder.isActive ? '#FFFFFF' : '#CCCCCC'}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.reminderFooter}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEdit(reminder)}
                      >
                        <Edit3 size={16} color="#6A9FB5" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => deleteReminder(reminder)}
                      >
                        <Trash2 size={16} color="#DC3545" />
                        <Text style={[styles.actionButtonText, { color: '#DC3545' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 Pro Tip</Text>
            <Text style={styles.tipText}>
              Consistent skincare routines are key to managing eczema. Set reminders for moisturizing, 
              medication, and other important care activities to build healthy habits.
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A9FB5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  addForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    minHeight: 80,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayChipSelected: {
    backgroundColor: '#6A9FB5',
    borderColor: '#6A9FB5',
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6A9FB5',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    marginTop: 16,
  },
  reminderCardInactive: {
    opacity: 0.6,
  },
  remindersContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reminderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginLeft: 4,
  },
  reminderDays: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    marginLeft: 4,
  },
  reminderNote: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888888',
    fontStyle: 'italic',
  },
  reminderActions: {
    marginLeft: 12,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#6A9FB5',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipContainer: {
    backgroundColor: 'rgba(106, 159, 181, 0.1)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 159, 181, 0.2)',
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#6A9FB5',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});