import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { PlusCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    employment_type: 'FULL_TIME',
    work_mode: 'REMOTE',
    experience_level: 'MID',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    description: '',
    responsibilities: '',
    qualifications: '',
    status: 'PUBLISHED',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await recruiterService.createJob(formData);
      if (res.success) {
        navigate('/recruiter/jobs');
      } else {
        setError(res.message || 'Failed to create job.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Job creation failed. Ensure company profile is created.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '850px' }}>
      <button onClick={() => navigate('/recruiter/jobs')} className="btn btn-outline btn-sm back-btn">
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="dashboard-header">
        <div>
          <h2>Post a New Job Opportunity</h2>
          <p>Fill out job details to publish on the JobHub job portal</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="dashboard-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Job Title</label>
            <input type="text" name="title" required placeholder="Senior React / Node.js Developer" value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" required placeholder="Remote, or New York, NY" value={formData.location} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Work Mode</label>
              <select name="work_mode" value={formData.work_mode} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On Site</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Employment Type</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select name="experience_level" value={formData.experience_level} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="ENTRY">Entry Level</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary Min ($)</label>
              <input type="number" name="salary_min" placeholder="90000" value={formData.salary_min} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Salary Max ($)</label>
              <input type="number" name="salary_max" placeholder="130000" value={formData.salary_max} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea rows={5} name="description" required placeholder="Detailed role description..." value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Key Responsibilities (Optional)</label>
            <textarea rows={4} name="responsibilities" placeholder="- Design & develop React components&#10;- Optimize Django database queries" value={formData.responsibilities} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Qualifications & Requirements (Optional)</label>
            <textarea rows={4} name="qualifications" placeholder="- 3+ years Python & React experience&#10;- Knowledge of PostgreSQL" value={formData.qualifications} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Initial Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="PUBLISHED">Publish Immediately</option>
              <option value="DRAFT">Save as Draft</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? 'Posting...' : <><PlusCircle size={18} /> Post Job Listing</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
