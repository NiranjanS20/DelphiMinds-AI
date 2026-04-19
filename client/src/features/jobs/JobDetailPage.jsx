import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { SectionLoader } from '../../components/Loader';
import { ExternalLink, Briefcase, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState(location.state?.job || null);
  const [fitScore, setFitScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!job) {
      // In a real app we would fetch the single job using Adzuna single end-point or our own API
      // Since it might not be implemented, we redirect back if hard-reloaded here
      navigate('/jobs');
    }
  }, [job, navigate]);

  const handleCheckFit = async () => {
    if (!job?.description || !job?.title) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/jobs/fit-score', {
        jobTitle: job.title || job.title_display,
        jobDescription: job.description
      });
      setFitScore(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate fit score.');
    } finally {
      setLoading(false);
    }
  };

  if (!job) return <SectionLoader />;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <button onClick={() => navigate('/jobs')} className="text-blue-600 hover:underline mb-4 flex items-center">
        ← Back to Jobs
      </button>

      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title || job.title_display}</h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          <div className="flex items-center gap-1"><Briefcase size={18} /> {job.company?.display_name || job.company}</div>
          <div className="flex items-center gap-1"><MapPin size={18} /> {job.location?.display_name || job.location}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fit Analyzer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!fitScore && !loading && (
                <button
                  onClick={handleCheckFit}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Check Fit Score
                </button>
              )}
              
              {loading && <SectionLoader message="Analyzing resume and job description using Gemini AI..." />}
              
              {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

              {fitScore && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                    <span className="font-semibold text-blue-900">Your Fit</span>
                    <span className="text-3xl font-bold text-blue-600">{fitScore.fit_score}%</span>
                  </div>

                  <p className="text-sm text-gray-700 italic border-l-2 border-blue-400 pl-3">
                    "{fitScore.explanation || 'Based on your uploaded skills, here is your comparison.'}"
                  </p>

                  {fitScore.matched_skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle size={16} /> Matched Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fitScore.matched_skills.map((s, i) => (
                          <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {fitScore.missing_skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                        <AlertTriangle size={16} /> Missing Skills to Improve
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fitScore.missing_skills.map((s, i) => (
                          <span key={i} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <a 
                href={job.redirect_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full border-2 border-blue-600 text-blue-600 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-blue-50 transition"
              >
                Apply Now <ExternalLink size={16} />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
