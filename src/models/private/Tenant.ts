import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ICompany } from './Company'

export interface ITenant extends Document {
  name: string
  email: string
  password: string
  company: ICompany[]
  createJwt(): string
  comparePassword(inputPassword: string): Promise<boolean>
}

export const TenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, 'please enter your name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'please provide an email'],
    unique: [true, 'email already exists'],
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 6,
    select: false,
  },
  company: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Company',
    },
  ],
})

const saltRounds = 12

TenantSchema.pre<ITenant>('save', async function () {
  if (!this.isModified('password')) {
    return
  }
  const salt = await bcrypt.genSalt(saltRounds)
  this.password = await bcrypt.hash(this.password, salt)
})

TenantSchema.methods.createJwt = function (): string {
  return jwt.sign({ tenantId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
}

TenantSchema.methods.comparePassword = async function (inputPassword: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(inputPassword, this.password)
  return isMatch
}
