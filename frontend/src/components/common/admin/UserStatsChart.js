import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';

const UserStatsChart = ({ data }) => {
  const theme = useTheme();

  const chartData = [
    { name: 'Users', Students: data.students, Faculty: data.faculty },
  ];

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        User Statistics
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Students" fill={theme.palette.primary.main} />
          <Bar dataKey="Faculty" fill={theme.palette.secondary.main} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default UserStatsChart;
