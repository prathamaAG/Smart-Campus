const Lecture = require('../models/Lecture');
const Subject = require('../models/Subject');
const User = require('../models/User');

exports.createLecture = async (req, res) => {
    try {
        const { title, subject, start, end, venue, faculty } = req.body;

        // Basic validation
        if (!title || !subject || !start || !end || !faculty) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find the subject to potentially get semester/division if needed
        const subjectDoc = await Subject.findById(subject);
        if (!subjectDoc) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const lecture = new Lecture({
            title,
            subject,
            start,
            end,
            venue,
            faculty,
            // If you need to associate with a semester/division, you can get it from the subject
            semester: subjectDoc.semester,
            division: subjectDoc.division,
        });

        const createdLecture = await lecture.save();
        const populatedLecture = await Lecture.findById(createdLecture._id).populate('faculty', 'name').populate('subject', 'name');

        res.status(201).json(populatedLecture);
    } catch (error) {
        console.error('Error creating lecture:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getLectures = async (req, res) => {
    try {
        let query = {};
        const { user } = req;

        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (user.role === 'Student') {
            const student = await User.findById(user._id);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            
            const studentSubjects = await Subject.find({ semester: student.semester, division: student.division }).select('_id');
            const subjectIds = studentSubjects.map(s => s._id);
            query = { subject: { $in: subjectIds } };
        } else if (user.role === 'Faculty') {
            query = { faculty: user._id };
        } else if (user.role === 'Admin') {
            // Admin can see all lectures, no filter needed
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const lectures = await Lecture.find(query)
            .populate('faculty', 'name')
            .populate('subject', 'name')
            .sort({ start: -1 });
            
        res.json(lectures);
    } catch (error) {
        console.error('Error fetching lectures:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (lecture) {
            // Optional: Check if the user is authorized to delete
            // For example, if only the faculty who created it or an admin can delete
            // if (lecture.faculty.toString() !== req.user.id && req.user.role !== 'Admin') {
            //     return res.status(401).json({ message: 'Not authorized to delete this lecture' });
            // }
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