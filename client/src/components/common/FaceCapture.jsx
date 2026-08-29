import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Button from './Button.jsx';
import { FaCamera, FaRedo, FaCheck } from 'react-icons/fa';

const INSTRUCTIONS = [
  "Look straight",
  "Look slightly left",
  "Look slightly right",
  "Look slightly up",
  "Look slightly down"
];

/**
 * Component for capturing face images for attendance registration.
 */
const FaceCapture = ({ onCaptureComplete }) => {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhotos(prev => [...prev, imageSrc]);
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setPhotos([]);
  };

  const handleConfirm = () => {
    if (photos.length === 5) {
      onCaptureComplete(photos);
    }
  };

  const startCapture = () => {
    setIsCapturing(true);
  };

  if (!isCapturing && photos.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
        <FaCamera className="text-4xl mb-3 text-gray-400" />
        <p className="mb-4 text-center font-medium text-gray-700">Face Registration (Required)</p>
        <p className="mb-4 text-center text-sm text-gray-500">We need 5 photos from different angles for attendance.</p>
        <Button onClick={startCapture} type="button">Start Face Capture</Button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm w-full">
      <h3 className="font-semibold text-lg mb-4 border-b pb-2">Face Registration</h3>
      
      {photos.length < 5 ? (
        <div className="flex flex-col items-center">
          <div className="relative rounded-lg overflow-hidden border-4 border-brand-500 mb-4 bg-black w-full max-w-sm">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: 400, height: 400 }}
              className="w-full h-auto"
            />
          </div>
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-md mb-4 w-full text-center">
            <p className="font-medium">Photo {photos.length + 1} of 5</p>
            <p className="text-lg font-bold">{INSTRUCTIONS[photos.length]}</p>
          </div>
          <Button onClick={capture} type="button" className="w-full sm:w-auto flex items-center justify-center gap-2">
            <FaCamera /> Capture Photo {photos.length + 1}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-2 mb-6 w-full">
            {photos.map((src, index) => (
              <div key={index} className="relative rounded overflow-hidden border border-gray-200 aspect-square">
                <img src={src} alt={`Capture ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1 truncate px-1">
                  {INSTRUCTIONS[index]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button onClick={handleRetake} variant="outline" type="button" className="flex items-center justify-center gap-2">
              <FaRedo /> Retake All
            </Button>
            <Button onClick={handleConfirm} type="button" className="flex items-center justify-center gap-2">
              <FaCheck /> Confirm Photos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceCapture;
