const User = require('../models/user');
const jwt = require('jsonwebtoken');

// User registration endpoint
exports.register = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const user = new User({ username, password, email });
        await user.save();
        res.status(201).json({ status: 'success', message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
}

// User login endpoint
exports.login = async (req, res) => {
    console.log('login endpoint')
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('user not found')
            return res.status(404).json({ status: 'failure', message: 'User not found' });
        }

        console.log('found user: ', user)
        
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            console.log('invalid password')
            return res.status(401).json({ status: 'failure', message: 'Invalid password' });
        }

        console.log('passwordValid: true')

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ status: 'success', token });
    } catch (error) {
        console.log('Error logging in user:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
}
