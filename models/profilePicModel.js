const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profilePicSchema = new Schema({
  fileName: {
    required: true,
    type: String,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  //   profilePicId: {
  //     type: Schema.Types.ObjectId,
  //   },
});

const ProfilePic = mongoose.model('ProfilePic', profilePicSchema);

module.exports = ProfilePic;
