import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../../services/events.js';
import Button from '../../../components/common/Button.jsx';
import Table from '../../../components/common/Table.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';

const LiveScannerPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const webcamRef = useRef(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [error, setError] = useState('');
  
  // Track users already scanned in this session to prevent duplicates
  const scannedUsersRef = useRef(new Set());

  // Fetch full attendance history for the table
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', eventId],
    queryFn: () => eventsService.getAttendance(eventId),
  });

  // Fetch event details to check status
  const { data: eventData } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsService.getEventById(eventId),
  });

  const fullAttendanceList = attendanceData?.data || [];
  const eventStatus = eventData?.data?.status;
  const isCompleted = eventStatus === 'COMPLETED';

  // Populate recent scans on initial load
  useEffect(() => {
    if (fullAttendanceList.length > 0 && recentScans.length === 0) {
      const initialScans = fullAttendanceList.slice(0, 6).map(record => ({
        userId: record.user.id,
        name: record.user.name,
        time: new Date(record.timestamp).toLocaleTimeString()
      }));
      setRecentScans(initialScans);
      // Populate memory so we don't scan them again if they stand there right after a refresh
      initialScans.forEach(scan => scannedUsersRef.current.add(scan.userId));
    }
  }, [fullAttendanceList, recentScans.length]);

  // Setup interval for scanning
  useEffect(() => {
    let interval;
    if (isScanning && !isCompleted) {
      interval = setInterval(() => {
        captureAndRecognize();
      }, 3000); // Capture every 3 seconds
    } else {
      scannedUsersRef.current.clear(); // clear memory when stopping
      if (isCompleted && isScanning) setIsScanning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, isCompleted]);

  const captureAndRecognize = useCallback(async () => {
    if (!webcamRef.current || isCompleted) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      // Call Face Service
      const faceApiUrl = import.meta.env.VITE_FACE_SERVICE_URL || 'http://localhost:8000';
      const pythonResponse = await axios.post(`${faceApiUrl}/recognize`, {
        image: imageSrc
      });

      if (pythonResponse.data && pythonResponse.data.userId) {
        const { userId } = pythonResponse.data;
        
        if (scannedUsersRef.current.has(userId)) return;

        const response = await eventsService.markAttendance(eventId, userId);
        const actualName = response?.data?.user?.name || 'Unknown User';
        
        scannedUsersRef.current.add(userId);

        playSuccessSound();
        flashScreen();
        
        // Update recent scans UI
        setRecentScans(prev => {
          if (prev.some(p => p.userId === userId)) return prev;
          return [{ userId, name: actualName, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 6); // Keep last 6
        });

        // Refresh the full table
        queryClient.invalidateQueries(['attendance', eventId]);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Recognition error:', err);
      }
    }
  }, [eventId, queryClient]);

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const flashScreen = () => {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.backgroundColor = 'rgba(74, 222, 128, 0.3)';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.5s ease-out';
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(flash);
      }, 500);
    }, 100);
  };

  const handleExport = async () => {
    try {
      const blob = await eventsService.exportAttendance(eventId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const tableColumns = [
    { label: 'Name', key: 'name', render: (row) => row.user.name },
    { label: 'Email', key: 'email', render: (row) => row.user.email },
    { label: 'Branch', key: 'branch', render: (row) => row.user.branch || 'N/A' },
    { label: 'Timestamp', key: 'timestamp', render: (row) => new Date(row.timestamp).toLocaleString() }
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Face Scanner</h1>
          <p className="text-sm text-gray-500 mt-1">Event ID: {eventId}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/dashboard/events')}>
          Back to Events
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px] lg:h-[650px]">
        {/* Scanner Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col h-full">
          {isCompleted ? (
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-xl font-bold text-gray-700">Event Completed</h3>
              <p className="text-gray-500 mt-2">Attendance is now closed for this event.</p>
            </div>
          ) : (
            <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center h-full">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              {isScanning && (
                <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse pointer-events-none"></div>
              )}
            </div>
          )}
          
          <div className="mt-4 flex justify-center flex-shrink-0">
            <Button 
              size="lg"
              variant={isScanning ? 'danger' : 'primary'}
              onClick={() => setIsScanning(!isScanning)}
              disabled={isCompleted}
            >
              {isCompleted ? 'Scanner Disabled' : isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>
          </div>
        </div>

        {/* Recent Scans Sidebar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Recent Recognitions (Last 6)</h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {recentScans.length === 0 ? (
              <p className="text-gray-500 text-center italic mt-10">No users recognized yet</p>
            ) : (
              recentScans.map((scan, index) => (
                <div key={`${scan.userId}-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                      {scan.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{scan.name}</p>
                      <p className="text-xs text-gray-500 truncate w-32">{scan.userId}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-600">{scan.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Full Attendance Record</h2>
          <Button variant="outline" onClick={handleExport} disabled={fullAttendanceList.length === 0} className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV Export
          </Button>
        </div>
        
        {attendanceLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : (
          <Table 
            columns={tableColumns} 
            data={fullAttendanceList} 
            emptyMessage="No attendance records found for this event." 
          />
        )}
      </div>
    </div>
  );
};

export default LiveScannerPage;
