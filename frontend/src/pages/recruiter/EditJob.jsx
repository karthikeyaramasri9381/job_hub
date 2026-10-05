import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { Edit3, AlertCircle, ArrowLeft } from 'lucide-react';

const EditJob = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await recruiterService.getJobDetail(id);
        if (res.success && res.data) {
          const j = res.data;
          setFormData({
            title: j.title || '',
            location: j.location || '',
            employment_type: j.employment_type || 'FULL_TIME',
            work_mode: j.work_mode || 'REMOTE',
            experience_level: j.experience_level || 'MID',
            salary_min: j.salary_min || '',
            salary_max: j.salary_max || '',
            currency: j.currency || 'USD',
            description: j.description || '',
            responsibilities: j.responsibilities || '',
            qualifications: j.qualifications || '',
            status: j.status || 'PUBLISHED',
          });
        }
      } catch (err) {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await recruiterService.updateJob(id, formData);
      if (res.success) {
        navigate('/recruiter/jobs');
      } else {
        setError(res.message || 'Failed to update job.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Job update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading job details for editing...</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: '850px' }}>
      <button onClick={() => navigate('/recruiter/jobs')} className="btn btn-outline btn-sm back-btn">
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="dashboard-header">
        <div>
          <h2>Edit Job Listing</h2>
          <p>Update position requirements, compensation, or status</p>
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
            <input type="text" name="title" required value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} />
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
              <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Salary Max ($)</label>
              <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea rows={5} name="description" required value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Key Responsibilities</label>
            <textarea rows={4} name="responsibilities" value={formData.responsibilities} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Qualifications & Requirements</label>
            <textarea rows={4} name="qualifications" value={formData.qualifications} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label>Listing Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '12px' }}>
            {saving ? 'Updating...' : <><Edit3 size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
