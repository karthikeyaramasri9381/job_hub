import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { Search, MapPin, Briefcase, Building, CheckCircle, ArrowRight, Star, Clock, DollarSign } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const res = await jobService.getPublicJobs({ page_size: 6 });
        if (res.success && res.data?.results) {
          setFeaturedJobs(res.data.results);
        }
      } catch (err) {
        console.error("Failed to load featured jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/jobs?${params.toString()}`);
  };

  const categories = [
    { title: 'Software Engineering', count: '450+ Jobs', icon: Briefcase },
    { title: 'Data & Analytics', count: '280+ Jobs', icon: Star },
    { title: 'Cloud & DevOps', count: '310+ Jobs', icon: Building },
    { title: 'Product & Design', count: '190+ Jobs', icon: CheckCircle },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            Find the right opportunity for your future.
          </h1>
          <p className="hero-subtitle">
            JobHub connects top candidates with leading technology and corporate employers worldwide.
          </p>

          <form onSubmit={handleSearchSubmit} className="hero-search-bar">
            <div className="search-field">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Job title, skills, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-field">
              <MapPin className="search-icon" size={20} />
              <input
                type="text"
                placeholder="City, state, or Remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-search">
              Search Jobs
            </button>
          </form>

          <div className="hero-action-buttons">
            <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
            <Link to="/recruiter/jobs/create" className="btn btn-outline">Post a Job</Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="section-container">
        <div className="section-header">
          <h2>Featured Opportunities</h2>
          <Link to="/jobs" className="view-all-link">View All Jobs <ArrowRight size={16} /></Link>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading top jobs...</p>
        ) : (
          <div className="jobs-grid">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-title">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="company-name">{job.company_name}</p>
                    </div>
                  </div>

                  <div className="job-tags">
                    <span className="job-tag"><MapPin size={14} /> {job.location}</span>
                    <span className="job-tag"><Clock size={14} /> {job.work_mode}</span>
                    {job.salary_min && (
                      <span className="job-tag salary"><DollarSign size={14} /> ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}</span>
                    )}
                  </div>

                  <div className="job-card-footer">
                    <span className="badge badge-light">{job.employment_type}</span>
                    <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">View Details</Link>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b' }}>No featured jobs available right now.</p>
            )}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="section-container bg-light">
        <div className="section-header">
          <h2>Popular Categories</h2>
        </div>
        <div className="categories-grid">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="category-card" onClick={() => navigate(`/jobs?search=${cat.title}`)}>
                <Icon size={32} className="cat-icon" />
                <h3>{cat.title}</h3>
                <p>{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How JobHub Works */}
      <section className="section-container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <h2>How JobHub Works</h2>
        </div>
        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Create an Account</h3>
            <p>Sign up as a candidate to build your professional profile or as a recruiter to publish open roles.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>Search & Apply</h3>
            <p>Filter open positions by skills, salary, location, or work mode, and apply in seconds with your saved resume.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Track & Interview</h3>
            <p>Stay updated with real-time status badges (`Under Review`, `Shortlisted`, `Interview`) and attend scheduled meetings.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
