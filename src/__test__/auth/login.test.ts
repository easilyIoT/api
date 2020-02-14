import mongoose from 'mongoose';

import { Mockgoose } from "mock-mongoose"
import supertest from "supertest"
import faker from "faker"

import app from '../../app';

import UserModel from "../../models/user"
import { token } from '../../controller/OAuth';

const request = supertest(app);

const mockgoose = new Mockgoose(mongoose);


const mockUser = {
        email: faker.internet.email(),
        password: faker.internet.password()
};

describe("Login", () => {

        beforeAll(async done => {
                try {
                        await mockgoose.prepareStorage();

                        await mongoose.connect("mongodb://example.com/TestingDB", { useNewUrlParser: true, useUnifiedTopology: true });

                        done();
                } catch (e) {
                        done(e)
                }
        })

        beforeEach(async done => {
                try {
                        const user = new UserModel(mockUser);

                        await user.save();
                        done();
                } catch (e) {
                        done(e);
                }
        })

        it("should return status 200", async done => {

                try {
                        request
                                .post("/auth/login")
                                .set('Accept', 'application/json')
                                .send(mockUser)
                                .expect('Content-Type', /json/)
                                .expect(200)
                                .end((err, res) => {
                                        expect(res.body.token).toBeDefined();
                                        

                                        if (err) done(err);
                                        
                                        done()
                                })
                } catch (e) {
                        done(e)
                }
        })

        afterEach(async done => {
                try {
                        await UserModel.deleteOne({ email: mockUser.email });
                        done();
                } catch (e) {
                        done(e);
                }

               

        })

        afterAll(async done => {
                try {
                        await mongoose.connection.close();
                        done();
                } catch (e) {
                        done(e);
                }
        })


})