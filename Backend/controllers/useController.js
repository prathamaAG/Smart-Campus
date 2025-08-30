const AllUsersModel = require('../models/User');
const Activity = require('../models/Activity');

exports.getUsers = async (req, res) => {
  const query = {};
  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  const users = await AllUsersModel.find(query).select('-password');
  res.json(users);
};

exports.getFaculty = async (req, res) => {
    const faculty = await AllUsersModel.find({ role: 'Faculty' }).select('-password').populate('subjects', 'name code');
    res.json(faculty);
};

exports.getStudents = async (req, res) => {
    const students = await AllUsersModel.find({ role: 'Student' }).select('-password');
    res.json(students);
};

exports.updateUserProfile = async (req, res) => {
    const user = await AllUsersModel.findById(req.user.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update a faculty member's subjects
// @route   PUT /api/users/faculty/:id/subjects
// @access  Private/Admin
exports.updateFacultySubjects = async (req, res) => {
    const { subjects } = req.body; // Expecting an array of subject IDs

    try {
        const faculty = await AllUsersModel.findById(req.params.id);

        if (faculty && faculty.role === 'Faculty') {
            faculty.subjects = subjects;
            await faculty.save();
            res.json(faculty);
        } else {
            res.status(404).json({ message: 'Faculty not found' });
        }
    } catch (error) {
        console.error('Error updating faculty subjects:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await AllUsersModel.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.status = req.body.status || user.status;
            
            const updatedUser = await user.save();

            if (req.body.status === 'active' && user.role === 'Faculty') {
              await Activity.create({
                message: `Faculty account for ${user.name} approved.`,
                type: 'faculty_approved',
                user: user._id,
              });
            }

            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            res.json(userResponse);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await AllUsersModel.findById(req.user.id).select('-password').populate('subjects', 'name code');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};