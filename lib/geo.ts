import * as THREE from 'three';

/**
 * Converts latitude/longitude to a point on a sphere of `radius`.
 *
 * The globe is oriented so that longitude 0° faces +Z (toward the camera when
 * the group's Y-rotation is 0), which lets us aim the default view at the
 * Atlantic — Toronto on the left, London and Colombo swinging in from the right.
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Builds a great-circle arc between two surface points, lifted off the sphere
 * so it reads as a flight path rather than a line drawn on the surface.
 *
 * The lift scales with angular distance: neighbouring cities (Colombo → Kandy)
 * stay tight to the surface while intercontinental routes bow out. Without
 * this, short hops look like they are floating for no reason.
 */
export function greatCircleArc(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  segments: number,
): THREE.CatmullRomCurve3 {
  const angle = start.angleTo(end);
  // 0 for coincident points, ~0.45 for antipodal.
  const lift = 1 + (angle / Math.PI) * 0.9;

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    // Spherical interpolation keeps the path on a true great circle.
    const point = new THREE.Vector3().copy(start).lerp(end, t).normalize();
    // A sine bell raises the middle of the arc and leaves both ends on the
    // surface, so arcs meet their city markers exactly.
    const altitude = radius * (1 + (lift - 1) * Math.sin(Math.PI * t));
    points.push(point.multiplyScalar(altitude));
  }

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}
