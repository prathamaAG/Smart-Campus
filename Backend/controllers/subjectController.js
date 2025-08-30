const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
    const { name, code } = req.body;
    const subject = new Subject({ name, code });
    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
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
};