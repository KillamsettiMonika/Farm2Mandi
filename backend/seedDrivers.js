const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Driver = require('./models/Driver');

const sampleDrivers = [
  {
    name: 'Suresh Reddy',
    email: 'suresh.driver@example.com',
    password: 'driver123',
    phone: '9876543210',
    driverId: 'DRV001',
    vehicleType: 'Mini Truck',
    vehicleNumber: 'AP16AB1234',
    vehicleCapacityKg: 2000,
    costPerKm: 8.5,
    currentMandal: 'Vijayawada',
    isAvailable: true,
    status: 'Idle',
    rating: 4.0,
    totalTrips: 0,
    currentLocation: {
      latitude: 16.5062,
      longitude: 80.6480
    },
    locationName: 'Vijayawada, Andhra Pradesh'
  },
  {
    name: 'Ravi Kumar',
    email: 'ravi.driver@example.com',
    password: 'driver123',
    phone: '9876543211',
    driverId: 'DRV002',
    vehicleType: 'Pickup Van',
    vehicleNumber: 'AP09CD5678',
    vehicleCapacityKg: 1500,
    costPerKm: 7.0,
    currentMandal: 'Guntur',
    isAvailable: true,
    status: 'Idle',
    rating: 4.5,
    totalTrips: 15,
    currentLocation: {
      latitude: 16.3067,
      longitude: 80.4365
    },
    locationName: 'Guntur, Andhra Pradesh'
  },
  {
    name: 'Venkat Rao',
    email: 'venkat.driver@example.com',
    password: 'driver123',
    phone: '9876543212',
    driverId: 'DRV003',
    vehicleType: 'Lorry',
    vehicleNumber: 'AP28EF9012',
    vehicleCapacityKg: 3000,
    costPerKm: 10.0,
    currentMandal: 'Vijayawada',
    isAvailable: true,
    status: 'Idle',
    rating: 4.2,
    totalTrips: 25,
    currentLocation: {
      latitude: 16.5167,
      longitude: 80.6420
    },
    locationName: 'Vijayawada, Andhra Pradesh'
  },
  {
    name: 'Krishna Murthy',
    email: 'krishna.driver@example.com',
    password: 'driver123',
    phone: '9876543213',
    driverId: 'DRV004',
    vehicleType: 'Tractor',
    vehicleNumber: 'AP16GH3456',
    vehicleCapacityKg: 1800,
    costPerKm: 7.5,
    currentMandal: 'Vijayawada',
    isAvailable: true,
    status: 'Idle',
    rating: 4.7,
    totalTrips: 40,
    currentLocation: {
      latitude: 16.4950,
      longitude: 80.6500
    },
    locationName: 'Vijayawada, Andhra Pradesh'
  },
  {
    name: 'Srinu Naidu',
    email: 'srinu.driver@example.com',
    password: 'driver123',
    phone: '9876543214',
    driverId: 'DRV005',
    vehicleType: 'Container',
    vehicleNumber: 'AP09IJ7890',
    vehicleCapacityKg: 2500,
    costPerKm: 9.0,
    currentMandal: 'Guntur',
    isAvailable: true,
    status: 'Idle',
    rating: 3.8,
    totalTrips: 12,
    currentLocation: {
      latitude: 16.3100,
      longitude: 80.4400
    },
    locationName: 'Guntur, Andhra Pradesh'
  }
];

async function seedDrivers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing drivers (optional - comment out if you want to keep existing data)
    // await Driver.deleteMany({});
    // console.log('Cleared existing drivers');

    // Hash passwords and create drivers
    for (const driverData of sampleDrivers) {
      // Check if driver already exists
      const existingDriver = await Driver.findOne({ email: driverData.email });
      
      if (existingDriver) {
        console.log(`Driver ${driverData.name} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(driverData.password, 10);
      
      // Create driver
      const driver = new Driver({
        ...driverData,
        password: hashedPassword
      });

      await driver.save();
      console.log(`✓ Created driver: ${driver.name} (${driver.email})`);
    }

    console.log('\n✓ Successfully seeded driver data!');
    console.log('\nTest credentials (password for all: driver123):');
    sampleDrivers.forEach(d => {
      console.log(`  - ${d.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding drivers:', error);
    process.exit(1);
  }
}

seedDrivers();
