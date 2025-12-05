import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { toast } from 'react-toastify';
import './QRScanner.css';

const QRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanning]);

  const initializeScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      onScanSuccess,
      onScanError
    );
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    if (scanning) {
      setScanning(false);
      setLoading(true);
      
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      try {
        const deviceInfo = {
          user_agent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        };

        const response = await axios.post('/api/attendance/scan', {
          session_id: decodedText,
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

  const onScanError = (error) => {
    console.warn(`Code scan error = ${error}`);
    // Don't show error to user for normal scanning process
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
            <div id="qr-reader" style={{ width: '100%' }}></div>
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
                <p><strong>Status:</strong> 
                  <span className={`status-badge status-${result.data.status}`}>
                    {result.data.status}
                  </span>
                </p>
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
            <li>Ensure good lighting conditions</li>
            <li>Hold your device steady</li>
            <li>Position QR code within the scanning box</li>
            <li>Allow camera permissions when prompted</li>
            <li>Works best on mobile devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
