import math
from typing import Dict, Any, List

def calculate_euclidean_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculates Euclidean pixel distance: d = sqrt((x2 - x1)^2 + (y2 - y1)^2)"""
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def calculate_real_world_distance(pixel_distance: float, resolution_m_per_px: float) -> tuple[float, float]:
    """
    Real Distance = Pixel Distance * Resolution (meters)
    Returns: (real_distance_m, real_distance_km)
    """
    real_m = pixel_distance * resolution_m_per_px
    real_km = real_m / 1000.0
    return round(real_m, 2), round(real_km, 2)

def compute_spatial_measurement(
    crater_a: Dict[str, Any],
    crater_b: Dict[str, Any],
    resolution_m_per_px: float = 10.0
) -> Dict[str, Any]:
    """
    Computes complete mathematical spatial analysis between two crater points.
    """
    x1, y1 = float(crater_a["x"]), float(crater_a["y"])
    x2, y2 = float(crater_b["x"]), float(crater_b["y"])

    pixel_distance = calculate_euclidean_distance(x1, y1, x2, y2)
    real_m, real_km = calculate_real_world_distance(pixel_distance, resolution_m_per_px)

    return {
        "crater_a_id": crater_a.get("id", "A"),
        "crater_a_name": crater_a.get("name", "Crater A"),
        "crater_a_coords": {"x": x1, "y": y1},
        "crater_b_id": crater_b.get("id", "B"),
        "crater_b_name": crater_b.get("name", "Crater B"),
        "crater_b_coords": {"x": x2, "y": y2},
        "pixel_distance": round(pixel_distance, 2),
        "resolution_m_per_px": resolution_m_per_px,
        "real_distance_m": real_m,
        "real_distance_km": real_km,
        "formatted_display_km": f"{real_km:.2f} KM"
    }

def compute_all_pairwise_distances(craters: List[Dict[str, Any]], resolution_m_per_px: float = 10.0) -> List[Dict[str, Any]]:
    """Calculates all pairwise spatial distances between consecutive or key crater pairs."""
    measurements = []
    n = len(craters)
    for i in range(n):
        for j in range(i + 1, min(i + 4, n)):
            meas = compute_spatial_measurement(craters[i], craters[j], resolution_m_per_px)
            measurements.append(meas)
    return measurements
