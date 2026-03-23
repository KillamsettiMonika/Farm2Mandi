const mongoose = require('mongoose');
require('dotenv').config();

const Driver = require('./models/Driver');

async function checkDrivers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const drivers = await Driver.find({}).select('-password');
    
    console.log(`Total drivers in database: ${drivers.length}\n`);
    
    if (drivers.length === 0) {
      console.log('No drivers found! Please run: node seedDrivers.js');
    } else {
      console.log('Driver Details:');
      console.log('='.repeat(80));
      drivers.forEach((driver, i) => {
        console.log(`${i + 1}. ${driver.name}`);
        console.log(`   Email: ${driver.email}`);
        console.log(`   Vehicle: ${driver.vehicleType} (${driver.vehicleNumber})`);
        console.log(`   Capacity: ${driver.vehicleCapacityKg} kg`);
        console.log(`   Current Mandal: ${driver.currentMandal}`);
        console.log(`   Available: ${driver.isAvailable}`);
        console.log(`   Status: ${driver.status}`);
        console.log(`   Location: ${driver.locationName || 'Not set'}`);
        console.log('');
      });
      
      // Check for available drivers in Vijayawada
      const vijayawadaDrivers = drivers.filter(d => 
        d.currentMandal === 'Vijayawada' && 
        d.isAvailable === true && 
        d.vehicleCapacityKg >= 1000
      );
      
      console.log('='.repeat(80));
      console.log(`Available drivers in Vijayawada with capacity >= 1000kg: ${vijayawadaDrivers.length}`);
      vijayawadaDrivers.forEach(d => {
        console.log(`  - ${d.name} (${d.vehicleType}, ${d.vehicleCapacityKg}kg)`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDrivers();
