const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/oauth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const avatar = profile.photos[0]?.value || '';

        // Find existing user or create new one
        let user = await User.findOne({ email });

        if (user) {
          // Update avatar if not set
          if (!user.avatar?.url && avatar) {
            user.avatar = { url: avatar, publicId: 'google' };
            await user.save({ validateBeforeSave: false });
          }
          return done(null, user);
        }

        // Create new user from Google profile
        user = await User.create({
          name: profile.displayName,
          email,
          password: `google_oauth_${profile.id}_${Date.now()}`, // Random password — user won't use it
          avatar: { url: avatar, publicId: 'google' },
          isActive: true,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
