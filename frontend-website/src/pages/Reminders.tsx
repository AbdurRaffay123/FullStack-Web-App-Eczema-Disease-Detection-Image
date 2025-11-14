import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Plus, Bell, Clock, Calendar, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  type: string;
  time: string;
  days: string[];
  message: string;
  isActive: boolean;
}

const Reminders: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'medication',
    time: '',
    days: [] as string[],
    message: ''
  });
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Morning Moisturizer',
      type: 'skincare',
      time: '08:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      message: 'Apply your morning moisturizer to maintain skin barrier',
      isActive: true
    },
    {
      id: '2',
      title: 'Evening Medication',
      type: 'medication',
      time: '20:00',
      days: ['Monday', 'Wednesday', 'Friday'],
      message: 'Take your prescribed eczema medication',
      isActive: true
    },
    {
      id: '3',
      title: 'Hydration Check',
      type: 'lifestyle',
      time: '14:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      message: 'Remember to drink water and check your skin moisture levels',
      isActive: false
    }
  ]);
  const { showToast } = useToast();

  const reminderTypes = [
    { value: 'medication', label: 'Medication', color: 'bg-red-500' },
    { value: 'skincare', label: 'Skincare', color: 'bg-pink-500' },
    { value: 'lifestyle', label: 'Lifestyle', color: 'bg-green-500' },
    { value: 'appointment', label: 'Appointment', color: 'bg-blue-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.time || formData.days.length === 0) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const newReminder: Reminder = {
      id: editingReminder?.id || Date.now().toString(),
      ...formData,
      isActive: true
    };

    if (editingReminder) {
      setReminders(prev => prev.map(r => r.id === editingReminder.id ? newReminder : r));
      showToast('Reminder updated successfully!', 'success');
    } else {
      setReminders(prev => [...prev, newReminder]);
      showToast('Reminder created successfully!', 'success');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'medication',
      time: '',
      days: [],
      message: ''
    });
    setShowForm(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder: Reminder) => {
    setFormData({
      title: reminder.title,
      type: reminder.type,
      time: reminder.time,
      days: reminder.days,
      message: reminder.message
    });
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    showToast('Reminder deleted successfully!', 'success');
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
    const reminder = reminders.find(r => r.id === id);
    showToast(`Reminder ${reminder?.isActive ? 'disabled' : 'enabled'}!`, 'info');
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
    if (days.length === 7) return 'Daily';
    if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) return 'Weekdays';
    if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) return 'Weekends';
    return days.map(d => d.substring(0, 3)).join(', ');
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
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
          </h2>
          
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
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
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                placeholder="Optional custom message for this reminder"
                className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] resize-none"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <Bell className="h-5 w-5" />
                <span>{editingReminder ? 'Update Reminder' : 'Create Reminder'}</span>
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
        {reminders.length === 0 ? (
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
                <div className="flex items-center space-x-4">
                  <div className={`${getReminderTypeColor(reminder.type)} bg-opacity-20 p-3 rounded-lg`}>
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white">{reminder.title}</h3>
                    <div className="flex items-center space-x-4 text-gray-300 text-sm mt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{reminder.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDays(reminder.days)}</span>
                      </div>
                    </div>
                    {reminder.message && (
                      <p className="text-gray-300 text-sm mt-2">{reminder.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    {reminder.isActive ? (
                      <ToggleRight className="h-6 w-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    <Edit className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reminders;