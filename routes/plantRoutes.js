const express = require('express');
const router = express.Router();
const {
  getAllPlants,
  createPlant,
  getPlant,
  updatePlant,
  deletePlant,
  uploadPlantImage,
  plantImageUploader
} = require('../controllers/plantController');

const { protect, restrictTo } = require('../controllers/authController');

router
  .route('/')
  .get(getAllPlants)
  .post(protect, restrictTo('grower'), createPlant);

router
  .route('/:id')
  .get(getPlant)
  .patch(protect, updatePlant)
  .delete(protect, restrictTo('grower'), deletePlant);

router
  .route('/:id/postPlant')
  .post(protect, plantImageUploader, uploadPlantImage);

module.exports = router;
