const AuthUser = require('../models/User');
const Activity = require('../models/Activity');
const jsonwebtoken = require('jsonwebtoken');

const generateAuthToken = (id) => {
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role, semester } = req.body;

  try {
    const userExists = await AuthUser.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await AuthUser.create({
      name, 
      email, 
      password, 
      role,
      status: role === 'Faculty' ? 'pending' : 'active',
      semester: role === 'Student' ? semester : undefined,
    });

    if (user) {
      // Log activity
      await Activity.create({
        message: `${role} account created for ${name}.`,
        type: 'user_registered',
        user: user._id,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        status: user.status,
        token: generateAuthToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await AuthUser.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        status: user.status,
        subjects: user.subjects,
        token: generateAuthToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add the getUserProfile function
exports.getUserProfile = async (req, res) => {
  try {
    const user = await AuthUser.findById(req.user._id).select('-password').populate('subjects', 'name code');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};