import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/User.model';
require('dotenv').config()

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            password: null,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);


passport.use(
  'github',
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    },
    async (accessToken:any, refreshToken:any, profile:any, done:any) => {
      console.log(profile.id)
      try {
        const githubId = profile.id
          let user = await User.findOne({ githubId });

          if (!user) {
            user = new User({
              name: profile.username,
              email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
              password: null,
            });
            await user.save();
          }

          return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);


passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (error) {
    done(error, null);
  }
});

export default passport
// const jwtOptions = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.JWT_SECRET as string
// };

// passport.use(
//   'jwt',
//   new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
//     try {
//       const user = await User.findById(jwt_payload.userId);

//       if (user) {
//         return done(null, user);
//       }

//       return done(null, false);
//     } catch (error) {
//       return done(error, false);
//     }
//   })
// );
