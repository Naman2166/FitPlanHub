import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { FiTrendingUp, FiUsers, FiDollarSign, FiBarChart2, FiPlus, FiEdit2, FiTrash2, FiGrid, FiList } from 'react-icons/fi';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToastContext();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [editingPlan, setEditingPlan] = useState(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalRevenue: 0,
    totalSubscriptions: 0,
    averagePrice: 0
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user && user.role !== 'trainer') {
      navigate('/');
      return;
    }
    
    // Test backend connection
    const testBackend = async () => {
      try {
        const response = await axios.get(`${API_URL}/test`);
        console.log('Backend connection:', response.data);
      } catch (error) {
        console.error('Backend not reachable:', error);
        alert('⚠️ Backend server is not running! Please start the backend server on port 5000.');
      }
    };
    
    testBackend();
    fetchPlans();
  }, [user, navigate]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/plans`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const myPlans = response.data.filter(plan => {
        const trainerId = plan.trainer?._id || plan.trainer?.id || plan.trainer;
        return trainerId?.toString() === user?.id?.toString();
      });
      setPlans(myPlans);
      
      // Calculate statistics
      const totalRevenue = myPlans.reduce((sum, plan) => {
        // Estimate revenue (would need subscription data from backend)
        return sum + (plan.price * (plan.subscriptionCount || 0));
      }, 0);
      
      const totalSubscriptions = myPlans.reduce((sum, plan) => {
        return sum + (plan.subscriptionCount || 0);
      }, 0);
      
      const averagePrice = myPlans.length > 0
        ? myPlans.reduce((sum, plan) => sum + plan.price, 0) / myPlans.length
        : 0;

      setStats({
        totalPlans: myPlans.length,
        totalRevenue,
        totalSubscriptions,
        averagePrice
      });
    } catch (err) {
      console.error('Error fetching plans:', err);
      showError('Error fetching plans. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await axios.put(`${API_URL}/plans/${editingPlan._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post(`${API_URL}/plans`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      setFormData({ title: '', description: '', price: '', duration: '' });
      setEditingPlan(null);
      setShowForm(false);
      fetchPlans();
      success(editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
    } catch (err) {
      console.error('Error saving plan:', err);
      showError(err.response?.data?.message || 'Error saving plan. Please check if backend is running.');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price,
      duration: plan.duration
    });
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`${API_URL}/plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchPlans();
      success('Plan deleted successfully!');
    } catch (err) {
      console.error('Error deleting plan:', err);
      showError(err.response?.data?.message || 'Error deleting plan. Please check if backend is running.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({ title: '', description: '', price: '', duration: '' });
  };

  if (loading) {
    return <div className="container" style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user || user.role !== 'trainer') {
    return (
      <div className="container" style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You must be logged in as a trainer to access this page.</p>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Trainer Dashboard</h1>
            <p className="dashboard-subtitle">Manage your fitness plans and track performance</p>
          </div>
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                title="Grid View"
              >
                <FiGrid />
              </button>
              <button 
                onClick={() => setViewMode('table')} 
                className={`btn btn-icon ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                title="Table View"
              >
                <FiList />
              </button>
            </div>
            <button 
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditingPlan(null);
                  setFormData({ title: '', description: '', price: '', duration: '' });
                }
              }} 
              className="btn btn-primary"
            >
              <FiPlus className="btn-icon-left" />
              {showForm ? 'Hide Form' : 'Add New Plan'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-primary">
              <FiBarChart2 className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalPlans}</div>
              <div className="stat-label">Total Plans</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-success">
              <FiUsers className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalSubscriptions}</div>
              <div className="stat-label">Subscriptions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-warning">
              <FiDollarSign className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-info">
              <FiTrendingUp className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">${stats.averagePrice.toFixed(2)}</div>
              <div className="stat-label">Avg. Price</div>
            </div>
          </div>
        </div>

        <div className="add-plan-section">
          {showForm && (
            <div className="card form-card">
              <h2>
                {editingPlan ? (
                  <>
                    <FiEdit2 className="section-icon" />
                    Edit Plan
                  </>
                ) : (
                  <>
                    <FiPlus className="section-icon" />
                    Create New Plan
                  </>
                )}
              </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Fat Loss Beginner Plan"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe the plan in detail..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="29.99"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (days) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingPlan ? (
                    <>
                      <FiEdit2 className="btn-icon-left" />
                      Update Plan
                    </>
                  ) : (
                    <>
                      <FiPlus className="btn-icon-left" />
                      Create Plan
                    </>
                  )}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
            </div>
          )}
          {!showForm && (
            <div className="card text-center" style={{ background: '#fff3cd', border: '2px dashed #ffc107' }}>
              <p style={{ margin: 0, padding: '20px', color: '#856404' }}>
                Click "<strong>▲ Show Add Plan Form</strong>" button above to add a new plan
              </p>
            </div>
          )}
        </div>

        <div className="plans-section">
          <div className="section-header">
            <h2 className="section-title">My Plans ({plans.length})</h2>
          </div>
          
          {plans.length === 0 ? (
            <div className="card text-center">
              <p>You haven't created any plans yet. Use the form above to create your first plan!</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="table-container">
              <table className="plans-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan._id}>
                      <td className="plan-title-cell">
                        <strong>{plan.title}</strong>
                      </td>
                      <td className="plan-description-cell">
                        {plan.description.length > 100 
                          ? `${plan.description.substring(0, 100)}...` 
                          : plan.description}
                      </td>
                      <td className="plan-price-cell">
                        <span className="price-badge">${plan.price}</span>
                      </td>
                      <td className="plan-duration-cell">
                        <span className="duration-badge">{plan.duration} days</span>
                      </td>
                      <td className="plan-actions-cell">
                        <button 
                          onClick={() => handleEdit(plan)} 
                          className="btn btn-outline btn-sm"
                          title="Edit Plan"
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          onClick={() => handleDelete(plan._id)} 
                          className="btn btn-danger btn-sm"
                          title="Delete Plan"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid">
              {plans.map((plan) => (
                <div key={plan._id} className="plan-card">
                  <h3>{plan.title}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-info">
                    <span className="price">${plan.price}</span>
                    <span className="duration">{plan.duration} days</span>
                  </div>
                  <div className="plan-actions">
                    <button 
                      onClick={() => handleEdit(plan)} 
                      className="btn btn-outline"
                      title="Edit Plan"
                    >
                      <FiEdit2 className="btn-icon-left" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(plan._id)} 
                      className="btn btn-danger"
                      title="Delete Plan"
                    >
                      <FiTrash2 className="btn-icon-left" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;

