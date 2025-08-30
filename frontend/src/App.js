import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import SubjectManagment from './components/common/admin/SubjectManagment';
import UserManagment from './components/common/admin/UserManagment';
import MasterCalendar from './components/common/admin/MasterCalendar';
import FacultyAssignmentRequests from './components/common/admin/FacultyAssignmentRequests';
import CreateAnnouncement from './pages/CreateAnnouncement';
import FacultyDashboard from './pages/FacultyDashBoard';
import StudentDashboard from './pages/StudentDashBoard';
import PrivateRoute from './components/common/PrivateRoutes';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import AIChat from './components/student/AIChat';
import AssignmentSolver from './components/student/AssignmentSolver';
import Layout from './components/common/Layout'; 
import TaskManager from './pages/TaskManager';
import MySchedule from './pages/MySchedule';
import LectureSchedulePage from './pages/LectureSchedulePage';
import AssignmentPostPage from './pages/AssignmentPostPage';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // BOLD & VIBRANT light mode from image
          primary: { main: '#2196f3' }, // Blue
          secondary: { main: '#4caf50' }, // Green
          error: { main: '#f44336' }, // Red
          warning: { main: '#ff9800' }, // Orange
          info: { main: '#ff9800' }, // Orange
          success: { main: '#4caf50' }, // Green
          background: { default: '#f0f2f5', paper: '#ffffff' },
          text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.6)' },
        }
      : {
          // HIGH CONTRAST dark mode
          primary: { main: '#bb86fc' }, // Light Purple
          secondary: { main: '#03dac6' }, // Teal
          error: { main: '#cf6679' },
          warning: { main: '#f39c12' },
          info: { main: '#3498db' },
          success: { main: '#2ecc71' },
          background: { default: '#121212', paper: '#1e1e1e' },
          text: { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
        }),
  },
  typography: {
    fontFamily: '"Public Sans", sans-serif',
    fontWeightBold: 900,
    fontWeightMedium: 800,
    fontWeightRegular: 700,
    fontSize: 18, // Increase base font size
    h1: { fontWeight: 900, fontSize: '2.8rem' },
    h2: { fontWeight: 900, fontSize: '2.2rem' },
    h3: { fontWeight: 900, fontSize: '1.8rem' },
    h4: { fontWeight: 900, fontSize: '1.5rem' },
    h5: { fontWeight: 900, fontSize: '1.2rem' },
    h6: { fontWeight: 900, fontSize: '1.1rem' },
    body1: { fontWeight: 700, fontSize: '1.1rem' },
    body2: { fontWeight: 700, fontSize: '1rem' },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    caption: { fontWeight: 700 },
    button: { fontWeight: 900 },
    overline: { fontWeight: 900 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', boxShadow: 'none', borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
  },
});


function App() {
  const [mode, setMode] = React.useState('light');
  const location = useLocation();

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };


  React.useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route path="/admin" element={ <PrivateRoute roles={['Admin']}><AdminDashboard toggleTheme={toggleTheme} /></PrivateRoute> } />
                <Route path="/admin/subjects" element={
                  <PrivateRoute roles={['Admin']}>
                    <Layout toggleTheme={toggleTheme}>
                      <SubjectManagment />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/admin/users" element={
                  <PrivateRoute roles={['Admin']}>
                    <Layout toggleTheme={toggleTheme}>
                      <UserManagment />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/admin/calendar" element={
                  <PrivateRoute roles={['Admin']}>
                    <Layout toggleTheme={toggleTheme}>
                      <MasterCalendar />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/admin/faculty-requests" element={
                  <PrivateRoute roles={['Admin']}>
                    <Layout toggleTheme={toggleTheme}>
                      <FacultyAssignmentRequests />
                    </Layout>
                  </PrivateRoute>
                } />
                <Route path="/admin/announcement" element={
                  <PrivateRoute roles={['Admin']}>
                    <CreateAnnouncement toggleTheme={toggleTheme} />
                  </PrivateRoute>
                } />
                <Route path="/faculty" element={ <PrivateRoute roles={['Faculty']}><FacultyDashboard toggleTheme={toggleTheme} /></PrivateRoute> } />
                <Route path="/faculty/schedule" element={ <PrivateRoute roles={['Faculty']}><LectureSchedulePage toggleTheme={toggleTheme} /></PrivateRoute> } />
                <Route path="/faculty/assignments" element={ <PrivateRoute roles={['Faculty']}><AssignmentPostPage toggleTheme={toggleTheme} /></PrivateRoute> } />
                <Route path="/student" element={ <PrivateRoute roles={['Student']}><StudentDashboard toggleTheme={toggleTheme} /></PrivateRoute> } />
                <Route path="/student/tasks" element={ <PrivateRoute roles={['Student']}><TaskManager toggleTheme={toggleTheme} /></PrivateRoute> } />
                <Route path="/student/schedule" element={ <PrivateRoute roles={['Student']}><MySchedule toggleTheme={toggleTheme} /></PrivateRoute> } />
                <Route path="/student/assignment-solver" element={ <PrivateRoute roles={['Student']}><Layout toggleTheme={toggleTheme}><AssignmentSolver /></Layout></PrivateRoute> } />
                
                <Route path="/" element={<RegisterPage />} />
            </Routes>
        </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;