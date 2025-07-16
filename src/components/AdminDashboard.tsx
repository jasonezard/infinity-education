import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { firestoreService } from '../services/firestore';
import { Class, User, Student, ClassWithDetails } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminDashboard: React.FC = () => {
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [classForm, setClassForm] = useState({ name: '', teacherId: '' });
  const [studentForm, setStudentForm] = useState({ fullName: '', classId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesData, teachersData, studentsData] = await Promise.all([
        firestoreService.getAllClasses(),
        firestoreService.getAllTeachers(),
        getDocs(collection(db, 'students')).then(snapshot => 
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student))
        )
      ]);

      const classesWithDetails: ClassWithDetails[] = await Promise.all(
        classesData.map(async (classItem) => {
          const teacher = teachersData.find(t => t.id === classItem.teacherId);
          const classStudents = studentsData.filter(s => s.classId === classItem.id);
          
          return {
            ...classItem,
            teacherName: teacher?.name || 'Unknown',
            studentCount: classStudents.length
          };
        })
      );

      setClasses(classesWithDetails);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateClass = async () => {
    try {
      await firestoreService.createClass(classForm);
      setOpenClassDialog(false);
      setClassForm({ name: '', teacherId: '' });
      loadData();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClass) return;
    
    try {
      await firestoreService.updateClass(editingClass.id, classForm);
      setOpenClassDialog(false);
      setEditingClass(null);
      setClassForm({ name: '', teacherId: '' });
      loadData();
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await firestoreService.deleteClass(classId);
        loadData();
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const handleCreateStudent = async () => {
    try {
      await firestoreService.createStudent(studentForm);
      setOpenStudentDialog(false);
      setStudentForm({ fullName: '', classId: '' });
      loadData();
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    
    try {
      await firestoreService.updateStudent(editingStudent.id, studentForm);
      setOpenStudentDialog(false);
      setEditingStudent(null);
      setStudentForm({ fullName: '', classId: '' });
      loadData();
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await firestoreService.deleteStudent(studentId);
        loadData();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const openClassForm = (classItem?: Class) => {
    if (classItem) {
      setEditingClass(classItem);
      setClassForm({ name: classItem.name, teacherId: classItem.teacherId });
    } else {
      setEditingClass(null);
      setClassForm({ name: '', teacherId: '' });
    }
    setOpenClassDialog(true);
  };

  const openStudentForm = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setStudentForm({ fullName: student.fullName, classId: student.classId });
    } else {
      setEditingStudent(null);
      setStudentForm({ fullName: '', classId: '' });
    }
    setOpenStudentDialog(true);
  };

  return (
    <Box p={3}>
      {/* Header Section with Educational Design */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
          border: '1px solid rgba(46, 125, 50, 0.1)'
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <img 
            src="/images/admin-icon.svg" 
            alt="Admin Dashboard" 
            style={{ width: 60, height: 60, marginRight: 16 }}
          />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your educational institution with comprehensive oversight
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" sx={{ 
              p: 2, 
              bgcolor: 'white', 
              borderRadius: 2, 
              boxShadow: 1 
            }}>
              <SchoolIcon sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h6">{classes.length}</Typography>
                <Typography variant="body2" color="text.secondary">Classes</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" sx={{ 
              p: 2, 
              bgcolor: 'white', 
              borderRadius: 2, 
              boxShadow: 1 
            }}>
              <GroupIcon sx={{ color: 'secondary.main', mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h6">{students.length}</Typography>
                <Typography variant="body2" color="text.secondary">Students</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" sx={{ 
              p: 2, 
              bgcolor: 'white', 
              borderRadius: 2, 
              boxShadow: 1 
            }}>
              <PersonIcon sx={{ color: 'info.main', mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h6">{teachers.length}</Typography>
                <Typography variant="body2" color="text.secondary">Teachers</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Classes Overview */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <SchoolIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Classes Overview</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openClassForm()}
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1B5E20 30%, #4CAF50 90%)',
                }
              }}
            >
              Add Class
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {classes.map((classItem) => (
              <Grid item xs={12} md={6} lg={4} key={classItem.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    border: '1px solid rgba(46, 125, 50, 0.2)',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(46, 125, 50, 0.15)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <img 
                        src="/images/teacher-icon.svg" 
                        alt="Class" 
                        style={{ width: 32, height: 32, marginRight: 8 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {classItem.name}
                      </Typography>
                    </Box>
                    <Typography color="textSecondary" sx={{ mb: 1 }}>
                      👨‍🏫 Teacher: {classItem.teacherName}
                    </Typography>
                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                      👥 Students: {classItem.studentCount}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => openClassForm(classItem)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClass(classItem.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Students Management */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <GroupIcon sx={{ color: 'secondary.main', mr: 2, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Students</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openStudentForm()}
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(45deg, #FF6B35 30%, #FF8A65 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #E64A19 30%, #FF7043 90%)',
                }
              }}
            >
              Add Student
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Box display="flex" alignItems="center">
                      <img 
                        src="/images/student-icon.svg" 
                        alt="Student" 
                        style={{ width: 20, height: 20, marginRight: 8 }}
                      />
                      Name
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => {
                  const studentClass = classes.find(c => c.id === student.classId);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{studentClass?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openStudentForm(student)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Class Dialog */}
      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)}>
        <DialogTitle>{editingClass ? 'Edit Class' : 'Create Class'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Class Name"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Teacher</InputLabel>
            <Select
              value={classForm.teacherId}
              onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClassDialog(false)}>Cancel</Button>
          <Button
            onClick={editingClass ? handleUpdateClass : handleCreateClass}
            variant="contained"
          >
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Dialog */}
      <Dialog open={openStudentDialog} onClose={() => setOpenStudentDialog(false)}>
        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={studentForm.fullName}
            onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Class</InputLabel>
            <Select
              value={studentForm.classId}
              onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudentDialog(false)}>Cancel</Button>
          <Button
            onClick={editingStudent ? handleUpdateStudent : handleCreateStudent}
            variant="contained"
          >
            {editingStudent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;