import React, { useState, useEffect } from 'react';
import { candidateService } from '../../services/candidateService';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Trash2, CheckCircle2, AlertCircle, FileText, Globe } from 'lucide-react';

const CandidateProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    phone: '',
    location: '',
    bio: '',
    resume: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  // Modal forms
  const [showEduModal, setShowEduModal] = useState(false);
  const [eduData, setEduData] = useState({ degree: '', institution: '', field_of_study: '', start_date: '', end_date: '', grade: '' });

  const [showExpModal, setShowExpModal] = useState(false);
  const [expData, setExpData] = useState({ job_title: '', company_name: '', location: '', start_date: '', end_date: '', description: '' });

  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('INTERMEDIATE');

  const fetchProfileData = async () => {
    try {
      const res = await candidateService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          full_name: res.data.full_name || '',
          headline: res.data.headline || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          bio: res.data.bio || '',
          resume: res.data.resume || '',
          linkedin_url: res.data.linkedin_url || '',
          github_url: res.data.github_url || '',
          portfolio_url: res.data.portfolio_url || '',
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await candidateService.updateProfile(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
        fetchProfileData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Profile update failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      const res = await candidateService.addEducation(eduData);
      if (res.id || res.success) {
        setShowEduModal(false);
        setEduData({ degree: '', institution: '', field_of_study: '', start_date: '', end_date: '', grade: '' });
        fetchProfileData();
      }
    } catch (err) {
      console.error("Education add error:", err);
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm("Remove this education entry?")) return;
    try {
      await candidateService.deleteEducation(id);
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      const res = await candidateService.addExperience(expData);
      if (res.id || res.success) {
        setShowExpModal(false);
        setExpData({ job_title: '', company_name: '', location: '', start_date: '', end_date: '', description: '' });
        fetchProfileData();
      }
    } catch (err) {
      console.error("Experience add error:", err);
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm("Remove this experience entry?")) return;
    try {
      await candidateService.deleteExperience(id);
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await candidateService.addSkill({ name: newSkill, skill_level: skillLevel });
      setNewSkill('');
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await candidateService.deleteSkill(id);
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Candidate Profile...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Candidate Profile</h2>
          <p>Manage your professional background, resume, skills, and contact details</p>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      {/* Main Profile Form */}
      <div className="dashboard-card">
        <h3>Personal & Professional Details</h3>
        <form onSubmit={handleProfileSave} className="auth-form" style={{ marginTop: '20px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleProfileChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Professional Headline</label>
              <input type="text" name="headline" value={formData.headline} onChange={handleProfileChange} placeholder="Senior Full-Stack Engineer" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleProfileChange} placeholder="+1 555-0199" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleProfileChange} placeholder="San Francisco, CA" />
            </div>
          </div>

          <div className="form-group">
            <label>Professional Summary / Bio</label>
            <textarea rows={4} name="bio" value={formData.bio} onChange={handleProfileChange} placeholder="Brief summary of your expertise..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Resume URL (Cloudinary / PDF link)</label>
              <input type="url" name="resume" value={formData.resume} onChange={handleProfileChange} placeholder="https://res.cloudinary.com/..." />
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleProfileChange} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GitHub URL</label>
              <input type="url" name="github_url" value={formData.github_url} onChange={handleProfileChange} placeholder="https://github.com/..." />
            </div>
            <div className="form-group">
              <label>Portfolio URL</label>
              <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleProfileChange} placeholder="https://yourportfolio.dev" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>
      </div>

      {/* Skills Section */}
      <div className="dashboard-card" style={{ marginTop: '24px' }}>
        <h3>Skills & Expertise</h3>
        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <input
            type="text"
            placeholder="Add skill (e.g., Python, React, PostgreSQL)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm"><Plus size={16} /> Add Skill</button>
        </form>

        <div className="skills-list" style={{ marginTop: '16px' }}>
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((s) => (
              <span key={s.id} className="skill-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {s.skill_name} ({s.skill_level})
                <Trash2 size={14} style={{ cursor: 'pointer', color: '#dc2626' }} onClick={() => handleDeleteSkill(s.id)} />
              </span>
            ))
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No skills added yet.</p>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="dashboard-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3>Education Background</h3>
          <button onClick={() => setShowEduModal(true)} className="btn btn-outline btn-sm"><Plus size={16} /> Add Education</button>
        </div>

        {profile?.education && profile.education.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {profile.education.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{edu.degree} in {edu.field_of_study}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{edu.institution} ({edu.start_date} - {edu.end_date || 'Present'})</p>
                  {edu.grade && <p style={{ fontSize: '0.85rem', color: '#16a34a' }}>Grade: {edu.grade}</p>}
                </div>
                <button onClick={() => handleDeleteEducation(edu.id)} className="btn btn-save" title="Remove"><Trash2 size={16} color="#dc2626" /></button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', marginTop: '12px', fontSize: '0.9rem' }}>No education entries recorded.</p>
        )}
      </div>

      {/* Experience Section */}
      <div className="dashboard-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3>Work Experience</h3>
          <button onClick={() => setShowExpModal(true)} className="btn btn-outline btn-sm"><Plus size={16} /> Add Experience</button>
        </div>

        {profile?.experience && profile.experience.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {profile.experience.map((exp) => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{exp.job_title} at {exp.company_name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{exp.location} ({exp.start_date} - {exp.end_date || 'Present'})</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>{exp.description}</p>
                </div>
                <button onClick={() => handleDeleteExperience(exp.id)} className="btn btn-save" title="Remove"><Trash2 size={16} color="#dc2626" /></button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', marginTop: '12px', fontSize: '0.9rem' }}>No work experience entries recorded.</p>
        )}
      </div>

      {/* Add Education Modal */}
      {showEduModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Education</h3>
              <button className="close-btn" onClick={() => setShowEduModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddEducation}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Degree</label>
                <input type="text" required placeholder="B.S. Computer Science" value={eduData.degree} onChange={(e) => setEduData({ ...eduData, degree: e.target.value })} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Institution / University</label>
                <input type="text" required placeholder="MIT / Stanford" value={eduData.institution} onChange={(e) => setEduData({ ...eduData, institution: e.target.value })} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Field of Study</label>
                <input type="text" placeholder="Computer Science" value={eduData.field_of_study} onChange={(e) => setEduData({ ...eduData, field_of_study: e.target.value })} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="form-row" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" required value={eduData.start_date} onChange={(e) => setEduData({ ...eduData, start_date: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={eduData.end_date} onChange={(e) => setEduData({ ...eduData, end_date: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEduModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showExpModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Work Experience</h3>
              <button className="close-btn" onClick={() => setShowExpModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddExperience}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Job Title</label>
                <input type="text" required placeholder="Frontend Developer" value={expData.job_title} onChange={(e) => setExpData({ ...expData, job_title: e.target.value })} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Company Name</label>
                <input type="text" required placeholder="Google / Amazon" value={expData.company_name} onChange={(e) => setExpData({ ...expData, company_name: e.target.value })} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="form-row" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" required value={expData.start_date} onChange={(e) => setExpData({ ...expData, start_date: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={expData.end_date} onChange={(e) => setExpData({ ...expData, end_date: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Description</label>
                <textarea rows={3} placeholder="Key responsibilities and achievements..." value={expData.description} onChange={(e) => setExpData({ ...expData, description: e.target.value })} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowExpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfilePage;
