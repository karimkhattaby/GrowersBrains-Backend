const multer = require('multer');
// const sharp = require('sharp');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const ProfilePic = require('../models/profilePicModel');
const catchAsync = require('../utils/catchAsync');

//seting connectin to store user profilePic
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
        bucketName: "profilePics",
        filename: file.originalname,
        metadata: {
          author: req.body.email
        }
      };
    } else {
      return null;
    }
  }
});

// const memStorage = multer.memoryStorage();

// const upload = multer({storage: memStorage});
//upload img tp DB
// exports.profilePicGetter = upload.single('profilePic');

// exports.profilePicResizer = catchAsync(async (req, res, next) => {
  // req.file.originalname = `user-${req.user.id}-${Date.now()}.jpeg`;
  // req.file.buffer = await resizeUserPhoto(req,res,next);
  // req.file.mimetype = 'image/jpeg'
//   next()
// })

//Stores the profile pic in the MongoDb
const mongoDBUpload = multer({ storage: storage });
exports.profilePicUploader = mongoDBUpload.single('profilePic');

//creates an endpoint to get the image easily with the profilePic model
exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const profilePicExist = await ProfilePic.findOne({ author: email })
  
  if (profilePicExist) {
    //Delete that pic first
  }
  const profilePic = await ProfilePic.create({
    fileName: req.file.filename,
    owner: req.user.id,
    profilePicId: req.file.id
  })
  res.status(200).json({
    status: 'success',
    data: {
      profilePic
    }
  })
});


//This would be used to resize image, still have to figure it out
// const resizeUserPhoto = async (req, res, next) => {
//   const buffer = await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toBuffer()
//     .then(data => {
//       return data;
//     })
//     .catch(err =>console.error(err));
//   return buffer;
// };

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
  //Save image name to the database
  if (req.file) filteredBody.photo = req.file.filename;
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
