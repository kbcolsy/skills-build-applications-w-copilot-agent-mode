// API service for communicating with Django backend
class ApiService {
  constructor() {
    // Dynamic API base URL detection for Codespace environment
    const codespace = process.env.REACT_APP_CODESPACE_NAME || window.location.hostname.match(/^(\w+-\w+-\w+)-\d+\.app\.github\.dev$/)?.[1];
    if (codespace) {
      this.baseURL = `https://${codespace}-8000.app.github.dev/api`;
    } else {
      this.baseURL = 'http://localhost:8000/api';
    }
  }

  async makeRequest(url, options = {}) {
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(username, password) {
    return this.makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout/', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.makeRequest('/profile/');
  }

  // Dashboard and fitness data
  async getDashboard() {
    return this.makeRequest('/dashboard/');
  }

  async getExerciseTypes() {
    return this.makeRequest('/exercises/');
  }

  async getWorkouts() {
    return this.makeRequest('/workouts/');
  }

  async createWorkout(workoutData) {
    return this.makeRequest('/workouts/', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  }

  async deleteWorkout(id) {
    return this.makeRequest(`/workouts/${id}/`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();