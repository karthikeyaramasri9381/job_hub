import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Users, Briefcase, Building, FileText, CheckCircle2, UserX, UserCheck, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getJobs(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (jobsRes.success) setJobs(jobsRes.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserActive = async (userId) => {
    try {
      const res = await adminService.toggleUserActive(userId);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        fetchAdminData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Action failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update user status.' });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Admin Action: Permanently delete this job posting from the platform?")) return;
    try {
      const res = await adminService.deleteJob(jobId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Job posting deleted by Admin.' });
        fetchAdminData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed.' });
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading Admin Console...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>System Administration Console</h2>
          <p>Platform metrics, user account moderation, and job content moderation</p>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      {/* Admin Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><Users size={22} /></div>
          <div>
            <h3>{stats?.total_users || 0}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple"><Users size={22} /></div>
          <div>
            <h3>{stats?.candidates || 0}</h3>
            <p>Candidates</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange"><Building size={22} /></div>
          <div>
            <h3>{stats?.recruiters || 0}</h3>
            <p>Recruiters</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-teal"><Building size={22} /></div>
          <div>
            <h3>{stats?.companies || 0}</h3>
            <p>Companies</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green"><Briefcase size={22} /></div>
          <div>
            <h3>{stats?.published_jobs || 0}</h3>
            <p>Active Published Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-gray"><FileText size={22} /></div>
          <div>
            <h3>{stats?.applications || 0}</h3>
            <p>Applications Submitted</p>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="role-selector" style={{ marginTop: '32px', maxWidth: '400px' }}>
        <button className={`role-tab ${activeTab === 'users' || activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          User Accounts
        </button>
        <button className={`role-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
          Job Listings Moderation
        </button>
      </div>

      {/* Users Moderation Table */}
      {(activeTab === 'users' || activeTab === 'overview') && (
        <div className="dashboard-card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3>Registered Users Directory</h3>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.email}</strong></td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td>
                      <span className="role-badge">{u.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserActive(u.id)}
                          className={`btn btn-sm ${u.is_active ? 'btn-danger-outline' : 'btn-outline'}`}
                        >
                          {u.is_active ? <><UserX size={14} /> Disable</> : <><UserCheck size={14} /> Enable</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Moderation Table */}
      {activeTab === 'jobs' && (
        <div className="dashboard-card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3>Platform Job Listings Moderation</h3>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Posted By</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td><strong>{job.title}</strong></td>
                    <td>{job.company_name}</td>
                    <td>{job.created_by_email}</td>
                    <td>
                      <span className={`status-badge ${job.status === 'PUBLISHED' ? 'badge-green' : 'badge-gray'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="btn btn-danger-outline btn-sm"
                        title="Remove Inappropriate Listing"
                      >
                        <Trash2 size={14} /> Delete Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
