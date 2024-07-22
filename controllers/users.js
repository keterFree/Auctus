// Get logged-in user's info
exports.getUserInfo = async (req, res) => {
    res.json({ status: 'success', user: req.user });
}