import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import SearchBar from '../components/SearchBar';
import { PlanCardSkeleton } from '../components/LoadingSkeleton';
import { FiFilter, FiTrendingUp, FiDollarSign, FiClock, FiStar } from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToastContext();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/plans`);
      setPlans(response.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
      showError('Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPlans = useMemo(() => {
    let filtered = [...plans];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(plan =>
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.trainerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(plan => {
        if (priceFilter === 'free') return plan.price === 0;
        if (priceFilter === 'low') return plan.price > 0 && plan.price <= 20;
        if (priceFilter === 'medium') return plan.price > 20 && plan.price <= 50;
        if (priceFilter === 'high') return plan.price > 50;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'duration-short':
          return a.duration - b.duration;
        case 'duration-long':
          return b.duration - a.duration;
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return filtered;
  }, [plans, searchQuery, sortBy, priceFilter]);

  const handleQuickSubscribe = async (planId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      showError('Please login to subscribe to plans');
      navigate('/login');
      return;
    }

    if (user.role === 'trainer') {
      showError('Trainers cannot subscribe to plans');
      return;
    }

    setSubscribingPlanId(planId);
    try {
      await axios.post(`${API_URL}/subscriptions/${planId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      success('Successfully subscribed to this plan!');
      fetchPlans();
    } catch (err) {
      showError(err.response?.data?.message || 'Error subscribing to plan');
    } finally {
      setSubscribingPlanId(null);
    }
  };

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">Transform Your Fitness Journey</h1>
          <p className="hero-subtitle">
            Discover personalized fitness plans from certified trainers
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <FiTrendingUp className="stat-icon" />
              <span>{plans.length} Active Plans</span>
            </div>
            <div className="stat-item">
              <FiStar className="stat-icon" />
              <span>Expert Trainers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="filters-section">
          <div className="search-filter-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search plans, trainers..."
            />
            <button
              className="btn btn-outline filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="duration-short">Duration: Shortest</option>
                  <option value="duration-long">Duration: Longest</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Price Range</label>
                <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="low">$0 - $20</option>
                  <option value="medium">$20 - $50</option>
                  <option value="high">$50+</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="results-header">
          <h2 className="section-title">
            {filteredAndSortedPlans.length === plans.length
              ? 'Available Fitness Plans'
              : `Found ${filteredAndSortedPlans.length} plan${filteredAndSortedPlans.length !== 1 ? 's' : ''}`}
          </h2>
          {searchQuery && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid">
            {[...Array(6)].map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSortedPlans.length === 0 ? (
          <div className="card text-center empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No plans found</h3>
            <p>
              {searchQuery || priceFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No plans available yet. Be the first trainer to create one!'}
            </p>
            {(searchQuery || priceFilter !== 'all') && (
              <button
                className="btn btn-primary mt-2"
                onClick={() => {
                  setSearchQuery('');
                  setPriceFilter('all');
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid">
            {filteredAndSortedPlans.map((plan) => (
              <div key={plan._id} className="plan-card">
                <div className="plan-card-header">
                  <h3>{plan.title}</h3>
                  {plan.price === 0 && (
                    <span className="badge badge-free">FREE</span>
                  )}
                </div>
                <p className="trainer-name">
                  by{' '}
                  <Link to={`/trainers/${plan.trainer?._id || plan.trainer}`}>
                    {plan.trainerName}
                  </Link>
                </p>
                <div className="plan-info">
                  <div className="info-item">
                    <FiDollarSign className="info-icon" />
                    <span className="price">${plan.price}</span>
                  </div>
                  <div className="info-item">
                    <FiClock className="info-icon" />
                    <span className="duration">{plan.duration} days</span>
                  </div>
                </div>
                {plan.description && (
                  <p className="plan-preview">
                    {plan.description.length > 100
                      ? `${plan.description.substring(0, 100)}...`
                      : plan.description}
                  </p>
                )}
                <div className="plan-card-actions">
                  {user && user.role === 'user' && (
                    <button
                      onClick={(e) => handleQuickSubscribe(plan._id, e)}
                      disabled={subscribingPlanId === plan._id}
                      className="btn btn-success"
                    >
                      {subscribingPlanId === plan._id ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  )}
                  <Link to={`/plans/${plan._id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

