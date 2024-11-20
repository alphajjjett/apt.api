import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Maintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/maintenance', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMaintenanceRecords(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMaintenanceRecords();
  }, []);

  return (
    <div>
      <h2>Maintenance Records</h2>
      <table>
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>Description</th>
            <th>Maintenance Date</th>
            <th>Next Due</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceRecords.map((record) => (
            <tr key={record._id}>
              <td>{record.vehicle_id}</td>
              <td>{record.description}</td>
              <td>{record.maintenance_date}</td>
              <td>{record.next_due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Maintenance;
