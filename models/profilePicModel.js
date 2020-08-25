const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profilePicSchema = new Schema({
    fileName: {
        required: true,
        type: String,
    },
    owner: {
        required: true,
        type: String
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
    profilePicId: {
        type: Schema.Types.ObjectId
    }
});

const ProfilePic = mongoose.model('ProfilePic', profilePicSchema);

module.exports = ProfilePic;