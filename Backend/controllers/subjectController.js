const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
    try {
        const { name, code, semester } = req.body;
        const subject = new Subject({ name, code, semester: parseInt(semester) });
        const createdSubject = await subject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Subject code already exists' });
        } else {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({}).lean();
        const faculties = await User.find({ role: 'Faculty' }).select('name subjects');

        const subjectMap = subjects.reduce((acc, subject) => {
            acc[subject._id] = { ...subject, faculty: [] };
            return acc;
        }, {});

        faculties.forEach(faculty => {
            faculty.subjects.forEach(subjectId => {
                if (subjectMap[subjectId]) {
                    subjectMap[subjectId].faculty.push(faculty.name);
                }
            });
        });

        res.json(Object.values(subjectMap));
    } catch (error) {
        console.error('Error fetching subjects with faculty:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Assign a subject to a faculty member
// @route   POST /api/subjects/assign
// @access  Private/Admin
exports.assignSubjectToFaculty = async (req, res) => {
    try {
        const { facultyId, subjectId } = req.body;
        const faculty = await User.findById(facultyId);
        const subject = await Subject.findById(subjectId);

        if (faculty && faculty.role === 'Faculty' && subject) {
            // Avoid duplicate subjects
            if (!faculty.subjects.includes(subjectId)) {
                faculty.subjects.push(subjectId);
                await faculty.save();
                res.json({ message: 'Subject assigned successfully' });
            } else {
                res.status(400).json({ message: 'Faculty already assigned this subject' });
            }
        } else {
            res.status(404).json({ message: 'Faculty or Subject not found' });
        }
    } catch (error) {
        console.error('Error assigning subject:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res) => {
    try {
        const { name, code, semester } = req.body;
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        subject.name = name || subject.name;
        subject.code = code || subject.code;
        subject.semester = semester ? parseInt(semester) : subject.semester;

        const updatedSubject = await subject.save();
        res.json(updatedSubject);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Subject code already exists' });
        } else {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Remove subject from all faculty members
        await User.updateMany(
            { subjects: req.params.id },
            { $pull: { subjects: req.params.id } }
        );

        await subject.deleteOne();
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Remove a faculty member from a subject
// @route   POST /api/subjects/remove-faculty
// @access  Private/Admin
exports.removeFacultyFromSubject = async (req, res) => {
    try {
        console.log('Remove faculty request:', req.body);
        
        const { facultyId, subjectId } = req.body;
        
        if (!facultyId || !subjectId) {
            return res.status(400).json({ message: 'Faculty ID and Subject ID are required' });
        }
        
        const faculty = await User.findById(facultyId);
        const subject = await Subject.findById(subjectId);

        if (!faculty) {
            console.log('Faculty not found:', facultyId);
            return res.status(404).json({ message: 'Faculty not found' });
        }
        
        if (!subject) {
            console.log('Subject not found:', subjectId);
            return res.status(404).json({ message: 'Subject not found' });
        }

        if (faculty.role !== 'Faculty') {
            return res.status(400).json({ message: 'User is not a faculty member' });
        }

        console.log('Before removal - Faculty subjects:', faculty.subjects);
        
        // Remove subject from faculty's subjects array
        const initialLength = faculty.subjects.length;
        faculty.subjects = faculty.subjects.filter(id => id.toString() !== subjectId.toString());
        
        console.log('After removal - Faculty subjects:', faculty.subjects);
        console.log('Subjects removed:', initialLength - faculty.subjects.length);
        
        await faculty.save();
        
        res.json({ 
            message: 'Faculty removed from subject successfully',
            facultyName: faculty.name,
            subjectName: subject.name
        });
        
    } catch (error) {
        console.error('Error removing faculty from subject:', error);
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message,
            details: 'Failed to remove faculty from subject'
        });
    }
};