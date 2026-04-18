const { createSendToken } = require('../utils/jwt');

// Called after Google redirects back with user profile
exports.googleCallback = (req, res) => {
  try {
    const user = req.user;
    const { signToken, signRefreshToken } = require('../utils/jwt');
    const token = signToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Redirect to frontend with token in URL param
    // Frontend will extract it and store in Redux
    res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};
