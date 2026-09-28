function calculateConfidenceScore(packet, previousPacket) {
  // 1. Freshness: how old is the data?
  const ageSeconds = (Date.now() - new Date(packet.timestamp).getTime()) / 1000;
  let freshnessScore;
  if (ageSeconds <= 30) freshnessScore = 100;
  else if (ageSeconds <= 120) freshnessScore = 80;
  else if (ageSeconds <= 300) freshnessScore = 50;
  else if (ageSeconds <= 900) freshnessScore = 20;
  else freshnessScore = 5;

  // 2. Completeness: are all fields filled in?
  const fields = ['speed', 'battery', 'signal_strength', 'latitude', 'longitude', 'sensor_value'];
  const presentCount = fields.filter(f => packet[f] !== null && packet[f] !== undefined && packet[f] !== '').length;
  const completenessScore = (presentCount / fields.length) * 100;

  // 3. GPS validity: is the location real?
  let gpsScore;
  const lat = packet.latitude, lon = packet.longitude;
  if (lat === null || lon === null || lat === undefined || lon === undefined) gpsScore = 0;
  else if (lat < -90 || lat > 90 || lon < -180 || lon > 180) gpsScore = 0;
  else if (lat === 0 && lon === 0) gpsScore = 20;
  else gpsScore = 100;

  // 4. Signal strength: direct value, capped between 0 and 100
  let signalScore = packet.signal_strength;
  if (signalScore === null || signalScore === undefined) signalScore = 0;
  signalScore = Math.max(0, Math.min(100, signalScore));

  // 5. Consistency: does this reading make physical sense compared to the last one?
  let consistencyScore = 70; // default when there is no previous reading to compare
  if (previousPacket) {
    const deltaSpeed = Math.abs(packet.speed - previousPacket.speed);
    const deltaTime = (new Date(packet.timestamp) - new Date(previousPacket.timestamp)) / 1000;
    if (deltaTime > 0) {
      const impliedAccel = deltaSpeed / deltaTime;
      if (impliedAccel <= 10) consistencyScore = 100;
      else if (impliedAccel <= 25) consistencyScore = 60;
      else consistencyScore = 20;
    }
  }

  // Final weighted score
  const finalScore = Math.round(
    0.30 * freshnessScore +
    0.25 * completenessScore +
    0.20 * gpsScore +
    0.15 * signalScore +
    0.10 * consistencyScore
  );

  let label;
  if (finalScore >= 80) label = 'High';
  else if (finalScore >= 50) label = 'Medium';
  else label = 'Low';

  return {
    score: finalScore,
    label: label,
    breakdown: { freshnessScore, completenessScore, gpsScore, signalScore, consistencyScore }
  };
}

module.exports = calculateConfidenceScore;