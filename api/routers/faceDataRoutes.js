const express = require('express');
const router = express.Router();
const faceDataController = require('../controllers/faceDataController.js');

/**
 * @swagger
 * /face-data:
 *   post:
 *     summary: Create face data
 *     description: Save face data and screenshot.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FaceData'
 *     responses:
 *       200:
 *         description: Data saved successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Failed to save face data or screenshot
 */
router.post('/face-data', faceDataController.createFaceData);

/**
 * @swagger
 * /face-data:
 *   get:
 *     summary: Get all face data
 *     description: Retrieve all face data files.
 *     responses:
 *       200:
 *         description: A list of face data files
 *       500:
 *         description: Failed to read directory
 */
router.get('/face-data', faceDataController.getAllFaceData);

/**
 * @swagger
 * /face-data/{timestamp}:
 *   get:
 *     summary: Get face data by timestamp
 *     description: Retrieve face data by timestamp.
 *     parameters:
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested face data
 *       404:
 *         description: File not found
 */
router.get('/face-data/:timestamp', faceDataController.getFaceDataByTimestamp);

/**
 * @swagger
 * /face-data/{timestamp}:
 *   put:
 *     summary: Update face data by timestamp
 *     description: Update face data and screenshot by timestamp.
 *     parameters:
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FaceData'
 *     responses:
 *       200:
 *         description: Data updated successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Failed to save face data or screenshot
 */
router.put('/face-data/:timestamp', faceDataController.updateFaceDataByTimestamp);

/**
 * @swagger
 * /face-data/{timestamp}:
 *   delete:
 *     summary: Delete face data by timestamp
 *     description: Delete face data and screenshot by timestamp.
 *     parameters:
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data deleted successfully
 *       500:
 *         description: Failed to delete face data or screenshot
 */
router.delete('/face-data/:timestamp', faceDataController.deleteFaceDataByTimestamp);

module.exports = router;
