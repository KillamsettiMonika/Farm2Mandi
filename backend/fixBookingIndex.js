const mongoose = require('mongoose');
require('dotenv').config();

async function fixBookingIndex() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB || 'farm2mandi';
    
    console.log(`Connecting to database: ${dbName}...`);
    await mongoose.connect(mongoUri, { dbName });
    console.log('✓ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Check if bookings collection exists
    const collections = await db.listCollections({ name: 'bookings' }).toArray();
    
    if (collections.length === 0) {
      console.log('⚠ Bookings collection does not exist yet.');
      console.log('✓ This is fine - it will be created when you make your first booking.');
      console.log('\n✅ No index issues to fix!');
      console.log('You can now restart the backend with: npm start\n');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    const collection = db.collection('bookings');

    // Get all indexes
    console.log('Checking current indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name).join(', '));

    // Check if bookingId_1 index exists
    const hasBookingIdIndex = indexes.some(i => i.name === 'bookingId_1');

    if (hasBookingIdIndex) {
      console.log('\n⚠ Found problematic bookingId_1 index. Dropping it...');
      try {
        await collection.dropIndex('bookingId_1');
        console.log('✓ Successfully dropped bookingId_1 index');
      } catch (err) {
        console.error('✗ Error dropping index:', err.message);
        
        // If dropping the single index fails, try dropping and recreating the collection
        console.log('\n⚠ Trying alternative method: drop and recreate collection...');
        console.log('⚠ WARNING: This will delete all existing bookings!');
        
        try {
          await collection.drop();
          console.log('✓ Dropped bookings collection');
          await db.createCollection('bookings');
          console.log('✓ Recreated bookings collection');
          console.log('✓ All problematic indexes removed');
        } catch (dropErr) {
          console.error('✗ Error dropping collection:', dropErr.message);
          throw dropErr;
        }
      }
    } else {
      console.log('\n✓ bookingId_1 index does not exist (good!)');
    }

    // Show final indexes
    const finalIndexes = await collection.indexes();
    console.log('\nFinal indexes:', finalIndexes.map(i => i.name).join(', '));

    console.log('\n✅ Database fixed successfully!');
    console.log('You can now restart the backend with: npm start\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

fixBookingIndex();
