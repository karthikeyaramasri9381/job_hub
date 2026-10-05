import React, { useState, useEffect } from 'react';
import { recruiterService } from '../../services/recruiterService';
import { Building, Globe, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

const CompanyProfilePage = () => {
  const [company, setCompany] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    industry: '',
    company_size: '',
    website: '',
    location: '',
    founded_year: '',
    description: '',
  });

  const fetchCompany = async () => {
    try {
      const res = await recruiterService.getCompany();
      if (res.success && res.data) {
        setCompany(res.data);
        setIsNew(false);
        setFormData({
          name: res.data.name || '',
          logo: res.data.logo || '',
          industry: res.data.industry || '',
          company_size: res.data.company_size || '',
          website: res.data.website || '',
          location: res.data.location || '',
          founded_year: res.data.founded_year || '',
          description: res.data.description || '',
        });
      } else {
        setIsNew(true);
      }
    } catch {
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      let res;
      if (isNew) {
        res = await recruiterService.createCompany(formData);
      } else {
        res = await recruiterService.updateCompany(formData);
      }

      if (res.success) {
        setFeedback({ type: 'success', message: 'Company details saved successfully!' });
        fetchCompany();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to save company profile.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save company details.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading company profile...</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      <div className="dashboard-header">
        <div>
          <h2>Company Profile Setup</h2>
          <p>Provide company information displayed on your job listings</p>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      <div className="dashboard-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" name="name" required placeholder="CloudSphere Tech" value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Industry</label>
              <input type="text" name="industry" placeholder="Software & Cloud" value={formData.industry} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Company Size</label>
              <select name="company_size" value={formData.company_size} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Website URL</label>
              <input type="url" name="website" placeholder="https://company.example.com" value={formData.website} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Headquarters Location</label>
              <input type="text" name="location" placeholder="Austin, TX" value={formData.location} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Logo URL (Cloudinary / Image Link)</label>
              <input type="url" name="logo" placeholder="https://res.cloudinary.com/..." value={formData.logo} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Founded Year</label>
              <input type="number" name="founded_year" placeholder="2020" value={formData.founded_year} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Company Overview / Description</label>
            <textarea rows={5} name="description" placeholder="Describe your company culture, mission, and products..." value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '12px' }}>
            {saving ? 'Saving...' : isNew ? 'Create Company Profile' : 'Update Company Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
