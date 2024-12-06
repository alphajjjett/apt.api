import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VehicleReturnPage = () => {
  const [returns, setReturns] = useState([]);
  const [bookingId, setBookingId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [condition, setCondition] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Fetch all vehicle returns
    const fetchReturns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/returns');
        setReturns(response.data);
      } catch (error) {
        setError('Error fetching returns');
      }
    };
    fetchReturns();
  }, []);

  const handleCreateReturn = async () => {
    try {
      const newReturn = {
        booking_id: bookingId,
        vehicle_id: vehicleId,
        return_date: returnDate,
        condition,
        fuel_level: fuelLevel,
        remark,
      };

      await axios.post('http://localhost:5000/api/returns', newReturn);
      setReturns([...returns, newReturn]);
      setError('');
      alert('Vehicle Return Created Successfully');
    } catch (error) {
      setError('Error creating return');
    }
  };

  return (
    <div>
      <h2>Vehicle Return Page</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h3>Create Vehicle Return</h3>
        <label>Booking ID: 
          <input type="text" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
        </label><br/>
        <label>Vehicle ID: 
          <input type="text" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
        </label><br/>
        <label>Return Date: 
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        </label><br/>
        <label>Condition: 
          <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)} />
        </label><br/>
        <label>Fuel Level: 
          <input type="number" value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)} />
        </label><br/>
        <label>Remark: 
          <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
        </label><br/>
        <button onClick={handleCreateReturn}>Create Return</button>
      </div>

      <div>
        <h3>Existing Returns</h3>
        <ul>
          {returns.map((returnItem) => (
            <li key={returnItem._id}>
              <p>Booking ID: {returnItem.booking_id._id}</p>
              <p>Vehicle ID: {returnItem.vehicle_id._id}</p>
              <p>User ID: {returnItem.user_id._id}</p>
              <p>Return Date: {new Date(returnItem.return_date).toLocaleDateString()}</p>
              <p>Condition: {returnItem.condition}</p>
              <p>Fuel Level: {returnItem.fuel_level}</p>
              <p>Remark: {returnItem.remark}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VehicleReturnPage;
