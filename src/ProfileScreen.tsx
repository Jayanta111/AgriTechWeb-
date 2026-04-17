import React, { useState, useEffect } from 'react';
import { User, Clock, AlertTriangle, Leaf } from 'lucide-react';
import axios from 'axios';

interface HistoryEntry {
  user_id: string;
  disease_name: string;
  detection_date: string;
  advice_given: {
    disease_name: string;
    immediate_actions: string[];
    short_term_management: string[];
    long_term_prevention: string[];
    organic_alternatives: string[];
    safety_precautions: string[];
    yield_impact: string[];
  };
  follow_up_needed: boolean;
}

function ProfileScreen() {
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/history/${userId}`);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiseaseSeverity = (diseaseName: string) => {
    if (diseaseName.toLowerCase().includes('healthy')) return 'healthy';
    if (diseaseName.toLowerCase().includes('late blight') || 
        diseaseName.toLowerCase().includes('virus') ||
        diseaseName.toLowerCase().includes('bacterial')) return 'high';
    if (diseaseName.toLowerCase().includes('early blight') || 
        diseaseName.toLowerCase().includes('spot')) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'healthy': return <Leaf className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading your disease detection history...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Your Profile & History</h2>
        </div>
        <p className="text-gray-600 text-sm">User ID: {userId}</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No disease detections yet</p>
          <p className="text-gray-400 text-sm mt-1">Start scanning plants to build your history</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Detection History ({history.length})</h3>
            <button
              onClick={fetchHistory}
              className="text-blue-600 text-sm hover:underline"
            >
              Refresh
            </button>
          </div>

          {history.map((entry, index) => {
            const severity = getDiseaseSeverity(entry.disease_name);
            const severityColor = getSeverityColor(severity);
            
            return (
              <div
                key={index}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedEntry(entry);
                  setShowDetails(true);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityIcon(severity)}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${severityColor}`}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800">{entry.disease_name}</h4>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock className="w-3 h-3" />
                    {formatDate(entry.detection_date)}
                  </div>
                </div>

                {entry.follow_up_needed && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Follow-up recommended
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  {entry.advice_given.immediate_actions?.length > 0 && (
                    <span>{entry.advice_given.immediate_actions.length} immediate actions</span>
                  )}
                  {entry.advice_given.organic_alternatives?.length > 0 && (
                    <span className="ml-2">{entry.advice_given.organic_alternatives.length} organic solutions</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedEntry.disease_name}</h3>
                <p className="text-gray-500 text-sm">{formatDate(selectedEntry.detection_date)}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedEntry.advice_given.immediate_actions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Immediate Actions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedEntry.advice_given.immediate_actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEntry.advice_given.short_term_management?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2">Short-term Management</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedEntry.advice_given.short_term_management.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEntry.advice_given.long_term_prevention?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Long-term Prevention</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedEntry.advice_given.long_term_prevention.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEntry.advice_given.organic_alternatives?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Organic Alternatives</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedEntry.advice_given.organic_alternatives.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEntry.advice_given.safety_precautions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2">Safety Precautions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedEntry.advice_given.safety_precautions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEntry.advice_given.yield_impact?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Yield Impact & Recovery</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedEntry.advice_given.yield_impact.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileScreen;
