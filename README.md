# Vehicle Telemetry Dashboard

A dashboard that shows live vehicle telemetry and a Confidence Score telling you how trustworthy each vehicle's latest data is.

## Live links
- Dashboard: https://vehicle-telemetry.vercel.app
- Backend API: https://vehicle-telemetry-coyn.onrender.com

## Technologies
- React (Vite): the dashboard
- Node.js with Express: the backend API
- MySQL (hosted on Aiven): the database

## API
- POST /api/telemetry: receives a telemetry packet, calculates its confidence score, and saves it
- GET /api/vehicles: lists all vehicles with their latest score and label
- GET /api/vehicles/:id: returns one vehicle and its last 50 readings

## Telemetry Confidence Score
Every packet gets a score from 0 to 100, made from five checks:

| Check | Weight | What it looks at |
|---|---|---|
| Freshness | 30% | How old the timestamp is |
| Completeness | 25% | How many of the six data fields are filled in |
| GPS validity | 20% | Whether latitude and longitude exist and are real (0,0 counts as a fault) |
| Signal strength | 15% | The reported signal value, limited to 0 to 100 |
| Consistency | 10% | Whether the speed change from the last reading is physically possible |

Score = 0.30 x Freshness + 0.25 x Completeness + 0.20 x GPS + 0.15 x Signal + 0.10 x Consistency

Labels: 80 and above is High, 50 to 79 is Medium, below 50 is Low.

## Run locally
1. Create a MySQL database and run the table code in database.sql
2. In the backend folder, create a .env file with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
3. Backend: cd backend, npm install, node server.js
4. Frontend: cd frontend, npm install, npm run dev