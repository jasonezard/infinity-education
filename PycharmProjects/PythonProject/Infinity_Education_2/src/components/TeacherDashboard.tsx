import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  Add,
  Person,
  School,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { firestoreService } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Student, Class, AnecdotalRecord, DashboardStats } from '../types';

const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [recentRecords, setRecentRecords] = useState<AnecdotalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const COLORS = ['#2E7D32', '#FF6B35', '#1976D2', '#F57C00', '#7B1FA2', '#C62828', '#00796B', '#5D4037', '#616161', '#E65100'];

  useEffect(() => {
    if (user) {
      loadTeacherData();
    }
  }, [user]);

  const loadTeacherData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [dashboardStats, teacherClasses, teacherRecords] = await Promise.all([
        firestoreService.getDashboardStats(),
        firestoreService.getClassesByTeacher(user.id),
        firestoreService.getRecordsByAuthor(user.id),
      ]);

      setStats(dashboardStats);
      setClasses(teacherClasses);
      setRecentRecords(teacherRecords.slice(0, 5));

      // Load students from teacher's classes
      const studentsPromises = teacherClasses.map(classItem => 
        firestoreService.getStudentsByClass(classItem.id)
      );
      const studentsResults = await Promise.all(studentsPromises);
      const allStudents = studentsResults.flat();
      setStudents(allStudents);
    } catch (err) {
      setError('Failed to load teacher data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    navigate('/add-record');
  };

  const handleViewStudent = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  const valueDistributionData = stats ? Object.entries(stats.valueDistribution).map(([key, value]) => ({
    name: key,
    value,
  })) : [];

  const classData = classes.map(classItem => ({
    name: classItem.name,
    students: students.filter(s => s.classId === classItem.id).length,
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Teacher Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddRecord}
        >
          Add Record
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{students.length}</Typography>
                  <Typography color="text.secondary">My Students</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <School sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{classes.length}</Typography>
                  <Typography color="text.secondary">My Classes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{recentRecords.length}</Typography>
                  <Typography color="text.secondary">Recent Records</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {recentRecords.filter(r => r.isFlaggedForReport).length}
                  </Typography>
                  <Typography color="text.secondary">Flagged Records</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Educational Values Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={valueDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {valueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Students by Class
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#2E7D32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Records */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Records
            </Typography>
            <List>
              {recentRecords.map((record) => {
                const student = students.find(s => s.id === record.studentId);
                return (
                  <ListItem key={record.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {student?.fullName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student?.fullName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {record.note.substring(0, 100)}...
                          </Typography>
                          <Box display="flex" alignItems="center" mt={1}>
                            <Chip
                              label={record.valueTag}
                              size="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            {record.isFlaggedForReport && (
                              <Chip
                                label="Flagged"
                                size="small"
                                color="error"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Students List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Students
            </Typography>
            <List>
              {students.slice(0, 10).map((student) => {
                const classItem = classes.find(c => c.id === student.classId);
                return (
                  <ListItem
                    key={student.id}
                    divider
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => handleViewStudent(student.id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {student.fullName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.fullName}
                      secondary={classItem?.name || 'Unknown Class'}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add record"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleAddRecord}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default TeacherDashboard;