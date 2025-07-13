import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { 
  ArrowBack, 
  Add as AddIcon, 
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon 
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useParams, useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestore';
import { Student, AnecdotalRecord } from '../types';
import LearningJourneyReport from './LearningJourneyReport';

interface EvidenceTypeData {
  id: number;
  value: number;
  label: string;
}

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AnecdotalRecord[]>([]);
  const [evidenceTypeData, setEvidenceTypeData] = useState<EvidenceTypeData[]>([]);
  const [valueTags, setValueTags] = useState<string[]>([]);
  const [selectedValueTag, setSelectedValueTag] = useState<string | null>(null);
  const [filteredRecords, setFilteredRecords] = useState<AnecdotalRecord[]>([]);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showLearningJourney, setShowLearningJourney] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedValueTag) {
      const filtered = records.filter(record => record.valueTag === selectedValueTag);
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords([]);
    }
  }, [selectedValueTag, records]);

  const loadStudentData = async () => {
    if (!studentId) return;

    try {
      const [studentData, recordsData] = await Promise.all([
        firestoreService.getStudent(studentId),
        firestoreService.getAnecdotalRecordsByStudent(studentId)
      ]);

      if (studentData) {
        setStudent(studentData);
        setRecords(recordsData);
        
        calculateEvidenceTypeData(recordsData);
        extractValueTags(recordsData);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const calculateEvidenceTypeData = (records: AnecdotalRecord[]) => {
    const anecdotalCount = records.filter(record => !record.fileUrl).length;
    const fileCount = records.filter(record => record.fileUrl).length;
    
    setEvidenceTypeData([
      { id: 0, value: anecdotalCount, label: 'Anecdotal Notes' },
      { id: 1, value: fileCount, label: 'File Uploads' }
    ]);
  };

  const extractValueTags = (records: AnecdotalRecord[]) => {
    const uniqueTags = [...new Set(records.map(record => record.valueTag))];
    setValueTags(uniqueTags);
  };

  const handleValueTagClick = (valueTag: string) => {
    setSelectedValueTag(selectedValueTag === valueTag ? null : valueTag);
  };

  const handleGenerateReport = async () => {
    const flaggedRecords = await firestoreService.getFlaggedRecordsByStudent(studentId!);
    setSelectedRecords(flaggedRecords.map(r => r.id));
    setOpenReportDialog(true);
  };

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return 'Unknown date';
  };

  if (!student) {
    return (
      <Box p={3}>
        <Typography variant="h5">Student not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          {student.fullName}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Evidence Type Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evidence Breakdown
              </Typography>
              {evidenceTypeData.some(d => d.value > 0) ? (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <PieChart
                    series={[
                      {
                        data: evidenceTypeData.filter(d => d.value > 0),
                        highlightScope: { faded: 'global', highlighted: 'item' },
                      }
                    ]}
                    width={400}
                    height={200}
                  />
                </Box>
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No evidence recorded yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Student Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Total Records:</strong> {records.length}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Skills Observed:</strong> {valueTags.length}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Flagged for Reports:</strong> {records.filter(r => r.isFlaggedForReport).length}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<DescriptionIcon />}
                  onClick={handleGenerateReport}
                  disabled={records.filter(r => r.isFlaggedForReport).length === 0}
                  fullWidth
                >
                  Generate Learning Journey
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Value Tags Navigation */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills & Values ({valueTags.length})
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Click on a skill to view detailed evidence
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {valueTags.map((tag) => {
                  const tagRecords = records.filter(r => r.valueTag === tag);
                  return (
                    <Chip
                      key={tag}
                      label={`${tag} (${tagRecords.length})`}
                      onClick={() => navigate(`/student/${studentId}/skill/${encodeURIComponent(tag)}`)}
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                      clickable
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Records for Selected Value Tag */}
        {selectedValueTag && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedValueTag} - Detailed Evidence ({filteredRecords.length})
                </Typography>
                
                {filteredRecords.length > 0 ? (
                  <List>
                    {filteredRecords.map((record, index) => (
                      <React.Fragment key={record.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1">
                                  {formatDate(record.createdAt)}
                                </Typography>
                                <Box>
                                  <Chip 
                                    label={record.assessmentType} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                  />
                                  {record.fileUrl && (
                                    <Chip 
                                      icon={<AttachFileIcon />} 
                                      label="File" 
                                      size="small" 
                                      color="primary"
                                      sx={{ mr: 1 }}
                                    />
                                  )}
                                  {record.isFlaggedForReport && (
                                    <Chip 
                                      label="Flagged" 
                                      size="small" 
                                      color="success"
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  {record.note}
                                </Typography>
                                {record.fileUrl && (
                                  <Button 
                                    size="small" 
                                    href={record.fileUrl} 
                                    target="_blank"
                                    sx={{ mt: 1 }}
                                  >
                                    View Attachment
                                  </Button>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < filteredRecords.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    No records found for {selectedValueTag}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Learning Journey Report Dialog */}
      <Dialog 
        open={openReportDialog} 
        onClose={() => setOpenReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Generate Learning Journey Report</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Select the records you want to include in the Learning Journey report for {student.fullName}:
          </Typography>
          
          <Paper sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {records.filter(r => r.isFlaggedForReport).map((record) => (
                <ListItem key={record.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => toggleRecordSelection(record.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          {record.valueTag} - {formatDate(record.createdAt)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {record.note.substring(0, 100)}...
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            disabled={selectedRecords.length === 0}
            onClick={() => {
              setOpenReportDialog(false);
              setShowLearningJourney(true);
            }}
          >
            Generate Report ({selectedRecords.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Learning Journey Report Generation */}
      {showLearningJourney && (
        <LearningJourneyReport
          studentName={student.fullName}
          selectedRecordIds={selectedRecords}
          onClose={() => setShowLearningJourney(false)}
        />
      )}
    </Box>
  );
};

export default StudentProfile;