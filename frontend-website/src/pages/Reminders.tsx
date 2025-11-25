import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { reminderService, Reminder } from '../services/reminderService';
import { Plus, Bell, Clock, Calendar, Edit, Trash2, X, AlertCircle } from 'lucide-react';

const Reminders: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'medication' as 'medication' | 'appointment' | 'custom',
    reminderMode: 'recurring' as 'recurring' | 'one-time',
    time: '',
    days: [] as string[],
    date: '',
    customMessage: '',
  });
  const { showToast } = useToast();

  const reminderTypes = [
    { value: 'medication', label: 'Medication', color: 'bg-red-500' },
    { value: 'appointment', label: 'Appointment', color: 'bg-blue-500' },
    { value: 'custom', label: 'Custom', color: 'bg-purple-500' },
  ];

  const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // Load reminders on mount
  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load reminders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.time) {
      showToast('Please fill in title and time', 'error');
      return;
    }

    if (formData.reminderMode === 'recurring' && formData.days.length === 0) {
      showToast('Please select at least one day for recurring reminders', 'error');
      return;
    }

    if (formData.reminderMode === 'one-time' && !formData.date) {
      showToast('Please select a date for one-time reminders', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReminder) {
        await reminderService.updateReminder(editingReminder.id, formData);
        showToast('Reminder updated successfully!', 'success');
      } else {
        await reminderService.createReminder(formData);
        showToast('Reminder created successfully!', 'success');
      }
      resetForm();
      loadReminders();
    } catch (error: any) {
      showToast(error.message || 'Failed to save reminder', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'medication',
      reminderMode: 'recurring',
      time: '',
      days: [],
      date: '',
      customMessage: '',
    });
    setShowForm(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder: Reminder) => {
    const reminderMode = reminder.reminderMode || 'recurring';
    setFormData({
      title: reminder.title,
      type: reminder.type,
      reminderMode: reminderMode,
      time: reminder.time.includes('T') ? reminder.time.split('T')[1].substring(0, 5) : reminder.time.substring(0, 5),
      days: reminder.days || [],
      date: reminder.date ? new Date(reminder.date).toISOString().split('T')[0] : '',
      customMessage: reminder.customMessage || '',
    });
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await reminderService.deleteReminder(deleteId);
      showToast('Reminder deleted successfully!', 'success');
      loadReminders();
      setDeleteId(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to delete reminder', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setIsDeleting(false);
  };

  const toggleReminder = async (reminder: Reminder) => {
    try {
      await reminderService.updateReminder(reminder.id, {
        isActive: !reminder.isActive,
      });
      showToast(`Reminder ${!reminder.isActive ? 'enabled' : 'disabled'}!`, 'success');
      loadReminders();
    } catch (error: any) {
      showToast(error.message || 'Failed to update reminder', 'error');
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getReminderTypeColor = (type: string) => {
    return reminderTypes.find(t => t.value === type)?.color || 'bg-gray-500';
  };

  const formatDays = (days: string[]) => {
    if (!days || days.length === 0) return '';
    if (days.includes('daily')) return 'Daily';
    if (days.length === 7) return 'Daily';
    if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) return 'Weekdays';
    if (days.length === 2 && days.includes('sat') && days.includes('sun')) return 'Weekends';
    const dayMap: { [key: string]: string } = {
      mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
      fri: 'Fri', sat: 'Sat', sun: 'Sun'
    };
    return days.map(d => dayMap[d] || d).join(', ');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (time.includes('T')) {
      return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return time.substring(0, 5);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Reminders</h1>
          <p className="text-gray-300 text-lg">
            Stay consistent with your eczema management routine
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Reminder Form */}
      {showForm && (
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Morning Moisturizer"
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                  required
                >
                  {reminderTypes.map(type => (
                    <option key={type.value} value={type.value} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reminder Type *
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reminderMode: 'recurring', date: '' }))}
                  className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${
                    formData.reminderMode === 'recurring'
                      ? 'bg-[#6A9FB5] text-white'
                      : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                  }`}
                >
                  Recurring
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reminderMode: 'one-time', days: [] }))}
                  className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${
                    formData.reminderMode === 'one-time'
                      ? 'bg-[#6A9FB5] text-white'
                      : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                  }`}
                >
                  One-Time
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {formData.reminderMode === 'recurring' 
                  ? 'Set reminder to repeat on specific days'
                  : 'Set reminder for a specific date'}
              </p>
            </div>

            {formData.reminderMode === 'one-time' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Days *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        formData.days.includes(day)
                          ? 'bg-[#6A9FB5] text-white'
                          : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, days: ['daily'] }))}
                  className="mt-2 px-4 py-2 text-sm bg-white bg-opacity-10 hover:bg-opacity-20 text-gray-300 rounded-lg transition-all"
                >
                  Select Daily
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Message
              </label>
              <textarea
                value={formData.customMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                rows={3}
                placeholder="Optional custom message for this reminder"
                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] resize-none"
                maxLength={500}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-5 w-5" />
                    <span>{editingReminder ? 'Update Reminder' : 'Create Reminder'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5] mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12 bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No reminders yet</h3>
            <p className="text-gray-300">Create your first reminder to stay on track!</p>
          </div>
        ) : (
          reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 transition-all ${
                reminder.isActive ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`${getReminderTypeColor(reminder.type)} bg-opacity-20 p-3 rounded-lg`}>
                    <Bell className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{reminder.title}</h3>
                    <div className="flex items-center space-x-4 text-gray-300 text-sm mt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(reminder.time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {reminder.reminderMode === 'one-time' && reminder.date
                            ? formatDate(reminder.date)
                            : formatDays(reminder.days || [])}
                        </span>
                        {reminder.reminderMode === 'one-time' && (
                          <span className="ml-1 text-xs text-gray-400">(One-time)</span>
                        )}
                        {reminder.reminderMode === 'recurring' && (
                          <span className="ml-1 text-xs text-gray-400">(Recurring)</span>
                        )}
                      </div>
                      {reminder.nextTriggerTime && (
                        <div className="text-xs text-gray-400">
                          Next: {new Date(reminder.nextTriggerTime).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {reminder.customMessage && (
                      <p className="text-gray-300 text-sm mt-2">{reminder.customMessage}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleReminder(reminder)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                    title={reminder.isActive ? 'Disable' : 'Enable'}
                  >
                    {reminder.isActive ? (
                      <span className="text-green-400 text-sm font-semibold">Active</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Inactive</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleEdit(reminder)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(reminder.id)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A2E] border border-white border-opacity-20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Delete Reminder</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this reminder? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
