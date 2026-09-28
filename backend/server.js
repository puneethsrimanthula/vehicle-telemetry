const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const calculateConfidenceScore = require('./services/confidenceScore');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint 1: receive telemetry data
app.post('/api/telemetry', async (req, res) => {
  try {
    const packet = req.body;

    // make sure the vehicle exists in the vehicles table
    await pool.query(
      'INSERT INTO vehicles (vehicle_id, last_seen) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE last_seen = NOW()',
      [packet.vehicle_id]
    );

    // get the previous reading for this vehicle, to check consistency
    const [previousRows] = await pool.query(
      'SELECT * FROM telemetry WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT 1',
      [packet.vehicle_id]
    );
    const previousPacket = previousRows[0] || null;

    const result = calculateConfidenceScore(packet, previousPacket);

    await pool.query(
      `INSERT INTO telemetry
        (vehicle_id, timestamp, speed, battery, signal_strength, latitude, longitude, sensor_value, confidence_score, confidence_label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [packet.vehicle_id, packet.timestamp, packet.speed, packet.battery, packet.signal_strength,
       packet.latitude, packet.longitude, packet.sensor_value, result.score, result.label]
    );

    await pool.query(
      'UPDATE vehicles SET latest_score = ? WHERE vehicle_id = ?',
      [result.score, packet.vehicle_id]
    );

    res.status(201).json({ message: 'Telemetry saved', confidence: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint 2: list all vehicles
app.get('/api/vehicles', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.*,
       (SELECT confidence_label FROM telemetry t
        WHERE t.vehicle_id = v.vehicle_id
        ORDER BY t.timestamp DESC LIMIT 1) AS confidence_label
     FROM vehicles v`
  );
  res.json(rows);
});

// Endpoint 3: one vehicle's details and history
app.get('/api/vehicles/:id', async (req, res) => {
  const [vehicleRows] = await pool.query('SELECT * FROM vehicles WHERE vehicle_id = ?', [req.params.id]);
  const [historyRows] = await pool.query(
    'SELECT * FROM telemetry WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT 50',
    [req.params.id]
  );
  res.json({ vehicle: vehicleRows[0], history: historyRows });
});

app.listen(5000, () => console.log('Backend server running on http://localhost:5000'));