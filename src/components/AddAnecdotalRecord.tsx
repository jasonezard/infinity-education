import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestore';
import { Student, Class } from '../types';

const VALUE_TAGS = [
  'Collaboration',
  'Leadership',
  'Problem Solving',
  'Communication',
  'Creativity',
  'Critical Thinking',
  'Independence',
  'Responsibility',
  'Empathy',
  'Perseverance'
];

const AddAnecdotalRecord: React.FC = () => {
  const { userProfile } = useAuth();
  const [myClass, setMyClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    note: '',
    valueTag: '',
    assessmentType: 'FORMATIVE' as 'FORMATIVE' | 'SUMMATIVE',
    isFlaggedForReport: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openStudentDialog, setOpenStudentDialog] = useState(false);

  useEffect(() => {
    if (userProfile) {
      loadTeacherData();
    }
  }, [userProfile]);

  const loadTeacherData = async () => {
    if (!userProfile) return;

    try {
      const classes = await firestoreService.getClassesByTeacher(userProfile.id);
      
      if (classes.length > 0) {
        const classData = classes[0];
        setMyClass(classData);
        
        const studentsData = await firestoreService.getStudentsByClass(classData.id);
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
      setError('Failed to load class data');
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    if (!formData.note.trim()) {
      setError('Please enter an observation note');
      return;
    }

    if (!formData.valueTag) {
      setError('Please select a value tag');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let fileUrl = '';
      
      // If there's a file, you would upload it to Firebase Storage here
      // For MVP, we'll just simulate the upload
      if (file) {
        // TODO: Implement file upload to Firebase Storage
        fileUrl = `placeholder-url-for-${file.name}`;
      }

      const recordData = {
        authorId: userProfile!.id,
        note: formData.note,
        valueTag: formData.valueTag,
        assessmentType: formData.assessmentType,
        isFlaggedForReport: formData.isFlaggedForReport,
        ...(fileUrl && { fileUrl })
      };

      await firestoreService.createMultipleAnecdotalRecords(selectedStudents, recordData);
      
      setSuccess(true);
      setFormData({
        note: '',
        valueTag: '',
        assessmentType: 'FORMATIVE',
        isFlaggedForReport: false
      });
      setSelectedStudents([]);
      setFile(null);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating anecdotal records:', error);
      setError('Failed to save anecdotal records');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedStudentNames = () => {
    return students
      .filter(s => selectedStudents.includes(s.id))
      .map(s => s.fullName);
  };

  if (!myClass) {
    return (
      <Box p={3}>
        <Typography variant="h5">No class assigned</Typography>
        <Typography color="textSecondary">
          Please contact your administrator to assign you to a class.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Add Anecdotal Record
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Record observations for multiple students at once
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Anecdotal records created successfully for {selectedStudents.length} student(s)!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Student Selection */}
              <Grid item xs={12}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Select Students ({selectedStudents.length} selected)
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setOpenStudentDialog(true)}
                    >
                      Choose Students
                    </Button>
                  </Box>
                  
                  <Box>
                    {selectedStudents.length > 0 ? (
                      <Box>
                        {getSelectedStudentNames().map((name) => (
                          <Chip
                            key={name}
                            label={name}
                            sx={{ mr: 1, mb: 1 }}
                            onDelete={() => {
                              const student = students.find(s => s.fullName === name);
                              if (student) handleStudentToggle(student.id);
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography color="textSecondary">
                        No students selected
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Observation Note */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observation Note"
                  multiline
                  rows={4}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Describe what you observed..."
                  required
                />
              </Grid>

              {/* Value Tag */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Educational Value</InputLabel>
                  <Select
                    value={formData.valueTag}
                    onChange={(e) => setFormData({ ...formData, valueTag: e.target.value })}
                  >
                    {VALUE_TAGS.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Assessment Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Assessment Type</InputLabel>
                  <Select
                    value={formData.assessmentType}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      assessmentType: e.target.value as 'FORMATIVE' | 'SUMMATIVE' 
                    })}
                  >
                    <MenuItem value="FORMATIVE">Formative</MenuItem>
                    <MenuItem value="SUMMATIVE">Summative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* File Upload */}
              <Grid item xs={12}>
                <Box>
                  <input
                    accept="image/*,application/pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mr: 2 }}
                    >
                      Attach File
                    </Button>
                  </label>
                  {file && (
                    <Chip
                      label={file.name}
                      onDelete={() => setFile(null)}
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Supported formats: Images, PDF, Word documents. Max size: 10MB
                </Typography>
              </Grid>

              {/* Flag for Report */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isFlaggedForReport}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        isFlaggedForReport: e.target.checked 
                      })}
                    />
                  }
                  label="Flag for Learning Journey report"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Flagged records will be available for formal report generation
                </Typography>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || selectedStudents.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  fullWidth
                >
                  {loading 
                    ? 'Saving...' 
                    : `Create Record for ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
                  }
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Student Selection Dialog */}
      <Dialog 
        open={openStudentDialog} 
        onClose={() => setOpenStudentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Select Students ({selectedStudents.length}/{students.length})
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Button
              variant="outlined"
              onClick={handleSelectAllStudents}
              fullWidth
            >
              {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
            </Button>
          </Box>
          
          <List>
            {students.map((student) => (
              <ListItem key={student.id} button onClick={() => handleStudentToggle(student.id)}>
                <ListItemIcon>
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                  />
                </ListItemIcon>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={student.fullName} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudentDialog(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddAnecdotalRecord;