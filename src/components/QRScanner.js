import React, { useState, useRef } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { toast } from 'react-toastify';

const QRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (data) => {
    if (data && scanning) {
      setScanning(false);
      setLoading(true);
      
      try {
        const deviceInfo = {
          user_agent: navigator.userAgent,
          platform: navigator.platform
        };

        const response = await axios.post('/api/attendance/scan', {
          session_id: data,
          device_info: deviceInfo
        });

        if (response.data.success) {
          setResult({
            success: true,
            message: 'Attendance marked successfully!',
            data: response.data.attendance
          });
          toast.success('Attendance marked successfully!');
        }
      } catch (error) {
        setResult({
          success: false,
          message: error.response?.data?.error || 'Failed to mark attendance'
        });
        toast.error(error.response?.data?.error || 'Failed to mark attendance');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    toast.error('Error accessing camera');
  };

  const resetScanner = () => {
    setScanning(true);
    setResult(null);
  };

  return (
    <div className="qr-scanner-container">
      <div className="card">
        <h2>Scan QR Code for Attendance</h2>
        <p className="text-muted">Point your camera at the lecturer's QR code</p>
        
        {scanning && !loading && (
          <div className="scanner-wrapper">
            <QrScanner
              onDecode={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment'
              }}
              scanDelay={1000}
            />
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing attendance...</p>
          </div>
        )}

        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            <h3>{result.success ? '✓ Success' : '✗ Error'}</h3>
            <p>{result.message}</p>
            
            {result.success && result.data && (
              <div className="attendance-details">
                <p><strong>Course:</strong> {result.data.course}</p>
                <p><strong>Time:</strong> {new Date(result.data.time).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className={`status-${result.data.status}`}>{result.data.status}</span></p>
              </div>
            )}
            
            <button onClick={resetScanner} className="btn btn-primary">
              Scan Another QR Code
            </button>
          </div>
        )}

        <div className="scanner-instructions">
          <h4>Instructions:</h4>
          <ul>
            <li>Ensure good lighting</li>
            <li>Hold steady while scanning</li>
            <li>Make sure QR code is within frame</li>
            <li>Allow camera permissions if prompted</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
