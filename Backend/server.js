const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/useRoutes');
const lectureRoutes = require('./routes/lecturRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const aiRoutes = require('./routes/airoutes');
const taskRoutes = require('./routes/taskroutes');
const activityRoutes = require('./routes/activityRoutes');
const solverRoutes = require('./routes/solverRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

// Load env vars
dotenv.config();



// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Serve static files from the 'uploads' directory
app.use('/api/solver/download', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/solver', solverRoutes);
app.use('/api/announcements', announcementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));