// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const app = express();
// const port = 3000;
// app.use(cors());

// const saveDirectory = path.join(__dirname, 'face_data');

// // Function to delete all files in the directory
// const clearDirectory = (directory) => {
//   fs.readdir(directory, (err, files) => {
//     if (err) throw err;
//     for (const file of files) {
//       fs.unlink(path.join(directory, file), (err) => {
//         if (err) throw err;
//       });
//     }
//   });
// };

// // Create directory if it does not exist
// if (!fs.existsSync(saveDirectory)) {
//   fs.mkdirSync(saveDirectory, { recursive: true });
// } else {
//   // Clear directory if it exists
//   clearDirectory(saveDirectory);
// }

// app.use(bodyParser.json({ limit: '50mb' }));

// app.post('/api/face-data', (req, res) => {
//   const { faceData, screenshot } = req.body;
  
//   if (!faceData || !screenshot) {
//     return res.status(400).json({ message: 'Invalid data' });
//   }

//   const timestamp = Date.now();
//   const filePath = path.join(saveDirectory, `face_data_${timestamp}.json`);
//   const imageFilePath = path.join(saveDirectory, `screenshot_${timestamp}.png`);
  
//   fs.writeFile(filePath, JSON.stringify(faceData), (err) => {
//     if (err) {
//       console.error('Error writing face data:', err);
//       return res.status(500).json({ message: 'Failed to save face data' });
//     }
//   });

//   const base64Image = screenshot.split(';base64,').pop();
//   fs.writeFile(imageFilePath, base64Image, { encoding: 'base64' }, (err) => {
//     if (err) {
//       console.error('Error saving screenshot:', err);
//       return res.status(500).json({ message: 'Failed to save screenshot' });
//     }
//   });

//   res.json({ message: 'Data saved successfully' });
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc'); // Corrected import
const faceDataRoutes = require('./routers/faceDataRoutes.js');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const saveDirectory = path.join(__dirname, 'face_data');

/**
 * Function to delete all files in the directory.
 * @param {string} directory - The directory path.
 */
const clearDirectory = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

// Create directory if it does not exist, else clear it
if (!fs.existsSync(saveDirectory)) {
  fs.mkdirSync(saveDirectory, { recursive: true });
} else {
  clearDirectory(saveDirectory);
}

app.use('/api', faceDataRoutes);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Face Data API',
      version: '1.0.0',
      description: 'API for managing face data and screenshots',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./routers/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
