const multer = require('multer');
const sharp = require('sharp');
// const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const ProfilePic = require('../models/profilePicModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const { Readable } = require('stream');

let gfs;
const connect = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.once('open', () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: 'profilePics',
  });
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images!', 400));
  }
};

const multerStorage = multer.memoryStorage();

exports.uploadImageMiddleware = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).single('image');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // name of user photo will be user-userId-curent_date (to avoid same name of users photos)
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  req.buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();

  next();
});

exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  const readablePhotoStream = new Readable();
  readablePhotoStream.push(req.buffer);
  readablePhotoStream.push(null);

  let uploadStream = gfs.openUploadStream(req.file.filename);
  let id = uploadStream.id;
  readablePhotoStream.pipe(uploadStream);
  uploadStream.on('error', () => {
    return res.status(500).json({ message: 'Error uploading file' });
  });
  uploadStream.on('finish', async () => {
    const profilePicture = await ProfilePic.create({
      fileName: req.file.filename,
      owner: req.user.id,
    });

    //Store the profilePictureId on the User Model , so when we can use user.photo.fileName
    //when requesting users/profile-image/:filename

    await User.findByIdAndUpdate(
      req.user.id,
      { photo: profilePicture._id },
      { new: true, runValidators: true }
    );

    return res.status(201).json({
      status: 'success',
      message: 'Image uploaded successfully',
    });
  });
});

exports.getUserProfileImage = (req, res) => {
  gfs.find({ filename: req.params.filename }).toArray((err, files) => {
    console.log(files);
    if (!files[0] || files.length === 0) {
      return res.status(200).json({
        status: 'fail',
        message: 'No files available',
      });
    }

    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  });
};

const filterRequestObj = async (reqBodyObj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(reqBodyObj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObj[el] = reqBodyObj[el];
  });
  return filteredObj;
};

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //To avoid that a malicious user change his role to an admin and grant all the access to the app
  const filteredBody = await filterRequestObj(req.body, 'name', 'email', 'bio');
  // we use req.user from the protect middellware
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});
