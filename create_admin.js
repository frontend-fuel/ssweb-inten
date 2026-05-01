const mongoose = require('mongoose');
const Admin = require('./server/models/Admin');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate_system')
  .then(async () => {
    console.log('MongoDB Connected');
    
    const username = 'yarrusasi';
    const password = 'sasi@939';
    
    try {
      const adminExists = await Admin.findOne({ username });
      if (adminExists) {
        console.log('Admin already exists');
        process.exit(0);
      }
      
      await Admin.create({ username, password });
      console.log(`Admin ${username} created successfully`);
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
