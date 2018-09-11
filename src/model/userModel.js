'use strict';

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  username: { type:String, required:true, unique:true },
  password: { type:String, rquired:true },
});

userSchema.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(err => {throw err;});
});

userSchema.methods.comparePassword= function(password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

export default mongoose.model('users', userSchema);