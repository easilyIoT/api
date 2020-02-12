import mongoose from 'mongoose';
import supertest from "supertest"

import app from '../../src/app';
import initDBConnection from "../../src/db"


test("Verify", () => {
        beforeAll(async done => {
                await initDBConnection;
        })

        afterAll(async done => {
                mongoose.connection.close();
        })
})