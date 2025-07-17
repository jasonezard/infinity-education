import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Upload,
  Delete,
  Person,
  Save,
  Clear,
} from '@mui/icons-material';
import { firestoreService } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Student, Class, EducationalValue, EDUCATIONAL_VALUES } from '../types';

const AddAnecdotalRecord: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [valueTag, setValueTag] = useState<EducationalValue>('Communication');
  const [assessmentType, setAssessmentType] = useState<'FORMATIVE' | 'SUMMATIVE'>('FORMATIVE');
  const [isFlaggedForReport, setIsFlaggedForReport] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
    
    // Pre-select student if provided in URL
    const studentId = searchParams.get('studentId');
    if (studentId) {
      setSelectedStudents([studentId]);
    }
  }, [searchParams]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [studentsData, classesData] = await Promise.all([
        user.role === 'ADMIN' ? 
          firestoreService.getAllStudents() : 
          loadTeacherStudents(),
        user.role === 'ADMIN' ? 
          firestoreService.getAllClasses() : 
          firestoreService.getClassesByTeacher(user.id),
      ]);

      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
  };

  const loadTeacherStudents = async () => {
    if (!user) return [];
    
    const teacherClasses = await firestoreService.getClassesByTeacher(user.id);
    const studentsPromises = teacherClasses.map(classItem => 
      firestoreService.getStudentsByClass(classItem.id)
    );
    const studentsResults = await Promise.all(studentsPromises);
    return studentsResults.flat();
  };

  const handleStudentChange = (event: any) => {
    const value = event.target.value;
    setSelectedStudents(typeof value === 'string' ? value.split(',') : value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) return;
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }
    if (!note.trim()) {
      setError('Please enter an observation note');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let fileUrl = '';
      
      // Upload file if selected
      if (selectedFile) {
        const filePath = `records/${Date.now()}-${selectedFile.name}`;
        fileUrl = await firestoreService.uploadFile(selectedFile, filePath);
      }

      // Create records for all selected students
      const recordsData = selectedStudents.map(studentId => ({
        studentId,
        authorId: user.id,
        note: note.trim(),
        valueTag,
        assessmentType,
        isFlaggedForReport,
        ...(fileUrl && { fileUrl }),
      }));

      if (recordsData.length === 1) {
        await firestoreService.createAnecdotalRecord(recordsData[0]);
      } else {
        await firestoreService.createMultipleAnecdotalRecords(recordsData);
      }

      setSuccess(`Successfully created ${recordsData.length} record(s)`);
      
      // Reset form
      setSelectedStudents([]);
      setNote('');
      setValueTag('Communication');
      setAssessmentType('FORMATIVE');
      setIsFlaggedForReport(false);
      setSelectedFile(null);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      setError('Failed to create record(s)');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedStudents([]);
    setNote('');
    setValueTag('Communication');
    setAssessmentType('FORMATIVE');
    setIsFlaggedForReport(false);
    setSelectedFile(null);
    setError('');
    setSuccess('');
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.fullName : 'Unknown Student';
  };

  const getStudentClass = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 'Unknown Class';
    const classItem = classes.find(c => c.id === student.classId);
    return classItem ? classItem.name : 'Unknown Class';
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Add Anecdotal Record
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Student Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Students</InputLabel>
                    <Select
                      multiple
                      value={selectedStudents}
                      onChange={handleStudentChange}
                      input={<OutlinedInput label="Select Students" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={getStudentName(value)}
                              size="small"
                              icon={<Person />}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {students.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          <Box>
                            <Typography variant="body1">{student.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getStudentClass(student.id)}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Observation Note */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observation Note"
                    multiline
                    rows={6}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter your detailed observation about the student's learning and behavior..."
                    required
                  />
                </Grid>

                {/* Educational Value */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Educational Value</InputLabel>
                    <Select
                      value={valueTag}
                      onChange={(e) => setValueTag(e.target.value as EducationalValue)}
                      label="Educational Value"
                    >
                      {EDUCATIONAL_VALUES.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
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
                      value={assessmentType}
                      onChange={(e) => setAssessmentType(e.target.value as 'FORMATIVE' | 'SUMMATIVE')}
                      label="Assessment Type"
                    >
                      <MenuItem value="FORMATIVE">Formative</MenuItem>
                      <MenuItem value="SUMMATIVE">Summative</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Flag for Report */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFlaggedForReport}
                        onChange={(e) => setIsFlaggedForReport(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Flag this record for formal reporting"
                  />
                </Grid>

                {/* File Upload */}
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Attach Evidence (Optional)
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<Upload />}
                      >
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={handleFileChange}
                        />
                      </Button>
                      {selectedFile && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {selectedFile.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedFile(null)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Actions */}
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      startIcon={<Clear />}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      Save Record{selectedStudents.length > 1 ? 's' : ''}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            
            {selectedStudents.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Selected Students ({selectedStudents.length})
                  </Typography>
                  {selectedStudents.map((studentId) => (
                    <Typography key={studentId} variant="body2">
                      • {getStudentName(studentId)}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            )}

            {note && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Observation Note
                  </Typography>
                  <Typography variant="body2">
                    {note.substring(0, 100)}
                    {note.length > 100 && '...'}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Educational Value
                </Typography>
                <Chip label={valueTag} color="primary" size="small" />
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Assessment Type
                </Typography>
                <Chip label={assessmentType} color="secondary" size="small" />
              </CardContent>
            </Card>

            {isFlaggedForReport && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label="Flagged for Report" color="error" size="small" />
                </CardContent>
              </Card>
            )}

            {selectedFile && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Attached File
                  </Typography>
                  <Typography variant="body2">
                    {selectedFile.name}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddAnecdotalRecord;