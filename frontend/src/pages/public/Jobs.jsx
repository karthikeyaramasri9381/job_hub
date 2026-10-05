import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Filter, Bookmark, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isCandidate } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employment_type') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('work_mode') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experience_level') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: 10,
        search: search || undefined,
        location: location || undefined,
        employment_type: employmentType || undefined,
        work_mode: workMode || undefined,
        experience_level: experienceLevel || undefined,
        sort: sort || undefined,
      };

      const res = await jobService.getPublicJobs(params);
      if (res.success && res.data) {
        setJobs(res.data.results || []);
        setTotalPages(res.data.total_pages || 1);
        setCurrentPage(res.data.current_page || page);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (location) newParams.set('location', location);
    if (employmentType) newParams.set('employment_type', employmentType);
    if (workMode) newParams.set('work_mode', workMode);
    if (experienceLevel) newParams.set('experience_level', experienceLevel);
    if (sort) newParams.set('sort', sort);
    setSearchParams(newParams);
  };

  const handleToggleSave = async (jobId, currentIsSaved) => {
    if (!isAuthenticated || !isCandidate) {
      alert("Please log in as a candidate to save jobs.");
      return;
    }
    try {
      if (currentIsSaved) {
        await jobService.unsaveJob(jobId);
      } else {
        await jobService.saveJob(jobId);
      }
      setJobs((prevJobs) =>
        prevJobs.map((j) => (j.id === jobId ? { ...j, is_saved: !currentIsSaved } : j))
      );
    } catch (err) {
      console.error("Failed to toggle save job:", err);
    }
  };

  return (
    <div className="jobs-page-container">
      <div className="jobs-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-header">
            <h3><Filter size={18} /> Filter Jobs</h3>
          </div>

          <form onSubmit={handleApplyFilters} className="filter-form">
            <div className="filter-group">
              <label>Search Keyword</label>
              <input
                type="text"
                placeholder="Title, skill, or keyword"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="City or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Work Mode</label>
              <select value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                <option value="">All Modes</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On Site</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Employment Type</label>
              <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Experience Level</label>
              <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                <option value="">All Experience</option>
                <option value="ENTRY">Entry Level</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Jobs List */}
        <main className="jobs-main-content">
          <div className="jobs-top-bar">
            <h2>Job Search Results</h2>
            <p>Page {currentPage} of {totalPages}</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '60px' }}>Loading jobs...</p>
          ) : (
            <div className="jobs-list">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="job-list-card">
                    <div className="job-list-header">
                      <div>
                        <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
                        <p className="company">{job.company_name} • {job.company_location || job.location}</p>
                      </div>

                      <button
                        className={`btn-save ${job.is_saved ? 'saved' : ''}`}
                        onClick={() => handleToggleSave(job.id, job.is_saved)}
                        title={job.is_saved ? 'Unsave Job' : 'Save Job'}
                      >
                        <Bookmark size={20} fill={job.is_saved ? '#2563eb' : 'none'} color={job.is_saved ? '#2563eb' : '#64748b'} />
                      </button>
                    </div>

                    <p className="job-desc-snippet">{job.description?.substring(0, 180)}...</p>

                    <div className="job-tags">
                      <span className="job-tag"><MapPin size={14} /> {job.location}</span>
                      <span className="job-tag"><Clock size={14} /> {job.work_mode}</span>
                      <span className="job-tag badge-light">{job.employment_type}</span>
                      {job.salary_min && (
                        <span className="job-tag salary"><DollarSign size={14} /> ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}</span>
                      )}
                    </div>

                    <div className="job-list-footer">
                      <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">View Details & Apply</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-jobs-found">
                  <h3>No matching jobs found</h3>
                  <p>Try broadening your search query or clearing filter criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchJobs(currentPage - 1)}
                className="btn btn-outline btn-sm"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span>Page {currentPage} of {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchJobs(currentPage + 1)}
                className="btn btn-outline btn-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
