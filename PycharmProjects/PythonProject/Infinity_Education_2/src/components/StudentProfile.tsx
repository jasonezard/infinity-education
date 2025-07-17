import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Flag,
  FileDownload,
  Add,
  Person,
  School,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { firestoreService } from '../services/firestore';
import { Student, AnecdotalRecord, StudentProgress, EDUCATIONAL_VALUES } from '../types';

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AnecdotalRecord[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AnecdotalRecord | null>(null);
  const [openRecordDialog, setOpenRecordDialog] = useState(false);

  const COLORS = ['#2E7D32', '#FF6B35', '#1976D2', '#F57C00', '#7B1FA2', '#C62828', '#00796B', '#5D4037', '#616161', '#E65100'];

  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id]);

  const loadStudentData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [studentData, recordsData, progressData] = await Promise.all([
        firestoreService.getStudent(id),
        firestoreService.getRecordsByStudent(id),
        firestoreService.getStudentProgress(id),
      ]);

      setStudent(studentData);
      setRecords(recordsData);
      setProgress(progressData);
    } catch (err) {
      setError('Failed to load student data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await firestoreService.deleteAnecdotalRecord(recordId);
      setRecords(records.filter(r => r.id !== recordId));
      setOpenRecordDialog(false);
    } catch (err) {
      setError('Failed to delete record');
      console.error(err);
    }
  };

  const handleToggleFlag = async (record: AnecdotalRecord) => {
    try {
      await firestoreService.updateAnecdotalRecord(record.id, {
        isFlaggedForReport: !record.isFlaggedForReport,
      });
      setRecords(records.map(r => 
        r.id === record.id ? { ...r, isFlaggedForReport: !r.isFlaggedForReport } : r
      ));
    } catch (err) {
      setError('Failed to update record');
      console.error(err);
    }
  };

  const handleAddRecord = () => {
    navigate(`/add-record?studentId=${id}`);
  };

  const handleExportReport = () => {
    // TODO: Implement PDF export functionality
    console.log('Export report for student:', student?.fullName);
  };

  const progressData = progress ? Object.entries(progress.valueScores).map(([key, value]) => ({
    name: key,
    value,
  })) : [];

  const timelineData = records.slice(0, 10).map((record, index) => ({
    date: new Date(record.createdAt.seconds * 1000).toLocaleDateString(),
    records: records.slice(0, index + 1).length,
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading student profile...</Typography>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Student not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {student.fullName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddRecord}
          sx={{ mr: 2 }}
        >
          Add Record
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleExportReport}
        >
          Export Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Student Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: 32,
                    bgcolor: 'primary.main',
                    mb: 2,
                  }}
                >
                  {student.fullName.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {student.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Student ID: {student.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enrolled: {new Date(student.enrolledAt.seconds * 1000).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Assignment sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="h6">{progress?.totalRecords || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Records
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Flag sx={{ fontSize: 30, color: 'error.main', mr: 1 }} />
                    <Box>
                      <Typography variant="h6">{progress?.flaggedRecords || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Flagged
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUp sx={{ fontSize: 30, color: 'success.main', mr: 1 }} />
                    <Box>
                      <Typography variant="h6">
                        {Object.values(progress?.valueScores || {}).reduce((a, b) => a + b, 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Points
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ fontSize: 30, color: 'warning.main', mr: 1 }} />
                    <Box>
                      <Typography variant="h6">
                        {progress?.lastUpdated ? 
                          new Date(progress.lastUpdated.seconds * 1000).toLocaleDateString() : 
                          'N/A'
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Progress Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Educational Values Progress
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2E7D32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Progress Timeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Progress Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="records" stroke="#2E7D32" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Records List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Anecdotal Records
            </Typography>
            <List>
              {records.map((record) => (
                <ListItem
                  key={record.id}
                  divider
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    setSelectedRecord(record);
                    setOpenRecordDialog(true);
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1">
                          {new Date(record.createdAt.seconds * 1000).toLocaleDateString()}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Chip
                            label={record.valueTag}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={record.assessmentType}
                            size="small"
                            color="secondary"
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
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {record.note.length > 200 ? 
                          `${record.note.substring(0, 200)}...` : 
                          record.note
                        }
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Record Details Dialog */}
      <Dialog
        open={openRecordDialog}
        onClose={() => setOpenRecordDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Record Details</Typography>
            <Box>
              <IconButton
                onClick={() => selectedRecord && handleToggleFlag(selectedRecord)}
                color={selectedRecord?.isFlaggedForReport ? 'error' : 'default'}
              >
                <Flag />
              </IconButton>
              <IconButton onClick={() => console.log('Edit record')}>
                <Edit />
              </IconButton>
              <IconButton
                onClick={() => selectedRecord && handleDeleteRecord(selectedRecord.id)}
                color="error"
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedRecord.createdAt.seconds * 1000).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Educational Value
                  </Typography>
                  <Chip label={selectedRecord.valueTag} color="primary" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Assessment Type
                  </Typography>
                  <Chip label={selectedRecord.assessmentType} color="secondary" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Flagged for Report
                  </Typography>
                  <Chip 
                    label={selectedRecord.isFlaggedForReport ? 'Yes' : 'No'} 
                    color={selectedRecord.isFlaggedForReport ? 'error' : 'default'}
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Observation
              </Typography>
              <Typography variant="body1">
                {selectedRecord.note}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecordDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfile;