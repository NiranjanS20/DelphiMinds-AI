import React, { useState } from 'react';

export default function LearningPathPage() {
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState(null);
  
  const [role, setRole] = useState('Full Stack Engineer');
  const [time, setTime] = useState('10 hours/week');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/learning/path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          timeCommitment: time,
          level: 'intermediate',
          missingSkills: ['PostgreSQL', 'Docker', 'AWS']
        })
      });
      const data = await res.json();
      if (data.success) {
        setPathData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch path', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStage = (title, items, color) => (
    <div className="mb-8">
      <h3 className={`text-2xl font-bold mb-4 ${color}`}>{title}</h3>
      <div className="space-y-4">
        {items && items.length > 0 ? items.map((item, i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-current">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.skill}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><span className="font-medium">Resource:</span> {item.resource}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Duration:</span> {item.duration}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.reason}</p>
          </div>
        )) : <p className="text-gray-500">No resources needed for this stage.</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Personalized Learning Roadmap</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Tell us your goal and how much time you have.</p>
      
      {!pathData && (
        <form onSubmit={handleGenerate} className="space-y-4 mb-8 p-6 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Commitment</label>
            <input 
              type="text" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="e.g. 5 hours/week"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Roadmap'}
          </button>
        </form>
      )}

      {pathData && (
        <div className="space-y-10">
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <h2 className="text-lg font-medium text-green-800 dark:text-green-100 mb-1">Estimated Score Improvement</h2>
            <div className="text-4xl font-bold text-green-600 dark:text-green-300">+{pathData.estimated_score_improvement} <span className="text-xl">pts</span></div>
          </div>

          <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 pl-8 pb-4">
            {renderStage('Beginner Stage', pathData.beginner, 'text-blue-600')}
            {renderStage('Intermediate Stage', pathData.intermediate, 'text-amber-600')}
            {renderStage('Advanced Stage', pathData.advanced, 'text-purple-600')}
          </div>
          
          <div className="flex justify-center mt-8">
            <button onClick={() => setPathData(null)} className="text-indigo-600 hover:text-indigo-800 font-medium">
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
