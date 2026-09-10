import { useCallback, useEffect, useMemo, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { campusCenter, campusBoundary, createInitialFleet, outsidePosition } from './data'
import { database, firebaseConfigured } from './lib/firebase'

const fleetRef = database ? ref(database, 'fleet') : null
const toRecord = (id, value = {}) => {
  const fallback = createInitialFleet().find(item => item.id === id)
  const latitude = Number(value.latitude) || fallback.latitude
  const longitude = Number(value.longitude) || fallback.longitude
  const distanceFromCampus = Math.hypot(latitude - campusBoundary.center[0], longitude - campusBoundary.center[1])
  const status = value.status === 'active' && distanceFromCampus > 0.0043 ? 'outside' : (value.status || fallback.status)
  return {
    ...fallback,
    ...value,
    status,
    id,
    vehicleId: id,
    name: value.driverName || value.name || '',
    driverName: value.driverName || value.name || '',
    latitude,
    longitude,
    position: [latitude, longitude],
    trips: Number(value.trips) || 0,
    distance: Number(value.distance) || 0,
  }
}

const asFirebaseFleet = snapshot => {
  const value = snapshot.val() || {}
  return initialFleet.map(driver => toRecord(driver.id, value[driver.id]))
}

const initialFleet = createInitialFleet()
const authorizedVehicleIds = new Set(initialFleet.map(driver => driver.id))

export const useFleetState = () => {
  const [drivers, setDrivers] = useState(initialFleet)
  const [firebaseError, setFirebaseError] = useState('')
  const [firebaseConnected, setFirebaseConnected] = useState(false)

  useEffect(() => {
    if (!fleetRef) return undefined
    return onValue(fleetRef, snapshot => {
      setDrivers(asFirebaseFleet(snapshot))
      setFirebaseError('')
    }, error => setFirebaseError(error.message))
  }, [])

  useEffect(() => {
    if (!database) return undefined
    return onValue(ref(database, '.info/connected'), snapshot => {
      setFirebaseConnected(snapshot.val() === true)
    }, error => setFirebaseError(error.message))
  }, [])

  useEffect(() => {
    if (!fleetRef) return
    const missing = Object.fromEntries(initialFleet.map(driver => [
      driver.id,
      {
        vehicleId: driver.id,
        status: 'offline',
        driverName: '',
        location: 'Not on duty',
        latitude: campusCenter[0],
        longitude: campusCenter[1],
        lastSeenAt: null,
        dutyStartedAt: null,
        trips: 0,
        distance: 0,
      },
    ]))
    get(fleetRef).then(snapshot => {
      const existing = snapshot.val() || {}
      const additions = Object.fromEntries(Object.entries(missing).filter(([id]) => !existing[id]))
      if (Object.keys(additions).length) return update(fleetRef, additions)
      return null
    }).catch(error => setFirebaseError(error.message))
  }, [])

  const writeVehicle = useCallback((id, changes) => {
    if (!database) return
    update(ref(database, `fleet/${id}`), changes).catch(error => setFirebaseError(error.message))
  }, [])

  const startDuty = useCallback((id, driverName, coordinates = null) => {
    const now = Date.now()
    const latitude = coordinates?.latitude || campusCenter[0]
    const longitude = coordinates?.longitude || campusCenter[1]
    writeVehicle(id, {
      vehicleId: id,
      driverName: driverName.trim(),
      status: 'active',
      latitude,
      longitude,
      location: coordinates ? 'Live device location' : 'Campus location (GPS unavailable)',
      lastSeenAt: now,
      dutyStartedAt: now,
    })
  }, [writeVehicle])

  const updateLocation = useCallback((id, coordinates) => {
    writeVehicle(id, {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      location: 'Live device location',
      lastSeenAt: Date.now(),
    })
  }, [writeVehicle])

  const endDuty = useCallback(id => writeVehicle(id, {
    status: 'offline',
    lastSeenAt: Date.now(),
  }), [writeVehicle])

  const setOutside = useCallback(id => writeVehicle(id, {
    status: 'outside',
    latitude: outsidePosition[0],
    longitude: outsidePosition[1],
    location: 'Outside Operating Zone',
    lastSeenAt: Date.now(),
  }), [writeVehicle])

  const reset = useCallback(() => {
    if (!database) return
    const resetValues = Object.fromEntries(initialFleet.map(driver => [driver.id, {
      vehicleId: driver.id, status: 'offline', driverName: '', location: 'Not on duty',
      latitude: campusCenter[0], longitude: campusCenter[1], lastSeenAt: null, dutyStartedAt: null,
      trips: 0, distance: 0,
    }]))
    update(fleetRef, resetValues).catch(error => setFirebaseError(error.message))
  }, [])

  const stats = useMemo(() => ({
    total: drivers.length,
    active: drivers.filter(driver => driver.status === 'active').length,
    offline: drivers.filter(driver => driver.status === 'offline').length,
    attention: drivers.filter(driver => driver.status === 'attention' || driver.status === 'outside' || (driver.status === 'active' && driver.lastSeenAt && Date.now() - driver.lastSeenAt > 120000)).length,
  }), [drivers])

  return { drivers, stats, startDuty, updateLocation, endDuty, setOutside, reset, firebaseConfigured, firebaseConnected, firebaseError }
}
