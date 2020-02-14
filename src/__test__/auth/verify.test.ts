import mongoose from 'mongoose';

import { Mockgoose } from "mock-mongoose";
import supertest from "supertest";
import faker from "faker";

import app from '../../app';

import UserModel from "../../models/user";


const request = supertest(app);

const mockgoose = new Mockgoose(mongoose);

const mockUser = {
        email: faker.internet.email(),
        password: faker.internet.password()
};

describe("Verify", () => {
        beforeAll(async done => {
                try {
                        await mockgoose.prepareStorage();
                        await mongoose.connect("mongodb://example.com/TestingDB", { useNewUrlParser: true, useUnifiedTopology: true });

                        done();
                } catch (e) {
                        done(e)
                }
        })

        let token: string;

        beforeEach(async done => {
                try {
                        const user = new UserModel(mockUser);

                        await user.save();

                        request
                                .post("/auth/login")
                                .set('Accept', 'application/json')
                                .send(mockUser)
                                .expect('Content-Type', /json/)
                                .expect(200)
                                .end((err, res) => {
                                        if (err) done(err);

                                        expect(res.body.token).toBeDefined();


                                        token = res.body.token;

                                        done()
                                })
                } catch (e) {
                        done(e);
                }
        })

        it("should return 200 with correct token", async done => {
                request
                        .post("/auth/verify")
                        .set('Accept', 'application/json')
                        .set("Authorization", token)
                        .expect(200, done)

        });

        it("should return 401 with no token", async done => {
                request
                        .post("/auth/verify")
                        .set('Accept', 'application/json')
                        .set("Authorization", "")
                        .expect(401, done)
        });

        afterEach(async done => {
                try {
                        await UserModel.deleteOne({ email: mockUser.email });
                        done();
                } catch (e) {
                        done(e);
                }
        })

        afterAll(async done => {
                mongoose.connection.close();
        })
})