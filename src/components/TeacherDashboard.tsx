import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Divider
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestore';
import { Class, Student, AnecdotalRecord } from '../types';
import { useNavigate } from 'react-router-dom';

interface ValueTagData {
  valueTag: string;
  count: number;
}

const TeacherDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [myClass, setMyClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [allRecords, setAllRecords] = useState<AnecdotalRecord[]>([]);
  const [valueTagData, setValueTagData] = useState<ValueTagData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
        
        if (studentsData.length > 0) {
          const studentIds = studentsData.map(s => s.id);
          const records = await firestoreService.getAnecdotalRecordsByClass(studentIds);
          setAllRecords(records);
          
          calculateValueTagData(records);
        }
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    }
  };

  const calculateValueTagData = (records: AnecdotalRecord[]) => {
    const valueTagCounts: { [key: string]: number } = {};
    
    records.forEach(record => {
      valueTagCounts[record.valueTag] = (valueTagCounts[record.valueTag] || 0) + 1;
    });
    
    const data = Object.entries(valueTagCounts).map(([valueTag, count]) => ({
      valueTag,
      count
    }));
    
    setValueTagData(data);
  };

  const getStudentRecordCount = (studentId: string) => {
    return allRecords.filter(record => record.studentId === studentId).length;
  };

  const getStudentValueTags = (studentId: string) => {
    const studentRecords = allRecords.filter(record => record.studentId === studentId);
    const valueTags = [...new Set(studentRecords.map(record => record.valueTag))];
    return valueTags;
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
        {myClass.name} - Teacher Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Class Evidence Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evidence Volume by Skill
              </Typography>
              {valueTagData.length > 0 ? (
                <Box sx={{ width: '100%', height: 400 }}>
                  <BarChart
                    dataset={valueTagData}
                    xAxis={[{ 
                      scaleType: 'band', 
                      dataKey: 'valueTag',
                      tickLabelStyle: {
                        angle: -45,
                        textAnchor: 'end'
                      }
                    }]}
                    series={[{ 
                      dataKey: 'count', 
                      label: 'Number of Records',
                      color: '#1976d2'
                    }]}
                    margin={{ left: 40, right: 40, top: 40, bottom: 80 }}
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

        {/* Student Roster */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Roster ({students.length})
              </Typography>
              <List>
                {students.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => navigate(`/student/${student.id}`)}
                      >
                        <ListItemText
                          primary={student.fullName}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {getStudentRecordCount(student.id)} records
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {getStudentValueTags(student.id).slice(0, 3).map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                                {getStudentValueTags(student.id).length > 3 && (
                                  <Chip
                                    label={`+${getStudentValueTags(student.id).length - 3}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < students.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Student Details */}
        {selectedStudent && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedStudent.fullName} - Quick Overview
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Total Records: {getStudentRecordCount(selectedStudent.id)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Skills Observed:
                    </Typography>
                    <Box>
                      {getStudentValueTags(selectedStudent.id).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Click on a student's name to view their detailed profile and add new observations.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;