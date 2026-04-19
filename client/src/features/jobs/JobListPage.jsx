import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { SectionLoader } from '../../components/Loader';
import { Briefcase, MapPin, DollarSign, ExternalLink } from 'lucide-react';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('developer');
  const [location, setLocation] = useState('us');
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Endpoint created earlier is GET /api/jobs/search?q=developer... Wait, the backend endpoint is actually /api/jobs/search
      const response = await apiClient.get('/jobs/search', { params: { q: role, country: location } });
      // The adzuna integration returns response.data.data or something similar
      const data = response.data?.data || response.data || [];
      // Make sure we have an array 
      setJobs(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      // Fallback or empty state
      setJobs([]);
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
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Market Insights</h1>
        <form onSubmit={handleSearch} className="flex gap-4 flex-col sm:flex-row">
          <input 
            type="text" 
            placeholder="Job Role (e.g. Developer, Data Scientist)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <input 
            type="text" 
            placeholder="Country (e.g. us, gb)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full sm:w-32 border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
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
              <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-100" onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 line-clamp-1">{job.title || job.title_display}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} /> <span>{job.company?.display_name || job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} /> <span>{job.location?.display_name || job.location}</span>
                    </div>
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} /> 
                        <span>
                          {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''} 
                          {job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-3">
                    {job.description}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              No jobs found. Try adjusting your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
