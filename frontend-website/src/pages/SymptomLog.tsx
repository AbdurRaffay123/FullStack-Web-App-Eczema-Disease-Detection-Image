import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { symptomService, SymptomLog as SymptomLogType } from '../services/symptomService';
import { Save, Calendar, MapPin, AlertCircle, Plus, X, Edit, Trash2 } from 'lucide-react';

const SymptomLog: React.FC = () => {
  const [formData, setFormData] = useState({
    itchinessLevel: 5,
    affectedArea: '',
    possibleTriggers: '',
    additionalNotes: ''
  });
  const [logs, setLogs] = useState<SymptomLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const affectedAreas = [
    'Face', 'Neck', 'Arms', 'Forearm', 'Hands', 'Chest', 'Back', 'Legs', 'Feet', 'Other'
  ];

  const commonTriggers = [
    'Stress', 'Dry weather', 'Humid weather', 'New soap', 'New detergent', 
    'Certain foods', 'Pet dander', 'Dust', 'Pollen', 'Fabric softener'
  ];

  // Load logs on mount
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const fetchedLogs = await symptomService.getLogs();
      setLogs(fetchedLogs);
    } catch (error: any) {
      showToast(error.message || 'Failed to load logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.affectedArea) {
      showToast('Please select an affected area', 'error');
      return;
    }

    if (formData.itchinessLevel < 1 || formData.itchinessLevel > 10) {
      showToast('Itchiness level must be between 1 and 10', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update existing log
        await symptomService.updateLog(editingId, formData);
        showToast('Symptom log updated successfully!', 'success');
        setEditingId(null);
      } else {
        // Create new log
        await symptomService.createLog(formData);
        showToast('Symptom log saved successfully!', 'success');
      }
      
      resetForm();
      loadLogs();
    } catch (error: any) {
      showToast(error.message || 'Failed to save log', 'error');
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
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await symptomService.deleteLog(deleteId);
      showToast('Log deleted successfully', 'success');
      loadLogs();
      setDeleteId(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to delete log', 'error');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? 'Edit Symptom Log' : "Log Today's Symptoms"}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Itchiness Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Itchiness Level: {formData.itchinessLevel}/10 ({getItchinessLabel(formData.itchinessLevel)})
            </label>
            <div className="px-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.itchinessLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, itchinessLevel: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>1 - Very Mild</span>
                <span>10 - Unbearable</span>
              </div>
            </div>
          </div>

          {/* Affected Area */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Affected Area <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.affectedArea}
              onChange={(e) => setFormData(prev => ({ ...prev, affectedArea: e.target.value }))}
              className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6A9FB5]"
              required
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
              <p className="text-sm text-gray-400 mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map(trigger => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => addTrigger(trigger)}
                    className="px-3 py-1 rounded-full text-sm transition-all bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20"
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Input */}
            <textarea
              value={formData.possibleTriggers}
              onChange={(e) => setFormData(prev => ({ ...prev, possibleTriggers: e.target.value }))}
              placeholder="Enter possible triggers (comma-separated or one per line)"
              rows={3}
              className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Additional Notes
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={4}
              placeholder="Describe your symptoms, what you were doing, how you felt..."
              className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A9FB5] resize-none"
            />
          </div>

          <div className="flex space-x-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${editingId ? 'flex-1' : 'w-full'} flex items-center justify-center space-x-2 bg-[#6A9FB5] hover:bg-[#5A8FA5] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{editingId ? 'Update Log' : 'Save Symptom Log'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Previous Logs */}
      <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Previous Logs</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A9FB5] mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
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
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{log.affectedArea}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Itchiness Level</p>
                      <p className={`text-xl font-bold ${getItchinessColor(log.itchinessLevel)}`}>
                        {log.itchinessLevel}/10
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(log)}
                        className="p-2 bg-[#6A9FB5] bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-[#6A9FB5]" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(log.id)}
                        className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {log.possibleTriggers && log.possibleTriggers.trim() && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-2">Possible Triggers:</p>
                    <p className="text-gray-300">{log.possibleTriggers}</p>
                  </div>
                )}
                
                {log.additionalNotes && log.additionalNotes.trim() && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Notes:</p>
                    <p className="text-gray-300">{log.additionalNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A2E] border border-white border-opacity-20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Delete Symptom Log</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this symptom log? This action cannot be undone.
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

export default SymptomLog;
