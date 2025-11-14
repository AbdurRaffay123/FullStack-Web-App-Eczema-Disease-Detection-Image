import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Save, Calendar, MapPin, AlertCircle, Plus, X } from 'lucide-react';

interface SymptomEntry {
  id: string;
  date: string;
  itchiness: number;
  area: string;
  triggers: string[];
  notes: string;
}

const SymptomLog: React.FC = () => {
  const [formData, setFormData] = useState({
    itchiness: 5,
    area: '',
    triggers: [] as string[],
    notes: ''
  });
  const [newTrigger, setNewTrigger] = useState('');
  const [logs, setLogs] = useState<SymptomEntry[]>([
    {
      id: '1',
      date: '2024-01-15',
      itchiness: 3,
      area: 'Forearm',
      triggers: ['Stress', 'Dry weather'],
      notes: 'Mild irritation after work meeting'
    },
    {
      id: '2',
      date: '2024-01-14',
      itchiness: 6,
      area: 'Hands',
      triggers: ['New soap'],
      notes: 'Tried a new hand soap, immediate reaction'
    }
  ]);
  const { showToast } = useToast();

  const affectedAreas = [
    'Face', 'Neck', 'Arms', 'Forearm', 'Hands', 'Chest', 'Back', 'Legs', 'Feet', 'Other'
  ];

  const commonTriggers = [
    'Stress', 'Dry weather', 'Humid weather', 'New soap', 'New detergent', 
    'Certain foods', 'Pet dander', 'Dust', 'Pollen', 'Fabric softener'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.area) {
      showToast('Please select an affected area', 'error');
      return;
    }

    const newEntry: SymptomEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...formData
    };

    setLogs(prev => [newEntry, ...prev]);
    setFormData({
      itchiness: 5,
      area: '',
      triggers: [],
      notes: ''
    });
    
    showToast('Symptom log saved successfully!', 'success');
  };

  const addTrigger = (trigger: string) => {
    if (trigger && !formData.triggers.includes(trigger)) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, trigger]
      }));
    }
    setNewTrigger('');
  };

  const removeTrigger = (trigger: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const getItchinessColor = (level: number) => {
    if (level <= 3) return 'text-green-400';
    if (level <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getItchinessLabel = (level: number) => {
    if (level <= 2) return 'Very Mild';
    if (level <= 4) return 'Mild';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'Severe';
    return 'Very Severe';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Symptom Logging</h1>
        <p className="text-gray-300 text-lg">
          Track your daily symptoms to identify patterns and triggers
        </p>
      </div>

      {/* Logging Form */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Log Today's Symptoms</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Itchiness Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Itchiness Level: {formData.itchiness}/10 ({getItchinessLabel(formData.itchiness)})
            </label>
            <div className="px-4">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.itchiness}
                onChange={(e) => setFormData(prev => ({ ...prev, itchiness: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>No Itch</span>
                <span>Unbearable</span>
              </div>
            </div>
          </div>

          {/* Affected Area */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Affected Area
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
            >
              <option value="" className="bg-gray-800">Select affected area</option>
              {affectedAreas.map(area => (
                <option key={area} value={area} className="bg-gray-800">{area}</option>
              ))}
            </select>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Possible Triggers
            </label>
            
            {/* Common Triggers */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Common triggers:</p>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map(trigger => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => addTrigger(trigger)}
                    disabled={formData.triggers.includes(trigger)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      formData.triggers.includes(trigger)
                        ? 'bg-[#6A9FB5] text-white'
                        : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Trigger Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Add custom trigger"
                className="flex-1 p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
              />
              <button
                type="button"
                onClick={() => addTrigger(newTrigger)}
                className="bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white p-3 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Selected Triggers */}
            {formData.triggers.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-400 mb-2">Selected triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.triggers.map(trigger => (
                    <span
                      key={trigger}
                      className="flex items-center space-x-2 bg-[#6A9FB5] text-white px-3 py-1 rounded-full text-sm"
                    >
                      <span>{trigger}</span>
                      <button
                        type="button"
                        onClick={() => removeTrigger(trigger)}
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Describe your symptoms, what you were doing, how you felt..."
              className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <Save className="h-5 w-5" />
            <span>Save Symptom Log</span>
          </button>
        </form>
      </div>

      {/* Previous Logs */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Previous Logs</h2>
        
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No symptom logs yet. Start tracking your symptoms!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{log.area}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Itchiness Level</p>
                    <p className={`text-xl font-bold ${getItchinessColor(log.itchiness)}`}>
                      {log.itchiness}/10
                    </p>
                  </div>
                </div>
                
                {log.triggers.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-2">Triggers:</p>
                    <div className="flex flex-wrap gap-2">
                      {log.triggers.map(trigger => (
                        <span key={trigger} className="bg-red-500 bg-opacity-20 text-red-300 px-2 py-1 rounded text-sm">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {log.notes && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Notes:</p>
                    <p className="text-gray-300">{log.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomLog;