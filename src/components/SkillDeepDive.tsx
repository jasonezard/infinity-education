import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  Divider,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import { 
  ArrowBack,
  PictureAsPdf as PdfIcon,
  AttachFile as AttachFileIcon 
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { firestoreService } from '../services/firestore';
import { Student, AnecdotalRecord } from '../types';

const SkillDeepDive: React.FC = () => {
  const { studentId, skill } = useParams<{ studentId: string; skill: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AnecdotalRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId && skill) {
      loadSkillData();
    }
  }, [studentId, skill]);

  const loadSkillData = async () => {
    if (!studentId || !skill) return;

    try {
      const [studentData, allRecords] = await Promise.all([
        firestoreService.getStudent(studentId),
        firestoreService.getAnecdotalRecordsByStudent(studentId)
      ]);

      if (studentData) {
        setStudent(studentData);
        const skillRecords = allRecords.filter(record => 
          record.valueTag === decodeURIComponent(skill)
        );
        setRecords(skillRecords);
      }
    } catch (error) {
      console.error('Error loading skill data:', error);
    }
  };

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const selectAllRecords = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(r => r.id));
    }
  };

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return 'Unknown date';
  };

  const generatePDF = async () => {
    if (selectedRecords.length === 0) return;
    
    setLoading(true);
    
    try {
      const selectedRecordData = records.filter(r => selectedRecords.includes(r.id));
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(25, 118, 210); // Primary blue color
      pdf.text('Infinity Education', margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Skill Progress Report: ${decodeURIComponent(skill!)}`, margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Student: ${student?.fullName}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Records: ${selectedRecords.length}`, margin, yPosition);
      yPosition += 15;
      
      // Add a line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      // Records
      selectedRecordData.forEach((record, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Record header
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Record ${index + 1} - ${formatDate(record.createdAt)}`, margin, yPosition);
        yPosition += 8;
        
        // Assessment type chip
        pdf.setFontSize(10);
        pdf.setTextColor(25, 118, 210);
        pdf.text(`[${record.assessmentType}]`, margin, yPosition);
        
        // File attachment indicator
        if (record.fileUrl) {
          pdf.setTextColor(76, 175, 80);
          pdf.text('[FILE ATTACHED]', margin + 40, yPosition);
        }
        yPosition += 10;
        
        // Record content
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        
        // Split long text into multiple lines
        const lines = pdf.splitTextToSize(record.note, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
        
        // Add separator line between records
        if (index < selectedRecordData.length - 1) {
          pdf.setDrawColor(230, 230, 230);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        }
      });
      
      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Generated by Infinity Education - Page ${i} of ${pageCount}`,
          margin,
          pageHeight - 10
        );
      }
      
      // Download the PDF
      const fileName = `${student?.fullName}_${decodeURIComponent(skill!)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!student || !skill) {
    return (
      <Box p={3}>
        <Typography variant="h5">Data not found</Typography>
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
        <Box>
          <Typography variant="h4">
            {decodeURIComponent(skill)} Progress
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {student.fullName} - {records.length} observations
          </Typography>
        </Box>
      </Box>

      {/* Export Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                Export Selection ({selectedRecords.length} selected)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Select observations to include in your informal update PDF
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                onClick={selectAllRecords}
                sx={{ mr: 2 }}
              >
                {selectedRecords.length === records.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={generatePDF}
                disabled={selectedRecords.length === 0 || loading}
              >
                {loading ? 'Generating...' : 'Export PDF'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Observations
          </Typography>
          
          {records.length > 0 ? (
            <List>
              {records.map((record, index) => (
                <React.Fragment key={record.id}>
                  <ListItem alignItems="flex-start">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onChange={() => toggleRecordSelection(record.id)}
                        />
                      }
                      label=""
                      sx={{ mr: 2 }}
                    />
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
                  {index < records.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              No observations recorded for {decodeURIComponent(skill)} yet.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SkillDeepDive;