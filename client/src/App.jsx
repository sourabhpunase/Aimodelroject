import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities';

/**
 * Component for displaying face detection information.
 * 
 * @param {Object} props - The component props
 * @param {boolean} props.faceDetected - Whether a face was detected
 * @param {number} props.numFaces - Number of faces detected
 * @param {number} props.fps - Frames per second
 * @param {Object} [props.faceData] - Data of the detected face
 * @param {string} [props.faceData.position] - Position of the face
 * @param {string} [props.faceData.size] - Size of the face
 * @param {number} [props.faceData.confidence] - Confidence level of the face detection
 * @param {number} [props.faceData.landmarks] - Number of landmarks detected
 * @param {Object} [props.faceData.boundingBox] - Bounding box of the face
 * @param {number[]} [props.faceData.boundingBox.topLeft] - Top left coordinates of bounding box
 * @param {number[]} [props.faceData.boundingBox.bottomRight] - Bottom right coordinates of bounding box
 * @param {Object} [props.faceData.headPose] - Head pose data
 * @param {number} [props.faceData.headPose.pitch] - Pitch angle of the head
 * @param {number} [props.faceData.headPose.yaw] - Yaw angle of the head
 * @param {number} [props.faceData.headPose.roll] - Roll angle of the head
 * @returns {JSX.Element} The FaceInfo component
 */
const FaceInfo = ({ faceDetected, numFaces, fps, faceData }) => {
  return (
    <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px' }}>
      <p>Face Detected: {faceDetected ? 'Yes' : 'No'}</p>
      <p>Number of Faces: {numFaces}</p>
      <p>FPS: {fps}</p>
      {faceData && (
        <>
          <p>Position: {faceData.position}</p>
          <p>Size: {faceData.size}</p>
          <p>Confidence: {faceData.confidence.toFixed(2)}</p>
          <p>Landmarks: {faceData.landmarks}</p>
          <p>Bounding Box: ({faceData.boundingBox.topLeft[0].toFixed(0)}, {faceData.boundingBox.topLeft[1].toFixed(0)}) - 
             ({faceData.boundingBox.bottomRight[0].toFixed(0)}, {faceData.boundingBox.bottomRight[1].toFixed(0)})</p>
          <p>Head Pose: Pitch: {faceData.headPose.pitch.toFixed(2)}, Yaw: {faceData.headPose.yaw.toFixed(2)}, Roll: {faceData.headPose.roll.toFixed(2)}</p>
        </>
      )}
    </div>
  );
};

/**
 * Main application component.
 * 
 * @returns {JSX.Element} The App component
 */
export const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [numFaces, setNumFaces] = useState(0);
  const [fps, setFps] = useState(0);
  const [faceData, setFaceData] = useState(null);
  const [showMesh, setShowMesh] = useState(true);
  const [prevNumFaces, setPrevNumFaces] = useState(0);

  /**
   * Captures a screenshot from the webcam.
   * 
   * @returns {string|null} The screenshot URL or null if capture fails
   */
  const captureScreenshot = () => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  };

  /**
   * Sends face data and screenshot to the backend server.
   * 
   * @param {Object} faceData - Data of the detected face
   * @param {string|null} screenshot - Screenshot URL
   */
  const sendDataToBackend = async (faceData, screenshot) => {
    try {
      const response = await fetch('http://localhost:3000/api/face-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faceData,
          screenshot,
        }),
      });

      if (response.ok) {
        console.log('Data sent successfully');
      } else {
        console.error('Failed to send data');
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  /**
   * Loads the facemesh model and starts the face detection process.
   */
  const runFacemesh = async () => {
    const net = await facemesh.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });

    let lastTime = Date.now();
    const detectAndSend = async () => {
      const faces = await detect(net);
      const currentTime = Date.now();
      setFps(Math.round(1000 / (currentTime - lastTime)));
      lastTime = currentTime;
    };

    setInterval(detectAndSend, 100);
  };

  /**
   * Detects faces in the video stream and updates the state.
   * 
   * @param {Object} net - The facemesh model
   * @returns {Promise<Array>} The detected faces
   */
  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      try {
        const faces = await net.estimateFaces(video);

        if (faces && Array.isArray(faces)) {
          setFaceDetected(faces.length > 0);
          setNumFaces(faces.length);

          if (faces.length > 0) {
            const face = faces[0];
            if (face.mesh && face.boundingBox) {
              const newFaceData = {
                position: getFacePosition(face.boundingBox, videoWidth, videoHeight),
                size: getFaceSize(face.boundingBox, videoWidth, videoHeight),
                confidence: face.faceInViewConfidence || 0,
                landmarks: face.mesh.length,
                boundingBox: face.boundingBox,
                headPose: estimateHeadPose(face.mesh),
              };
              setFaceData(newFaceData);
            } else {
              setFaceData(null);
            }
          } else {
            setFaceData(null);
          }

          const ctx = canvasRef.current.getContext("2d");
          if (showMesh) {
            drawMesh(faces, ctx);
          } else {
            ctx.clearRect(0, 0, videoWidth, videoHeight);
          }
        } else {
          setFaceDetected(false);
          setNumFaces(0);
          setFaceData(null);
        }

        return faces;
      } catch (error) {
        console.error("Error in face detection:", error);
        setFaceDetected(false);
        setNumFaces(0);
        setFaceData(null);
      }
    }
    return null;
  };

  /**
   * Determines the position of the face based on bounding box and video dimensions.
   * 
   * @param {Object} boundingBox - Bounding box of the face
   * @param {number} videoWidth - Width of the video
   * @param {number} videoHeight - Height of the video
   * @returns {string} The position of the face
   */
  const getFacePosition = (boundingBox, videoWidth, videoHeight) => {
    const centerX = (boundingBox.topLeft[0] + boundingBox.bottomRight[0]) / 2;
    const centerY = (boundingBox.topLeft[1] + boundingBox.bottomRight[1]) / 2;
    
    if (centerX < videoWidth / 3) return "Left";
    if (centerX > (2 * videoWidth) / 3) return "Right";
    if (centerY < videoHeight / 3) return "Top";
    if (centerY > (2 * videoHeight) / 3) return "Bottom";
    return "Center";
  };

  /**
   * Determines the size of the face based on bounding box and video dimensions.
   * 
   * @param {Object} boundingBox - Bounding box of the face
   * @param {number} videoWidth - Width of the video
   * @param {number} videoHeight - Height of the video
   * @returns {string} The size of the face
   */
  const getFaceSize = (boundingBox, videoWidth, videoHeight) => {
    const width = boundingBox.bottomRight[0] - boundingBox.topLeft[0];
    const height = boundingBox.bottomRight[1] - boundingBox.topLeft[1];
    const area = width * height;
    const videoArea = videoWidth * videoHeight;
    const ratio = area / videoArea;

    if (ratio < 0.15) return "Small";
    if (ratio > 0.4) return "Large";
    return "Medium";
  };

  /**
   * Estimates the head pose based on facial landmarks.
   * 
   * @param {Array} landmarks - Facial landmarks
   * @returns {Object} The estimated head pose with pitch, yaw, and roll
   */
  const estimateHeadPose = (landmarks) => {
    const nose = landmarks[1];
    const leftEye = landmarks[145];
    const rightEye = landmarks[374];

    if (!nose || !leftEye || !rightEye) {
      return { pitch: 0, yaw: 0, roll: 0 };
    }

    const pitch = Math.atan2(nose[1] - (leftEye[1] + rightEye[1]) / 2, nose[2] - (leftEye[2] + rightEye[2]) / 2);
    const yaw = Math.atan2(nose[0] - (leftEye[0] + rightEye[0]) / 2, nose[2] - (leftEye[2] + rightEye[2]) / 2);
    const roll = Math.atan2(rightEye[1] - leftEye[1], rightEye[0] - leftEye[0]);

    return { pitch, yaw, roll };
  };

  useEffect(() => {
    runFacemesh();
  }, []);

  useEffect(() => {
    if (numFaces !== prevNumFaces) {
      setPrevNumFaces(numFaces);
      if (numFaces > 0 && faceData) {
        const screenshot = captureScreenshot();
        sendDataToBackend(faceData, screenshot);
      }
    }
  }, [numFaces, faceData]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
      <FaceInfo 
        faceDetected={faceDetected}
        numFaces={numFaces}
        fps={fps}
        faceData={faceData}
      />
    </div>
  );
};

export default App;
