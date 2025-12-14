import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { FiArrowLeft, FiDollarSign, FiClock, FiUser, FiCheck, FiLock } from 'react-icons/fi';
import './PlanDetails.css';

const PlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToastContext();
  const [plan, setPlan] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPlan();
    if (user) {
      checkSubscription();
    }
  }, [id, user]);

  const fetchPlan = async () => {
    try {
      const response = await axios.get(`${API_URL}/plans/${id}`, {
        headers: user ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });
      setPlan(response.data.plan);
      setHasAccess(response.data.hasAccess);
    } catch (err) {
      console.error('Error fetching plan:', err);
      showError('Plan not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setIsSubscribed(response.data.isSubscribed);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      showError('Please login to subscribe');
      navigate('/login');
      return;
    }

    if (user.role === 'trainer') {
      showError('Trainers cannot subscribe to plans');
      return;
    }

    setSubscribing(true);
    try {
      await axios.post(`${API_URL}/subscriptions/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      success('Successfully subscribed to this plan!');
      setIsSubscribed(true);
      fetchPlan();
    } catch (err) {
      showError(err.response?.data?.message || 'Error subscribing to plan');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="plan-details">
        <div className="container">
          <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '20px' }}>Loading plan details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="plan-details">
      <div className="container">
        <Link to="/" className="back-link">
          <FiArrowLeft className="back-icon" />
          Back to Plans
        </Link>
        
        <div className="plan-details-card">
          <div className="plan-header-section">
            <div className="plan-header">
              <h1>{plan.title}</h1>
              <div className="plan-meta">
                <span className="trainer-link">
                  <FiUser className="meta-icon" />
                  by{' '}
                  <Link to={`/trainers/${plan.trainer?._id || plan.trainer}`}>
                    {plan.trainerName || plan.trainer?.name}
                  </Link>
                </span>
              </div>
            </div>

            <div className="plan-pricing">
              <div className="price-badge">
                <FiDollarSign className="price-icon" />
                <span className="price-amount">${plan.price}</span>
              </div>
              <div className="duration-badge">
                <FiClock className="duration-icon" />
                <span>{plan.duration} days</span>
              </div>
            </div>
          </div>

          {hasAccess ? (
            <div className="plan-content">
              <div className="access-badge">
                <FiCheck className="check-icon" />
                <span>You have access to this plan</span>
              </div>
              <div className="plan-description">
                <h3>Plan Description</h3>
                <div className="description-content">
                  {plan.description.split('\n').map((para, i) => (
                    <p key={i}>{para || '\u00A0'}</p>
                  ))}
                </div>
              </div>
              {isSubscribed && (
                <div className="subscription-status">
                  <span className="badge badge-success large">
                    <FiCheck /> You are subscribed to this plan
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="plan-content locked">
              <div className="lock-notice">
                <FiLock className="lock-icon" />
                <h3>Subscribe to Unlock</h3>
                <p>Subscribe to view full plan details and access the complete fitness program.</p>
              </div>
              {user && user.role === 'user' && !isSubscribed && (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="btn btn-primary btn-large subscribe-btn"
                >
                  {subscribing ? (
                    <>
                      <div className="spinner-small"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe Now - ${plan.price}
                    </>
                  )}
                </button>
              )}
              {!user && (
                <div className="login-prompt">
                  <p>Please login to subscribe to this plan</p>
                  <Link to="/login" className="btn btn-primary">
                    Login
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;

