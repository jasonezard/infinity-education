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
  IconButton,
  Fab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Classes Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Classes Overview</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openClassForm()}
            >
              Add Class
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {classes.map((classItem) => (
              <Grid item xs={12} md={6} lg={4} key={classItem.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{classItem.name}</Typography>
                    <Typography color="textSecondary">
                      Teacher: {classItem.teacherName}
                    </Typography>
                    <Typography color="textSecondary">
                      Students: {classItem.studentCount}
                    </Typography>
                    <Box mt={2}>
                      <IconButton
                        size="small"
                        onClick={() => openClassForm(classItem)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClass(classItem.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Students Management */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Students</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openStudentForm()}
            >
              Add Student
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Actions</TableCell>
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