import mongoose from 'mongoose';
import supertest from "supertest"

import app from '../../src/app';
import initDBConnection from "../../src/db"

import UserModel from "../../src/models/user"
import { User } from '../../src/types';
const request = supertest(app);


test("Login", () => {
        let mockUser: User;

        beforeEach(async done => {
                await initDBConnection;
                       
                mockUser = new UserModel({ })
        })



        afterEach(async done => {
                mongoose.connection.close();
        })


})