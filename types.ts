export interface Mine {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
}

export type RiskLevel = 'Low' | 'Medium';

export type SensorType = 'seismic' | 'gas' | 'temperature' | 'air-flow' | 'wind-speed' | 'displacement' | 'pore-pressure';

export interface SensorDataPoint {
  time: string; // ISO 8601
  value: number;
  sensorId: string;
  sensorType: SensorType;
}

export interface RockfallAlert {
  id: string;
  timestamp: string; // ISO 8601
  zoneName: string;
  riskLevel: RiskLevel;
  message: string;
  suggestedAction: string;
}

export type RockfallEventType =
  | 'Precipitation'
  | 'Crack propagation'
  | 'Blasting'
  | 'Ground vibration'
  | 'Thermal stress'
  | 'Unknown';

export interface RockfallEvent {
  id: string;
  lat: number;
  lng: number;
  type: RockfallEventType;
  volume: number; // cubic meters
  probability: number; // 0 to 1
}

export interface MineData {
  mine: Mine;
  overallRisk: RiskLevel;
  sensors: SensorDataPoint[];
  alerts: RockfallAlert[];
  rockfallEvents: RockfallEvent[];
}

export interface RiskAnalysis {
    overallAssessment: string;
    immediateOutlook: string;
    keyFactors: string[];
    recommendations: string[];
}

export interface HistoricalData {
    sensors: SensorDataPoint[];
    alerts: RockfallAlert[];
}

export interface NotificationSettings {
    email: string;
    phone: string;
    notifyOn: Record<RiskLevel, boolean>;
}

export interface ForecastSummary {
    assessment: string;
    keyDrivers: string[];
    potentialOutcomes: string[];
}

export interface ForecastData {
    forecastHours: number;
    predictedOverallRisk: RiskLevel;
    predictedAlerts: RockfallAlert[];
    predictedRockfallEvents: RockfallEvent[];
    summary: ForecastSummary;
}