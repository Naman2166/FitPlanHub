import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './TrainerProfile.css';

const TrainerProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [trainer, setTrainer] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTrainerProfile();
    if (user && user.role === 'user') {
      checkFollowStatus();
    }
  }, [id, user]);

  const fetchTrainerProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/trainers/${id}`);
      setTrainer(response.data.trainer);
      setPlans(response.data.plans);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error fetching trainer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/follows/check/${id}`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`${API_URL}/follows/${id}`);
        setIsFollowing(false);
      } else {
        await axios.post(`${API_URL}/follows/${id}`);
        setIsFollowing(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating follow status');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="container" style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        Trainer not found
      </div>
    );
  }

  return (
    <div className="trainer-profile">
      <div className="container">
        <div className="card trainer-header">
          <div className="trainer-info">
            <h1>{trainer.name}</h1>
            <p className="trainer-email">{trainer.email}</p>
            {user && user.role === 'user' && (
              <button
                onClick={handleFollow}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isFollowing ? '✓ Following' : '+ Follow Trainer'}
              </button>
            )}
          </div>
        </div>

        <h2 className="section-title">Plans by {trainer.name} ({plans.length})</h2>
        
        {plans.length === 0 ? (
          <div className="card text-center">
            <p>This trainer hasn't created any plans yet.</p>
          </div>
        ) : (
          <div className="grid">
            {plans.map((plan) => (
              <div key={plan._id} className="plan-card">
                <h3>{plan.title}</h3>
                <div className="plan-info">
                  <span className="price">${plan.price}</span>
                  <span className="duration">{plan.duration} days</span>
                </div>
                <Link to={`/plans/${plan._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerProfile;

