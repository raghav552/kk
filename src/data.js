export const campusCenter = [23.2025, 77.4559]

// Operational points are approximate map references within the university campus.
export const campusLocations = [
  ['Main Gate', 23.1989, 77.4518],
  ['Administrative Block / Satya Bhawan', 23.2022, 77.4554],
  ['Library Block', 23.2028, 77.4565],
  ['Life Science Block', 23.2015, 77.4546],
  ['Microbiology Building', 23.2019, 77.4550],
  ['Law Block', 23.1999, 77.4548],
  ['Humanities Block', 23.1995, 77.4538],
  ['Social Science Block', 23.2000, 77.4529],
  ['Physics Block', 23.2010, 77.4526],
  ['Applied Aquaculture', 23.2015, 77.4533],
  ['Applied Geology', 23.2017, 77.4545],
  ['Institute of Open and Distance Education', 23.2020, 77.4539],
  ['C R Institute of Management', 23.2022, 77.4550],
  ['Department of Pharmacy', 23.2018, 77.4544],
  ['University Institute of Technology', 23.2023, 77.4528],
  ['Boys Hostel', 23.2030, 77.4518],
  ['Girls Hostel', 23.2028, 77.4554],
  ['Physical Education Building', 23.1990, 77.4554],
  ['Guest House', 23.1990, 77.4530],
  ['Post Office', 23.2005, 77.4522],
  ['State Bank of India Branch', 23.2008, 77.4525],
  ['Printing Press', 23.2010, 77.4540],
  ['Faculty Club', 23.2013, 77.4552],
].map(([name, latitude, longitude]) => ({ name, position: [latitude, longitude] }))

export const outsidePosition = [23.207, 77.461]
export const campusBoundary = { center: campusCenter, radius: 430 }
const shifts = ['08:00 AM - 03:00 PM', '09:00 AM - 04:00 PM', '10:00 AM - 05:00 PM', '11:00 AM - 06:00 PM', '07:00 AM - 02:00 PM']

export const createInitialFleet = () => Array.from({ length: 20 }, (_, index) => {
  const id = String(index + 1).padStart(2, '0')
  return {
    id, vehicleId: id, name: '', driverName: '', status: 'offline',
    shift: shifts[index % shifts.length], location: 'Not on duty',
    trips: 0, distance: 0, latitude: campusCenter[0], longitude: campusCenter[1],
    position: campusCenter, dutyStartedAt: null, lastSeenAt: null,
  }
})
