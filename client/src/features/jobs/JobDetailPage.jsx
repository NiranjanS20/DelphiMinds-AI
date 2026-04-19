import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { SectionLoader } from '../../components/Loader';
import { ExternalLink, Briefcase, MapPin, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';

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
      setError(err.response?.data?.message || 'Failed to calculate fit score. Ensure you have uploaded a resume.');
    } finally {
      setLoading(false);
    }
  };

  if (!job) return <SectionLoader />;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <button onClick={() => navigate('/jobs')} className="text-gray-400 hover:text-white transition flex items-center gap-2 mb-4">
        ← Back to Jobs
      </button>

      <div className="bg-surface border border-white/5 p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-white mb-4">{job.title || job.title_display}</h1>
        <div className="flex flex-wrap gap-6 text-gray-300">
          <div className="flex items-center gap-2"><Briefcase size={18} className="text-gray-400" /> {job.company?.display_name || job.company}</div>
          <div className="flex items-center gap-2"><MapPin size={18} className="text-gray-400" /> {job.location?.display_name || job.location}</div>
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <DollarSign size={18} />
              <span>
                {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''} 
                {job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-white/5 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold border-b border-white/10 pb-4 text-white">Job Description</h2>
          <p className="text-gray-300 whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-white">AI Fit Analyzer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {!fitScore && !loading && (
                <button
                  onClick={handleCheckFit}
                  className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent/90 transition shadow-lg font-medium"
                >
                  Calculate My Fit Score
                </button>
              )}
              
              {loading && <SectionLoader message="Analyzing your skills vs job requirements..." />}
              
              {error && <p className="text-red-400 text-sm font-medium p-4 bg-red-400/10 rounded-lg border border-red-400/20">{error}</p>}

              {fitScore && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between bg-black/40 border border-white/5 p-6 rounded-xl">
                    <span className="font-semibold text-gray-300">Overall Fit</span>
                    <span className={`text-4xl font-bold ${fitScore.fit_score >= 80 ? 'text-green-400' : fitScore.fit_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {fitScore.fit_score}%
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 italic border-l-4 border-accent pl-4 py-2">
                    "{fitScore.explanation || 'Based on your uploaded skills, here is your comparison.'}"
                  </p>

                  {fitScore.matched_skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} /> Matched Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fitScore.matched_skills.map((s, i) => (
                          <span key={i} className="text-xs bg-green-400/10 text-green-400 border border-green-400/20 px-3 py-1.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {fitScore.missing_skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} /> Missing Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fitScore.missing_skills.map((s, i) => (
                          <span key={i} className="text-xs bg-red-400/10 text-red-400 border border-red-400/20 px-3 py-1.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <a 
            href={job.redirect_url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-white/5 border border-white/10 text-white flex items-center justify-center gap-2 py-4 rounded-xl hover:bg-white/10 transition font-medium"
          >
            Apply on Adzuna <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
