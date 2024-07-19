const FaceData = require('../models/faceModel.js');
const fs = require('fs');
const path = require('path');

const saveDirectory = path.join(__dirname, '../face_data');

/**
 * Create face data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createFaceData = (req, res) => {
  const { faceData, screenshot } = req.body;

  if (!faceData || !screenshot) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  const timestamp = Date.now();
  const filePath = path.join(saveDirectory, `face_data_${timestamp}.json`);
  const imageFilePath = path.join(saveDirectory, `screenshot_${timestamp}.png`);

  FaceData.saveFaceData(filePath, faceData, (err) => {
    if (err) {
      console.error('Error writing face data:', err);
      return res.status(500).json({ message: 'Failed to save face data' });
    }
  });

  FaceData.saveScreenshot(imageFilePath, screenshot, (err) => {
    if (err) {
      console.error('Error saving screenshot:', err);
      return res.status(500).json({ message: 'Failed to save screenshot' });
    }
  });

  res.json({ message: 'Data saved successfully' });
};

/**
 * Get all face data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAllFaceData = (req, res) => {
  FaceData.getAllFaceData(saveDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ message: 'Failed to read directory' });
    }
    res.json(files);
  });
};

/**
 * Get face data by timestamp.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getFaceDataByTimestamp = (req, res) => {
  const timestamp = req.params.timestamp;
  const filePath = path.join(saveDirectory, `face_data_${timestamp}.json`);

  FaceData.getFaceData(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(data);
  });
};

/**
 * Update face data by timestamp.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateFaceDataByTimestamp = (req, res) => {
  const timestamp = req.params.timestamp;
  const { faceData, screenshot } = req.body;
  const filePath = path.join(saveDirectory, `face_data_${timestamp}.json`);
  const imageFilePath = path.join(saveDirectory, `screenshot_${timestamp}.png`);

  if (!faceData || !screenshot) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  FaceData.saveFaceData(filePath, faceData, (err) => {
    if (err) {
      console.error('Error writing face data:', err);
      return res.status(500).json({ message: 'Failed to save face data' });
    }
  });

  FaceData.saveScreenshot(imageFilePath, screenshot, (err) => {
    if (err) {
      console.error('Error saving screenshot:', err);
      return res.status(500).json({ message: 'Failed to save screenshot' });
    }
  });

  res.json({ message: 'Data updated successfully' });
};

/**
 * Delete face data by timestamp.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteFaceDataByTimestamp = (req, res) => {
  const timestamp = req.params.timestamp;
  const filePath = path.join(saveDirectory, `face_data_${timestamp}.json`);
  const imageFilePath = path.join(saveDirectory, `screenshot_${timestamp}.png`);

  FaceData.deleteFaceData(filePath, (err) => {
    if (err) {
      console.error('Error deleting face data:', err);
      return res.status(500).json({ message: 'Failed to delete face data' });
    }
  });

  FaceData.deleteScreenshot(imageFilePath, (err) => {
    if (err) {
      console.error('Error deleting screenshot:', err);
      return res.status(500).json({ message: 'Failed to delete screenshot' });
    }
  });

  res.json({ message: 'Data deleted successfully' });
};

module.exports = {
  createFaceData,
  getAllFaceData,
  getFaceDataByTimestamp,
  updateFaceDataByTimestamp,
  deleteFaceDataByTimestamp
};