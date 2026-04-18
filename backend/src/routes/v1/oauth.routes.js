const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const oauthController = require('../../controllers/oauth.controller');

// Step 1: Redirect user to Google consent screen
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Step 2: Google redirects back here with code
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  oauthController.googleCallback
);

module.exports = router;
