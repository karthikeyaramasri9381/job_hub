import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import { Bookmark, MapPin, Clock, DollarSign, Trash2, Eye } from 'lucide-react';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await candidateService.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job !== jobId));
    } catch (err) {
      console.error("Failed to unsave job:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Saved Jobs</h2>
          <p>Bookmarked opportunities you want to review or apply for later</p>
        </div>
        <Link to="/jobs" className="btn btn-primary btn-sm">Explore More Jobs</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading saved jobs...</div>
      ) : savedJobs.length > 0 ? (
        <div className="jobs-grid">
          {savedJobs.map((item) => {
            const job = item.job_details;
            if (!job) return null;
            return (
              <div key={item.id} className="job-card">
                <div className="job-card-header">
                  <div>
                    <h3 className="job-title"><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
                    <p className="company-name">{job.company_name}</p>
                  </div>
                  <button
                    onClick={() => handleUnsave(job.id)}
                    className="btn-save saved"
                    title="Remove from Saved Jobs"
                  >
                    <Trash2 size={18} color="#dc2626" />
                  </button>
                </div>

                <div className="job-tags">
                  <span className="job-tag"><MapPin size={14} /> {job.location}</span>
                  <span className="job-tag"><Clock size={14} /> {job.work_mode}</span>
                  {job.salary_min && (
                    <span className="job-tag salary"><DollarSign size={14} /> ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}</span>
                  )}
                </div>

                <div className="job-card-footer">
                  <span className="badge-light">{job.employment_type}</span>
                  <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">
                    <Eye size={14} /> Apply Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-card empty-state">
          <Bookmark size={40} className="empty-icon" />
          <h3>No saved jobs</h3>
          <p>Click the bookmark icon on any job card to save it here for quick access.</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Jobs</Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
