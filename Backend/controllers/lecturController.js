const Lecture = require('../models/Lecture');
const Subject = require('../models/Subject');
const User = require('../models/User');

exports.createLecture = async (req, res) => {
    try {
        console.log('=== CREATE LECTURE REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Request user:', req.user ? {
            id: req.user._id,
            name: req.user.name,
            role: req.user.role
        } : 'No user found');
        console.log('Request headers:', req.headers.authorization ? 'Token present' : 'No token');

        // Extract and validate all fields
        const { title, subject, start, end, venue, semester } = req.body;

        // More detailed field validation
        console.log('Field validation:');
        console.log('- title:', title, typeof title, !!title);
        console.log('- subject:', subject, typeof subject, !!subject);
        console.log('- start:', start, typeof start, !!start);
        console.log('- end:', end, typeof end, !!end);
        console.log('- semester:', semester, typeof semester, !!semester);
        console.log('- venue:', venue, typeof venue);
        console.log('- req.user._id:', req.user?._id, typeof req.user?._id, !!req.user?._id);

        // Check for missing required fields
        const missingFields = [];
        
        if (!title || (typeof title === 'string' && title.trim() === '')) {
            missingFields.push('title');
        }
        if (!subject || (typeof subject === 'string' && subject.trim() === '')) {
            missingFields.push('subject');
        }
        if (!start || (typeof start === 'string' && start.trim() === '')) {
            missingFields.push('start');
        }
        if (!end || (typeof end === 'string' && end.trim() === '')) {
            missingFields.push('end');
        }
        if (!semester || isNaN(parseInt(semester))) {
            missingFields.push('semester');
        }
        if (!req.user || !req.user._id) {
            missingFields.push('faculty (user authentication)');
        }

        if (missingFields.length > 0) {
            console.log('❌ Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`,
                receivedData: {
                    title: !!title,
                    subject: !!subject,
                    start: !!start,
                    end: !!end,
                    semester: !!semester,
                    venue: !!venue,
                    userAuthenticated: !!req.user?._id
                },
                missingFields
            });
        }

        console.log('✅ All required fields present');

        // Validate subject exists
        const subjectDoc = await Subject.findById(subject);
        if (!subjectDoc) {
            console.log('❌ Subject not found:', subject);
            return res.status(404).json({ message: 'Subject not found' });
        }

        console.log('✅ Subject found:', subjectDoc.name);

        // Validate and parse dates
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.log('❌ Invalid date format');
            return res.status(400).json({ message: 'Invalid date format' });
        }

        console.log('✅ Dates validated:', {
            start: startDate,
            end: endDate
        });

        // Create lecture object
        const lectureData = {
            title: title.trim(),
            subject: subject,
            start: startDate,
            end: endDate,
            venue: venue ? venue.trim() : '',
            faculty: req.user._id,
            semester: parseInt(semester)
        };

        console.log('Creating lecture with data:', lectureData);

        const lecture = new Lecture(lectureData);
        const createdLecture = await lecture.save();
        
        console.log('✅ Lecture created successfully with ID:', createdLecture._id);

        // Populate and return
        const populatedLecture = await Lecture.findById(createdLecture._id)
            .populate('faculty', 'name')
            .populate('subject', 'name code');

        console.log('✅ Returning populated lecture');
        res.status(201).json(populatedLecture);

    } catch (error) {
        console.error('❌ Error creating lecture:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: validationErrors,
                details: error.errors
            });
        }
        
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.getLectures = async (req, res) => {
    try {
        let query = {};
        const { user } = req;

        console.log('Get lectures request from user:', {
            id: user._id,
            role: user.role,
            name: user.name
        });

        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (user.role === 'Student') {
            query = { semester: user.semester };
            console.log('Student lecture query:', query);
        } else if (user.role === 'Faculty') {
            query = { faculty: user._id };
            console.log('Faculty lecture query:', query);
        } else if (user.role === 'Admin') {
            console.log('Admin - fetching all lectures');
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const lectures = await Lecture.find(query)
            .populate('faculty', 'name')
            .populate('subject', 'name code')
            .sort({ start: -1 });
            
        console.log(`Found ${lectures.length} lectures for user ${user.name} (${user.role})`);
        res.json(lectures);
    } catch (error) {
        console.error('Error fetching lectures:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getStudentLectures = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student || student.role !== 'Student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('Fetching lectures for student:', {
            id: student._id,
            name: student.name,
            semester: student.semester
        });

        const lectures = await Lecture.find({ 
            semester: student.semester
        })
        .populate('faculty', 'name email')
        .populate('subject', 'name code')
        .sort({ start: -1 });
        
        console.log(`Found ${lectures.length} lectures for student ${student.name} (Sem: ${student.semester})`);
        res.json(lectures);
    } catch (error) {
        console.error('Error fetching student lectures:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getFacultyUpcomingLectures = async (req, res) => {
    try {
        const facultyId = req.params.facultyId || req.user.id;
        const now = new Date();
        
        const lectures = await Lecture.find({ 
            faculty: facultyId,
            start: { $gte: now }
        })
        .populate('faculty', 'name')
        .populate('subject', 'name code')
        .sort({ start: 1 })
        .limit(10);
        
        res.json(lectures);
    } catch (error) {
        console.error('Error fetching faculty upcoming lectures:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (lecture) {
            if (lecture.faculty.toString() !== req.user.id && req.user.role !== 'Admin') {
                return res.status(401).json({ message: 'Not authorized to delete this lecture' });
            }
            await lecture.deleteOne();
            res.json({ message: 'Lecture removed' });
        } else {
            res.status(404).json({ message: 'Lecture not found' });
        }
    } catch (error) {
        console.error('Error deleting lecture:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};