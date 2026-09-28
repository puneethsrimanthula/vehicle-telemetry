CREATE DATABASE vehicle_telemetry;
USE vehicle_telemetry;

CREATE TABLE vehicles (
  vehicle_id       VARCHAR(20) PRIMARY KEY,
  name             VARCHAR(100),
  last_seen        DATETIME,
  latest_score     INT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telemetry (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id       VARCHAR(20),
  timestamp        DATETIME,
  speed            FLOAT,
  battery          FLOAT,
  signal_strength  FLOAT,
  latitude         FLOAT,
  longitude        FLOAT,
  sensor_value     FLOAT,
  confidence_score INT,
  confidence_label VARCHAR(10),
  received_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);