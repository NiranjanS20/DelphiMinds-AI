import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { SectionLoader } from '../../components/Loader';
import { Briefcase, MapPin, DollarSign } from 'lucide-react';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('developer');
  const [location, setLocation] = useState('us');
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/jobs/search', { params: { q: role, country: location } });
      const data = response.data?.data || {};
      const results = data.jobs || [];
      setJobs(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobs([]);
      setError(err?.response?.data?.message || 'Unable to fetch jobs right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-in">
      <div className="bg-surface border border-white/5 p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-white mb-4">Job Market Insights</h1>
        <form onSubmit={handleSearch} className="flex gap-4 flex-col sm:flex-row">
          <input 
            type="text" 
            placeholder="Job Role (e.g. Developer, Data Scientist)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 bg-[#1a1b2e] border border-white/10 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input 
            type="text" 
            placeholder="Country (e.g. us, gb)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full sm:w-32 bg-[#1a1b2e] border border-white/10 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button type="submit" className="bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent/90 transition shadow-lg font-medium">
            Search Jobs
          </button>
        </form>
      </div>

      {loading ? (
        <SectionLoader message="Fetching job data..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-all cursor-pointer hover:border-accent/50" onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}>
                <CardHeader>
                  <CardTitle className="text-lg text-white line-clamp-1">{job.title || job.title_display}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-gray-400" /> <span>{job.company?.display_name || job.company || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" /> <span>{job.location?.display_name || job.location || 'Remote'}</span>
                    </div>
                    {(job.salary_min || job.salary_max) ? (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-400" /> 
                        <span className="text-green-400 font-medium">
                          {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''} 
                          {job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">Salary not disclosed by employer</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 line-clamp-3">
                    {job.description || 'Description not available in this listing preview.'}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-12 bg-surface rounded-xl border border-white/5">
              {error || 'No jobs found. Try adjusting your search.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
