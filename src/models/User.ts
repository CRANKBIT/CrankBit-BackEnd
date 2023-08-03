import { Document, Schema, model } from 'mongoose'
import jwt from 'jsonwebtoken'

export interface IUser extends Document {
  email: string
  createJwt(): string
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'please enter your email'],
    unique: true,
    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
  },
})

UserSchema.methods.createJwt = function (): string {
  return jwt.sign({ userID: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
}

const UserModel = model<IUser>('User', UserSchema)
export default UserModel
