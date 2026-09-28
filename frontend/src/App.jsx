import { useEffect, useState } from 'react';
import { getVehicles } from './api/api';

function getColor(label) {
  if (label === 'High') return 'green';
  if (label === 'Medium') return 'orange';
  return 'red';
}

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      getVehicles().then(res => setVehicles(res.data));
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Vehicle Telemetry Dashboard</h1>

      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h3>How is the Confidence Score calculated?</h3>
        <p>Each vehicle's data is checked against five things every time new data arrives:</p>
        <ul>
          <li><b>Freshness (30%)</b> — how recent the data is</li>
          <li><b>Completeness (25%)</b> — how many fields are filled in</li>
          <li><b>GPS validity (20%)</b> — whether the location looks real</li>
          <li><b>Signal strength (15%)</b> — the reported signal value</li>
          <li><b>Consistency (10%)</b> — whether the new reading makes sense compared to the last one</li>
        </ul>
        <p>These five results are combined into one score from 0 to 100, labeled High, Medium, or Low.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {vehicles.map(v => (
          <div key={v.vehicle_id} style={{ border: '1px solid #999', padding: '15px', width: '220px' }}>
            <h3>{v.vehicle_id}</h3>
            <p>Last seen: {v.last_seen}</p>
            <p style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '12px',
              color: 'white',
              backgroundColor: getColor(v.confidence_label)
            }}>
              Score: {v.latest_score} ({v.confidence_label})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;