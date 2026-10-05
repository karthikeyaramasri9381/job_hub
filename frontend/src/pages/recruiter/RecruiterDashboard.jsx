import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, PlusCircle, Calendar, CheckCircle2, Clock, Eye, AlertCircle, Building } from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const [jobsRes, companyRes, intRes] = await Promise.all([
          recruiterService.getJobs(),
          recruiterService.getCompany(),
          recruiterService.getInterviews(),
        ]);

        if (jobsRes.success) setJobs(jobsRes.data?.results || jobsRes.data || []);
        if (companyRes.success) setCompany(companyRes.data);
        if (intRes.success) setInterviews(intRes.data || []);
      } catch (err) {
        console.error("Failed to load recruiter dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  const totalJobs = jobs.length;
  const publishedJobs = jobs.filter((j) => j.status === 'PUBLISHED').length;
  const draftJobs = jobs.filter((j) => j.status === 'DRAFT').length;
  const interviewCount = interviews.length;

  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading recruiter dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Recruiter Dashboard</h2>
          <p>
            {company ? `Managing recruitment for ${company.name}` : 'Setup your company profile to start hiring top talent'}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/recruiter/company" className="btn btn-outline btn-sm">
            <Building size={16} /> Company Profile
          </Link>
          <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> Post a New Job
          </Link>
        </div>
      </div>

      {!company && (
        <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <span>
            You have not configured a company profile yet. 
            <Link to="/recruiter/company" style={{ fontWeight: 600, marginLeft: '6px' }}>Configure Company Profile</Link> to post jobs.
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><Briefcase size={22} /></div>
          <div>
            <h3>{totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green"><CheckCircle2 size={22} /></div>
          <div>
            <h3>{publishedJobs}</h3>
            <p>Published Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange"><Clock size={22} /></div>
          <div>
            <h3>{draftJobs}</h3>
            <p>Draft Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-teal"><Calendar size={22} /></div>
          <div>
            <h3>{interviewCount}</h3>
            <p>Interviews Scheduled</p>
          </div>
        </div>
      </div>

      {/* Recent Posted Jobs */}
      <div className="dashboard-card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h3>Your Posted Jobs</h3>
          <Link to="/recruiter/jobs" className="view-link">Manage All Jobs</Link>
        </div>

        {jobs.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type & Mode</th>
                  <th>Status</th>
                  <th>Posted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link to={`/jobs/${job.id}`} className="table-link">{job.title}</Link>
                    </td>
                    <td>{job.location}</td>
                    <td>{job.work_mode} ({job.employment_type})</td>
                    <td>
                      <span className={`status-badge ${job.status === 'PUBLISHED' ? 'badge-green' : job.status === 'DRAFT' ? 'badge-orange' : 'badge-gray'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-outline btn-sm">
                          <Users size={14} /> Applicants
                        </Link>
                        <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-outline btn-sm">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Briefcase size={36} className="empty-icon" />
            <p>You haven't posted any job listings yet.</p>
            <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
