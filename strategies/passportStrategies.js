const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Serialize and deserialize user if needed (here using JWT, so can be minimal)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true // Add this if using reverse proxy/load balancer
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: ''
          });
          await user.save();
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.facebookId = profile.id;
          } else {
            user = new User({
              name: `${profile.name.givenName} ${profile.name.familyName}`,
              email: profile.emails[0].value,
              facebookId: profile.id,
              password: ''
            });
          }
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Apple Strategy
passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      callbackURL: process.env.APPLE_CALLBACK_URL,
      scope: ['name', 'email']
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Find or create user
        let user = await User.findOne({ appleId: profile.id });
        if (!user) {
          // If email exists with another method, update record; otherwise create new.
          user = await User.findOne({ email: profile.email });
          if (user) {
            user.appleId = profile.id;
          } else {
            user = new User({
              name: profile.name ? `${profile.name.firstName} ${profile.name.lastName}` : 'Apple User',
              email: profile.email,
              appleId: profile.id,
              password: '', // no password since it's OAuth
            });
          }
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
