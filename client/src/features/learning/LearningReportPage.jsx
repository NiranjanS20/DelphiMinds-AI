import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

export default function LearningReportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(ENDPOINTS.LEARNING_REPORT, {
        targetRole: 'Full Stack Engineer',
        skills: ['JavaScript', 'React', 'Node.js'],
        missingSkills: ['PostgreSQL', 'Docker', 'AWS'],
        parsedData: { skillsMatch: 65, projects: 70, experience: 40, keywords: 60 },
      });
      const data = res.data;
      if (data.success) {
        setReportData(data.data);
      } else {
        setError(data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Failed to fetch report', err);
      setError(err.response?.data?.message || err.message || 'Unable to generate diagnostic report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Diagnostic Report</h1>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchReport}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      ) : reportData ? (
        <div className="space-y-8">
          {/* Score Section */}
          <div className="flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
            <div>
              <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100">Resume Score</h2>
              <p className="text-gray-600 dark:text-indigo-200">Level: {reportData.score?.level?.toUpperCase()}</p>
            </div>
            <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-300">
              {reportData.score?.score}
              <span className="text-2xl text-gray-500">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-green-600">Strengths</h3>
              <ul className="list-disc pl-5 space-y-1">
                {Array.isArray(reportData.report?.strengths) && reportData.report.strengths.map((s, i) => <li key={i} className="text-gray-700 dark:text-gray-300">{s}</li>)}
              </ul>
            </div>
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-red-600">Weaknesses</h3>
              <ul className="list-disc pl-5 space-y-1">
                {Array.isArray(reportData.report?.weaknesses) && reportData.report.weaknesses.map((w, i) => <li key={i} className="text-gray-700 dark:text-gray-300">{w}</li>)}
              </ul>
            </div>
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-yellow-600">Market Gap</h3>
              <ul className="list-disc pl-5 space-y-1">
                {Array.isArray(reportData.report?.market_gap) && reportData.report.market_gap.map((m, i) => <li key={i} className="text-gray-700 dark:text-gray-300">{m}</li>)}
              </ul>
            </div>
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Improvement Areas</h3>
              <ul className="list-disc pl-5 space-y-1">
                {Array.isArray(reportData.report?.improvement_areas) && reportData.report.improvement_areas.map((imp, i) => <li key={i} className="text-gray-700 dark:text-gray-300">{imp}</li>)}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate('/learning/path')}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Generate Personalized Learning Path
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">No report available. Try generating one.</p>
      )}
    </div>
  );
}
