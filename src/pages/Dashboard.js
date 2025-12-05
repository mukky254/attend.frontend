import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, attendanceRes, classesRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/attendance/my-attendance'),
        axios.get('/api/classes/today')
      ]);

      setStats(statsRes.data.stats);
      setRecentAttendance(attendanceRes.data.attendance?.slice(0, 5) || []);
      setTodayClasses(classesRes.data.classes || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name || user?.email}!</h1>
      <p className="user-role">Role: {user?.role}</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        {user?.role === 'student' && (
          <>
            <div className="stat-card">
              <h3>Total Classes</h3>
              <p className="stat-number">{stats.total_classes || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Attended</h3>
              <p className="stat-number">{stats.attended_classes || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Attendance Rate</h3>
              <p className="stat-number">{stats.attendance_rate || 0}%</p>
            </div>
          </>
        )}

        {user?.role === 'lecturer' && (
          <>
            <div className="stat-card">
              <h3>Courses</h3>
              <p className="stat-number">{stats.total_courses || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Sessions</h3>
              <p className="stat-number">{stats.total_sessions || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Students</h3>
              <p className="stat-number">{stats.total_students || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {user?.role === 'student' && (
            <>
              <a href="/scan" className="action-card">
                <div className="action-icon">📷</div>
                <h4>Scan QR Code</h4>
                <p>Mark your attendance</p>
              </a>
              <a href="/attendance" className="action-card">
                <div className="action-icon">📊</div>
                <h4>View Attendance</h4>
                <p>Check your records</p>
              </a>
            </>
          )}

          {user?.role === 'lecturer' && (
            <>
              <a href="/generate-qr" className="action-card">
                <div className="action-icon">🎫</div>
                <h4>Generate QR</h4>
                <p>Create attendance QR</p>
              </a>
              <a href="/courses" className="action-card">
                <div className="action-icon">📚</div>
                <h4>Manage Courses</h4>
                <p>View your courses</p>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentAttendance.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.class_session?.course?.course_code}</td>
                  <td>{new Date(record.scan_time).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent activity</p>
        )}
      </div>

      {/* Today's Classes */}
      {todayClasses.length > 0 && (
        <div className="todays-classes">
          <h2>Today's Classes</h2>
          <div className="classes-list">
            {todayClasses.map((classItem) => (
              <div key={classItem._id} className="class-card">
                <h4>{classItem.course?.course_code}</h4>
                <p>{classItem.course?.course_name}</p>
                <p>
                  <strong>Time:</strong> {classItem.start_time} - {classItem.end_time}
                </p>
                <p>
                  <strong>Venue:</strong> {classItem.venue}
                </p>
                <span className={`status-badge status-${classItem.status}`}>
                  {classItem.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
