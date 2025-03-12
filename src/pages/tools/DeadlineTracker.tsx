import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Trash2, Bell, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface Deadline {
  id: string;
  name: string;
  date: string;
  completed: boolean;
}

export function DeadlineTracker() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    { id: '1', name: 'Engineering Excellence Scholarship', date: '2025-04-15', completed: false },
    { id: '2', name: 'Community Leadership Award', date: '2025-05-01', completed: false },
    { id: '3', name: 'STEM Women in Tech Grant', date: '2025-03-30', completed: true },
  ]);
  
  const [newDeadline, setNewDeadline] = useState({ name: '', date: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDeadline = () => {
    if (newDeadline.name && newDeadline.date) {
      setDeadlines([
        ...deadlines,
        {
          id: Date.now().toString(),
          name: newDeadline.name,
          date: newDeadline.date,
          completed: false
        }
      ]);
      setNewDeadline({ name: '', date: '' });
      setIsAdding(false);
    }
  };

  const toggleComplete = (id: string) => {
    setDeadlines(deadlines.map(deadline => 
      deadline.id === id ? { ...deadline, completed: !deadline.completed } : deadline
    ));
  };

  const deleteDeadline = (id: string) => {
    setDeadlines(deadlines.filter(deadline => deadline.id !== id));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Deadline Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                Never miss an application deadline. Track important dates and get reminders for upcoming scholarship deadlines.
              </p>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Deadlines
                  </h2>
                  
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Deadline
                  </Button>
                </div>
                
                {isAdding && (
                  <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Add New Deadline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Scholarship Name
                        </label>
                        <input
                          type="text"
                          value={newDeadline.name}
                          onChange={(e) => setNewDeadline({...newDeadline, name: e.target.value})}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter scholarship name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Deadline Date
                        </label>
                        <input
                          type="date"
                          value={newDeadline.date}
                          onChange={(e) => setNewDeadline({...newDeadline, date: e.target.value})}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAdding(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddDeadline}
                        disabled={!newDeadline.name || !newDeadline.date}
                      >
                        Save Deadline
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {deadlines.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No deadlines added yet. Click "Add Deadline" to get started.
                    </div>
                  ) : (
                    deadlines.map(deadline => {
                      const isUpcoming = new Date(deadline.date) > new Date();
                      const isPast = new Date(deadline.date) < new Date();
                      
                      return (
                        <div 
                          key={deadline.id}
                          className={`p-4 rounded-lg border flex items-center justify-between ${
                            deadline.completed 
                              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                              : isUpcoming
                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleComplete(deadline.id)}
                              className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                                deadline.completed 
                                  ? 'bg-green-500 text-white' 
                                  : 'border-2 border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {deadline.completed && <CheckCircle className="w-5 h-5" />}
                            </button>
                            
                            <div>
                              <h3 className={`font-medium ${
                                deadline.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'
                              }`}>
                                {deadline.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Due: {new Date(deadline.date).toLocaleDateString()}
                                {isPast && !deadline.completed && ' (Overdue)'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!deadline.completed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 dark:text-indigo-400"
                              >
                                <Bell className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 dark:text-red-400"
                              onClick={() => deleteDeadline(deadline.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {deadlines.length > 0 && (
                  <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {deadlines.filter(d => d.completed).length} of {deadlines.length} completed
                    </p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-indigo-600 dark:text-indigo-400"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Sync with Calendar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 