
import mongoose from 'mongoose';

import { Mockgoose } from "mock-mongoose"
import supertest from "supertest"
import faker from "faker"

import app from '../../app';

import UserModel from "../../models/user"
import { User } from '../../types';

const request = supertest(app);

const mockgoose = new Mockgoose(mongoose);

const mockUser = {
        email: faker.internet.email(),
        password: faker.internet.password()
};

describe("Register", () => {

        beforeAll(async done => {
                try {
                        await mockgoose.prepareStorage();

                        await mongoose.connect("mongodb://example.com/TestingDB", { useNewUrlParser: true, useUnifiedTopology: true });

                        done();

                } catch (e) {
                        done(e)
                }
        });

        it("should return status 200", async done => {
                try {
                        request.post("/auth/register")
                                .set('Accept', 'application/json')
                                .send(mockUser)
                                .expect(201)
                                .end(async (err, res) => {

                                        if (err) return done(err);


                                        const user = await UserModel.findOne({ email: mockUser.email });

                                        if (!user)
                                                return done(new Error("User hasn't been created"))
                                        done();
                                })
                } catch (e) {
                        done(e)
                }
        });

        it("should return 400 if email already exists", async done => {
                try {
                        await request.post("/auth/register")
                                .set('Accept', 'application/json')
                                .send(mockUser)
                                .expect(400);
                
                } catch (e) {
                        done(e)
                }
        })

        afterAll(async done => {
                try {
                        await UserModel.deleteOne(mockUser);
                        await mongoose.connection.close();
                        done();
                } catch (e) {
                        done(e);
                }
        })
})