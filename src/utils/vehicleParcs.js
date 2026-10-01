export function getVehicleParcs(vehicle) {
  if (Array.isArray(vehicle?.parcs)) return vehicle.parcs.filter(Boolean)
  return vehicle?.parc ? [vehicle.parc] : []
}

export function getVehicleParcIds(vehicle) {
  return [...new Set(getVehicleParcs(vehicle).map(parc => typeof parc === 'string' ? parc : parc._id).filter(Boolean))]
}
