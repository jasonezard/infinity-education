import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Edit as EditIcon,
  Share as ShareIcon 
} from '@mui/material/icons';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

interface LearningJourneyReportProps {
  studentName: string;
  selectedRecordIds: string[];
  onClose: () => void;
}

const LearningJourneyReport: React.FC<LearningJourneyReportProps> = ({
  studentName,
  selectedRecordIds,
  onClose
}) => {
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [editableReport, setEditableReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      const generateLearningJourney = httpsCallable(functions, 'generate_learning_journey');
      
      const result = await generateLearningJourney({
        record_ids: selectedRecordIds,
        student_name: studentName
      });

      const reportData = result.data as { success: boolean; report: string };
      
      if (reportData.success) {
        setGeneratedReport(reportData.report);
        setEditableReport(reportData.report);
        setReportGenerated(true);
      } else {
        setError('Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      
      // For MVP, provide a fallback local generation
      const fallbackReport = generateFallbackReport(studentName, selectedRecordIds.length);
      setGeneratedReport(fallbackReport);
      setEditableReport(fallbackReport);
      setReportGenerated(true);
      
      setError('Using offline report generation (OpenAI service unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackReport = (studentName: string, recordCount: number): string => {
    return `Learning Journey Report for ${studentName}

Dear Parents/Guardians,

It is my pleasure to share ${studentName}'s Learning Journey report, which reflects their growth and development based on ${recordCount} classroom observations.

Throughout this period, ${studentName} has demonstrated remarkable progress across multiple areas of learning. Our observations have captured meaningful moments that showcase their developing skills, character, and learning approaches.

Key Highlights:
• ${studentName} has shown consistent engagement in classroom activities
• They demonstrate positive social interactions with peers and teachers
• Their problem-solving abilities continue to develop
• They show curiosity and enthusiasm for learning

Areas of Growth:
${studentName} has made notable progress in various educational values and skills. They participate actively in class discussions and show willingness to take on challenges. Their collaborative spirit is evident in group work, and they demonstrate respect for others' ideas and contributions.

Looking Forward:
We encourage continued support for ${studentName}'s natural curiosity and learning enthusiasm. Providing opportunities for creative expression and problem-solving at home will further enhance their development.

${studentName} is a valued member of our classroom community, and it has been wonderful to witness their growth. Thank you for your continued partnership in their educational journey.

Warm regards,
[Teacher Name]

Note: This report was generated using our offline system. For a more detailed, AI-enhanced report, please ensure the OpenAI service is properly configured.`;
  };

  const handleSaveEdit = () => {
    setGeneratedReport(editableReport);
    setIsEditing(false);
  };

  const handleExportToDoc = () => {
    // Create a simple document export
    const docContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Learning Journey Report - ${studentName}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #1976d2; }
            .header { border-bottom: 2px solid #1976d2; padding-bottom: 10px; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Learning Journey Report</h1>
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">
            ${generatedReport.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
          <div class="footer">
            <p><em>Generated by Infinity Education Platform</em></p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([docContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Learning_Journey_${studentName}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        Learning Journey Report - {studentName}
      </DialogTitle>
      
      <DialogContent>
        {!reportGenerated ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              Generate Learning Journey Report
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              This will create a comprehensive report based on {selectedRecordIds.length} selected observations.
            </Typography>
            
            {error && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              variant="contained"
              size="large"
              onClick={generateReport}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </Box>
        ) : (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Generated Report</Typography>
              <Box>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(!isEditing)}
                  sx={{ mr: 1 }}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="contained"
                  onClick={handleExportToDoc}
                >
                  Export
                </Button>
              </Box>
            </Box>
            
            {error && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Paper elevation={1} sx={{ p: 3 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={editableReport}
                  onChange={(e) => setEditableReport(e.target.value)}
                  variant="outlined"
                />
              ) : (
                <Typography 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'inherit',
                    lineHeight: 1.6 
                  }}
                >
                  {generatedReport}
                </Typography>
              )}
            </Paper>
            
            {isEditing && (
              <Box mt={2} textAlign="right">
                <Button
                  variant="contained"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          {reportGenerated ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LearningJourneyReport;