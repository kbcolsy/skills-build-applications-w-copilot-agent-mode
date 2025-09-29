import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for adding workouts
  const [showForm, setShowForm] = useState(false);
  const [exerciseType, setExerciseType] = useState('');
  const [intensity, setIntensity] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashData, exerciseData] = await Promise.all([
        api.getDashboard(),
        api.getExerciseTypes()
      ]);
      setDashboardData(dashData);
      setExerciseTypes(exerciseData.results || exerciseData);
      setError(null);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    if (!exerciseType || !intensity || !duration) return;

    setSubmitting(true);
    try {
      await api.createWorkout({
        exercise_type: exerciseType,
        intensity: intensity,
        duration_minutes: parseInt(duration)
      });
      
      // Reset form
      setExerciseType('');
      setIntensity('');
      setDuration('');
      setShowForm(false);
      
      // Reload data
      await loadData();
    } catch (error) {
      setError('Failed to add workout');
      console.error('Add workout error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    try {
      await api.deleteWorkout(workoutId);
      await loadData();
    } catch (error) {
      setError('Failed to delete workout');
      console.error('Delete workout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.first_name || user?.username}!</h2>
        <button className="btn btn-outline-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Workouts</h5>
              <h2 className="text-primary">{dashboardData?.total_workouts || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Role</h5>
              <h4 className="text-success">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Grade Level</h5>
              <h4 className="text-info">{user?.grade_level || 'N/A'}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Add Workout Button */}
      <div className="mb-4">
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Workout'}
        </button>
      </div>

      {/* Add Workout Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Add New Workout</h5>
            <form onSubmit={handleAddWorkout}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Exercise Type</label>
                  <select 
                    className="form-select"
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    required
                  >
                    <option value="">Select Exercise</option>
                    {exerciseTypes.map(exercise => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Intensity</label>
                  <select 
                    className="form-select"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                    required
                  >
                    <option value="">Select Intensity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    max="300"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Workout'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Recent Workouts</h5>
        </div>
        <div className="card-body">
          {!dashboardData?.recent_workouts?.length ? (
            <p className="text-muted">No workouts recorded yet. Add your first workout above!</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Intensity</th>
                    <th>Duration</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recent_workouts.map(workout => (
                    <tr key={workout.id}>
                      <td>{workout.exercise_type_name}</td>
                      <td>
                        <span className={`badge bg-${
                          workout.intensity === 'low' ? 'info' :
                          workout.intensity === 'medium' ? 'warning' :
                          workout.intensity === 'high' ? 'danger' : 'dark'
                        }`}>
                          {workout.intensity.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{workout.duration_minutes} min</td>
                      <td>{new Date(workout.date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}