export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  favorite_planet: string;
  created_at: string;
  analyses_count: number;
}

export interface CraterItem {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  diameter_px: number;
  diameter_km: number;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface SpatialMeasurement {
  crater_a_id: string;
  crater_a_name: string;
  crater_a_coords: { x: number; y: number };
  crater_b_id: string;
  crater_b_name: string;
  crater_b_coords: { x: number; y: number };
  pixel_distance: number;
  resolution_m_per_px: number;
  real_distance_m: number;
  real_distance_km: number;
  formatted_display_km: string;
}

export type ValidationState = 'INVALID' | 'VALID_NO_CRATER' | 'VALID_CRATER_DETECTED';

export interface ValidationDetails {
  rejection_reason?: string;
  face_count?: number;
  line_count?: number;
  mean_saturation?: number;
  laplacian_var?: number;
  vegetation_ratio?: number;
  sky_water_ratio?: number;
  resolution?: string;
  is_lunar?: boolean;
  is_martian?: boolean;
}

export interface AnalysisRecord {
  id: string;
  filename: string;
  image_url: string;
  planet: string;
  planet_confidence?: number;
  validation_state: ValidationState;
  validation_message: string;
  validation_details?: {
    is_valid: boolean;
    state: string;
    title: string;
    message: string;
    detected_planet: string;
    planet_confidence: number;
    details: ValidationDetails;
  };
  classification_label: 'CRATER' | 'NON-CRATER' | 'INVALID';
  classification_confidence: number;
  crater_count: number;
  average_confidence: number;
  resolution_m_per_px: number;
  craters: CraterItem[];
  spatial_measurements: SpatialMeasurement[];
  report_url?: string;
  created_at: string;
}

export interface PortalStats {
  total_analyses: number;
  craters_detected: number;
  average_confidence: number;
  spatial_measurements: number;
  recent_analyses: AnalysisRecord[];
}

export interface ModelPerformanceMetrics {
  architecture: string;
  classification_classes: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  validation_accuracy: number;
  validation_loss: number;
  confusion_matrix: {
    True_Crater: { Pred_Crater: number; Pred_NonCrater: number };
    True_NonCrater: { Pred_Crater: number; Pred_NonCrater: number };
  };
  dataset_name: string;
  total_samples_evaluated: number;
  training_epochs: number;
  status: string;
}

export interface SampleImageSpecimen {
  id: string;
  name: string;
  planet: string;
  type: string;
  description: string;
  expected_state: string;
  filename: string;
}
