const fs = require('fs');

/**
 * Save face data to a file.
 * @param {string} filePath - The file path.
 * @param {Object} faceData - The face data to save.
 * @param {function} callback - The callback function.
 */
const saveFaceData = (filePath, faceData, callback) => {
  fs.writeFile(filePath, JSON.stringify(faceData), callback);
};

/**
 * Save a screenshot to a file.
 * @param {string} imageFilePath - The file path.
 * @param {string} base64Image - The base64 encoded image.
 * @param {function} callback - The callback function.
 */
const saveScreenshot = (imageFilePath, base64Image, callback) => {
  const base64Data = base64Image.split(';base64,').pop();
  fs.writeFile(imageFilePath, base64Data, { encoding: 'base64' }, callback);
};

/**
 * Get all face data files in a directory.
 * @param {string} directory - The directory path.
 * @param {function} callback - The callback function.
 */
const getAllFaceData = (directory, callback) => {
  fs.readdir(directory, callback);
};

/**
 * Get face data from a file.
 * @param {string} filePath - The file path.
 * @param {function} callback - The callback function.
 */
const getFaceData = (filePath, callback) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(err);
    callback(null, JSON.parse(data));
  });
};

/**
 * Delete a face data file.
 * @param {string} filePath - The file path.
 * @param {function} callback - The callback function.
 */
const deleteFaceData = (filePath, callback) => {
  fs.unlink(filePath, callback);
};

/**
 * Delete a screenshot file.
 * @param {string} imageFilePath - The file path.
 * @param {function} callback - The callback function.
 */
const deleteScreenshot = (imageFilePath, callback) => {
  fs.unlink(imageFilePath, callback);
};

module.exports = {
  saveFaceData,
  saveScreenshot,
  getAllFaceData,
  getFaceData,
  deleteFaceData,
  deleteScreenshot
};