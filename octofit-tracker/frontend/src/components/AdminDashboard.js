import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Logout as LogoutIcon,
  Archive as ArchiveIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { admin } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        admin.getStats(),
        admin.getStudents()
      ]);
      
      setStats(statsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleArchiveUser = async (userId) => {
    try {
      await admin.archiveUser(userId);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error archiving user:', error);
    }
  };

  const exerciseChartData = {
    labels: stats?.popular_exercises?.map(e => e.exercise_type__name) || [],
    datasets: [
      {
        label: 'Number of Workouts',
        data: stats?.popular_exercises?.map(e => e.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const gradeChartData = {
    labels: stats?.grade_stats?.map(g => g.grade_level || 'No Grade') || [],
    datasets: [
      {
        label: 'Number of Students',
        data: stats?.grade_stats?.map(g => g.count) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Mergington High School Fitness Tracker
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user?.first_name || user?.username}
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
                  Total Students
                </Typography>
                <Typography variant="h4">
                  {stats?.total_students || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
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
                  Total Minutes Exercised
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
                  Average per Student
                </Typography>
                <Typography variant="h4">
                  {stats?.total_students > 0 ? Math.round(stats?.total_minutes / stats?.total_students) : 0}
                  <Typography variant="caption" display="block">
                    minutes
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Popular Exercises
              </Typography>
              {stats?.popular_exercises && (
                <Bar 
                  data={exerciseChartData} 
                  options={{ 
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Students by Grade Level
              </Typography>
              {stats?.grade_stats && (
                <Bar 
                  data={gradeChartData} 
                  options={{ 
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              )}
            </Paper>
          </Grid>

          {/* Student List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Student Management
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Total Workouts</TableCell>
                      <TableCell>Total Minutes</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.grade_level || 'N/A'}</TableCell>
                        <TableCell>{student.academic_year}</TableCell>
                        <TableCell>{student.stats?.total_workouts || 0}</TableCell>
                        <TableCell>{student.stats?.total_minutes || 0}</TableCell>
                        <TableCell>
                          <Chip 
                            label={student.is_archived ? 'Archived' : 'Active'}
                            color={student.is_archived ? 'default' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {!student.is_archived && (
                            <Button
                              size="small"
                              startIcon={<ArchiveIcon />}
                              onClick={() => handleArchiveUser(student.id)}
                              color="warning"
                            >
                              Archive
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AdminDashboard;