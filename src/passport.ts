import passport from "passport"

import { Strategy as JwtStrategy, VerifiedCallback } from "passport-jwt"
import { Strategy as LocalStrategy, IVerifyOptions } from "passport-local" 

import { ExtractJwt } from "passport-jwt"

import UserModel from "./models/user"
import { User } from './types';
import { disconnect } from "mongoose"


passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromHeader("authorization"),
        secretOrKey: process.env.JWT_SECRET,
}, async (payload: any, done: VerifiedCallback) => {
        
        try {
                
                // Find the user in the collection
                const user = await UserModel.findById(payload.sub);

                
                // Exist if the user didn't exist
                if (!user)
                        return done(null, false)
                
                // Otherwise return the user
                done(null, user);
                        
        } catch (err) {
                done(err, false);
        }
}))


passport.use(new LocalStrategy({
        usernameField: "email"
}, async (email: string, password: string, done) => {
        try {
                const user: any = await UserModel.findOne({ email });

                if (!user) 
                        done(null, false);
                
                
                // Check if the password is correct
                const isMatch = await user.isValidPassword(password);
        
                // If not, handle it
                if (!isMatch) 
                        return done(null, false);
                
                // Otherwise return the user
                done(null, user);
        } catch (err) {
                done(err, false);
        }
}))