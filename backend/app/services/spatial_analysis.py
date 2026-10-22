import math
from typing import Dict, Any, List, Optional, Tuple

def calculate_euclidean_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculates Euclidean pixel distance: d = sqrt((x2 - x1)^2 + (y2 - y1)^2)"""
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def calculate_real_world_distance(pixel_distance: float, resolution_m_per_px: float) -> Tuple[float, float]:
    """
    Real Distance = Pixel Distance * Resolution (meters)
    Returns: (real_distance_m, real_distance_km)
    """
    real_m = pixel_distance * resolution_m_per_px
    real_km = real_m / 1000.0
    return round(real_m, 2), round(real_km, 2)

def pixel_to_real_distance(pixel_distance: float, meters_per_pixel: float, unit: str = "km") -> float:
    """
    Converts pixel distance to real-world ground distance in requested unit (m, km, mi).
    """
    meters = pixel_distance * meters_per_pixel
    unit_lower = unit.lower().strip()
    if unit_lower in ("m", "meters", "meter"):
        return round(meters, 2)
    elif unit_lower in ("mi", "miles", "mile"):
        return round(meters / 1609.344, 3)
    else:  # default km
        return round(meters / 1000.0, 3)

def calculate_crater_centroid(bbox: List[float]) -> Tuple[float, float]:
    """
    Calculates centroid (x_center, y_center) from bounding box [x_min, y_min, x_max, y_max].
    """
    if len(bbox) >= 4:
        x_center = (bbox[0] + bbox[2]) / 2.0
        y_center = (bbox[1] + bbox[3]) / 2.0
        return round(x_center, 1), round(y_center, 1)
    return 0.0, 0.0

def calculate_nearest_crater(
    target_crater: Dict[str, Any],
    all_craters: List[Dict[str, Any]],
    resolution_m_per_px: float = 10.0
) -> Optional[Dict[str, Any]]:
    """
    Finds the closest neighbor crater to target_crater from a list of craters.
    """
    tx, ty = float(target_crater["x"]), float(target_crater["y"])
    tid = target_crater.get("id")
    nearest = None
    min_dist = float("inf")

    for c in all_craters:
        if c.get("id") == tid:
            continue
        cx, cy = float(c["x"]), float(c["y"])
        dist = calculate_euclidean_distance(tx, ty, cx, cy)
        if dist < min_dist:
            min_dist = dist
            nearest = c

    if nearest:
        real_m, real_km = calculate_real_world_distance(min_dist, resolution_m_per_px)
        return {
            "nearest_crater_id": nearest.get("id"),
            "nearest_crater_name": nearest.get("name"),
            "pixel_distance": round(min_dist, 2),
            "real_distance_km": real_km,
            "real_distance_m": real_m
        }
    return None

def calculate_crater_density(
    craters: List[Dict[str, Any]],
    image_width: int,
    image_height: int,
    resolution_m_per_px: float = 10.0
) -> Dict[str, Any]:
    """
    Calculates geological crater areal density (craters per 100 km² and craters per km²).
    """
    total_craters = len(craters)
    width_km = (image_width * resolution_m_per_px) / 1000.0
    height_km = (image_height * resolution_m_per_px) / 1000.0
    area_km2 = max(0.001, width_km * height_km)
    density_per_100_km2 = (total_craters / area_km2) * 100.0

    return {
        "total_craters": total_craters,
        "image_area_km2": round(area_km2, 2),
        "craters_per_km2": round(total_craters / area_km2, 4),
        "craters_per_100km2": round(density_per_100_km2, 2)
    }

def compute_spatial_measurement(
    crater_a: Dict[str, Any],
    crater_b: Dict[str, Any],
    resolution_m_per_px: float = 10.0,
    unit: str = "km"
) -> Dict[str, Any]:
    """
    Computes complete mathematical spatial analysis between two crater points with multi-unit support.
    """
    x1, y1 = float(crater_a["x"]), float(crater_a["y"])
    x2, y2 = float(crater_b["x"]), float(crater_b["y"])

    pixel_distance = calculate_euclidean_distance(x1, y1, x2, y2)
    real_m, real_km = calculate_real_world_distance(pixel_distance, resolution_m_per_px)
    real_mi = round(real_m / 1609.344, 2)

    formatted_display = f"{real_km:.2f} KM"
    if unit.lower() in ("m", "meters"):
        formatted_display = f"{real_m:.1f} M"
    elif unit.lower() in ("mi", "miles"):
        formatted_display = f"{real_mi:.2f} MI"

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
        "real_distance_mi": real_mi,
        "formatted_display_km": f"{real_km:.2f} KM",
        "formatted_display": formatted_display
    }

def compute_all_pairwise_distances(
    craters: List[Dict[str, Any]],
    resolution_m_per_px: float = 10.0,
    unit: str = "km"
) -> List[Dict[str, Any]]:
    """Calculates all pairwise spatial distances between consecutive or key crater pairs."""
    measurements = []
    n = len(craters)
    for i in range(n):
        for j in range(i + 1, min(i + 4, n)):
            meas = compute_spatial_measurement(craters[i], craters[j], resolution_m_per_px, unit)
            measurements.append(meas)
    return measurements

calculate_pairwise_distances = compute_all_pairwise_distances
