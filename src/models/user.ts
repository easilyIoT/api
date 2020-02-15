import { Schema, model, HookNextFunction } from "mongoose"
import bcrypt from "bcryptjs"

import { User } from "../types"

const userSchema: Schema = new Schema({
        email: {
                type: String,
                lowercase: true,
                required: true
        },
        password: {
                type: String,
                required: true
        }
})

userSchema.pre("save", async function (this: User, next: HookNextFunction) {
        try {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(this.password, salt);
        
                //Modify the password field
                this.password = hash;

        } catch (e) {
                next(e);
        }
});

userSchema.method("isValidPassword", async function (this: User, newPassword: string): Promise<Boolean> {
        try {
                return await bcrypt.compare(newPassword, this.password);
        } catch (e) {
                throw new Error(e);
        }
})

export default model<User> ("User", userSchema);