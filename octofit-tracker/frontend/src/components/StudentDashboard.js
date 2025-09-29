import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessCenterIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { workouts, exercises, dashboard } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [workoutList, setWorkoutList] = useState([]);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    exercise_type: '',
    intensity: '',
    duration_minutes: '',
    date_completed: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, workoutsRes, exercisesRes] = await Promise.all([
        dashboard.getStats(),
        workouts.getAll(),
        exercises.getAll()
      ]);
      
      setStats(statsRes.data);
      setWorkoutList(workoutsRes.data);
      setExerciseTypes(exercisesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddWorkout = async () => {
    try {
      await workouts.create(newWorkout);
      setOpenDialog(false);
      setNewWorkout({
        exercise_type: '',
        intensity: '',
        duration_minutes: '',
        date_completed: new Date().toISOString().slice(0, 16),
        notes: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await workouts.delete(id);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const chartData = {
    labels: stats?.weekly_data?.map(d => new Date(d.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Daily Workouts',
        data: stats?.weekly_data?.map(d => d.workouts) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fitness Tracker - Welcome {user?.first_name || user?.username}
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Workouts
                </Typography>
                <Typography variant="h4">
                  {stats?.total_workouts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Minutes
                </Typography>
                <Typography variant="h4">
                  {stats?.total_minutes || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Recent Workouts (7 days)
                </Typography>
                <Typography variant="h4">
                  {stats?.recent_workouts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Favorite Exercise
                </Typography>
                <Typography variant="h6">
                  {stats?.favorite_exercise || 'None yet'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Weekly Progress
              </Typography>
              {stats?.weekly_data && (
                <Line data={chartData} options={{ responsive: true }} />
              )}
            </Paper>
          </Grid>

          {/* Add Workout Button */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                fullWidth
                sx={{ mb: 2 }}
              >
                Log New Workout
              </Button>
              <Typography variant="body2" color="textSecondary" align="center">
                Track your fitness progress by logging your workouts
              </Typography>
            </Paper>
          </Grid>

          {/* Recent Workouts */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Workouts
              </Typography>
              <List>
                {workoutList.slice(0, 5).map((workout) => (
                  <ListItem key={workout.id}>
                    <ListItemText
                      primary={`${workout.exercise_type_name} - ${workout.intensity} intensity`}
                      secondary={`${workout.duration_minutes} minutes on ${new Date(workout.date_completed).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleDeleteWorkout(workout.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Add Workout Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Log New Workout</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Exercise Type</InputLabel>
                <Select
                  value={newWorkout.exercise_type}
                  onChange={(e) => setNewWorkout({ ...newWorkout, exercise_type: e.target.value })}
                >
                  {exerciseTypes.map((exercise) => (
                    <MenuItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Intensity</InputLabel>
                <Select
                  value={newWorkout.intensity}
                  onChange={(e) => setNewWorkout({ ...newWorkout, intensity: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="very_high">Very High</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={newWorkout.duration_minutes}
                onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: e.target.value })}
              />

              <TextField
                fullWidth
                label="Date & Time"
                type="datetime-local"
                value={newWorkout.date_completed}
                onChange={(e) => setNewWorkout({ ...newWorkout, date_completed: e.target.value })}
              />

              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={3}
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddWorkout} 
              variant="contained"
              disabled={!newWorkout.exercise_type || !newWorkout.intensity || !newWorkout.duration_minutes}
            >
              Log Workout
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default StudentDashboard;