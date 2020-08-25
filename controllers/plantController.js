const multer = require('multer');
const Plant = require('../models/plantModel');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const PlantImage = require('../models/plantImageModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//seting connectin to store user plantPic
const connection = mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === "image/png") {
      return {
        bucketName: "plantImages",
        filename: file.originalname,
        metadata: {
          author: req.body.email,
        }
      };
    } else {
      return null;
    }
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images!', 400), false);
  }
};

const upload = multer({
  fileFilter: multerFilter,
  storage: storage,
});

exports.plantImageUploader = upload.single('plantPic');

//creates an endpoint to get the image easily with the plantImage model
exports.uploadPlantImage = catchAsync(async (req, res, next) => {
  
  const plantPic = await PlantImage.create({
    fileName: req.file.filename,
    owner: req.user.id,
    plantPicId: req.file.id
  })
  
  res.status(200).json({
    status: 'succes',
    data: {
      plantPic
    }
  })
});

exports.getAllPlants = catchAsync(async (req, res, next) => {
  const plants = await Plant.find();
  res.status(200).json({
    status: 'success',
    results: plants.length,
    data: {
      plants,
    },
  });
});

exports.createPlant = catchAsync(async (req, res, next) => {
  req.body.grower = req.user.id;
  if (req.files) {
    req.body.images = [];
    req.files.images.forEach((el) => {
      req.body.images.push(el.filename);
    });
  }
  const newPlant = await Plant.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      plant: newPlant,
    },
  });
});

exports.getPlant = catchAsync(async (req, res, next) => {
  const plant = await Plant.findById(req.params.id);

  if (!plant) {
    return next(new AppError('No plant found with that ID ', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      plant,
    },
  });
});

exports.updatePlant = catchAsync(async (req, res, next) => {
  if (req.files) {
    req.body.images = [];
    req.files.images.forEach((el) => {
      req.body.images.push(el.filename);
    });
  }
  const plant = await Plant.findOne({
    $and: [{ _id: req.params.id }, { grower: req.user.id }],
  });
  if (!plant) {
    return next(
      new AppError(
        "No plant found with that ID , or you can't update this plant ",
        404
      )
    );
  }
  
  const updatedPlant = await Plant.findByIdAndUpdate(
    { _id: plant._id},
    req.body,
    { new: true, runValidators: true }
  );
  

  res.status(200).json({
    message: 'success',
    data: {
      plant: updatedPlant,
    },
  });
});

exports.deletePlant = catchAsync(async (req, res, next) => {
  const plant = await Plant.findOne({
    $and: [{ _id: req.params.id }, { grower: req.user.id }],
  });
  if (!plant) {
    return next(
      new AppError(
        "No plant found with that ID , or you can't delete this plant ",
        404
      )
    );
  }
  await Plant.findByIdAndDelete(plant.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
