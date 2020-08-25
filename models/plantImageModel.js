const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plantImageSchema = new Schema({
    fileName: {
        required: true,
        type: String,
    },
    owner: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
    plantPicId: {
        type: Schema.Types.ObjectId
    }
});

const PlantImage = mongoose.model('PlantImage', plantImageSchema);

module.exports = PlantImage;