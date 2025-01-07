
const userModel = require('../app/models/adminmodel.js');
const logger = require('../config/logger.js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const seedAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const existingAdmin = await userModel.findOne({ email });
    
    if (existingAdmin) {
      logger.info('Admin user already exists');
    } else {
      const adminPassword = process.env.PASSWORD;
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
      const adminUser = new userModel({
        email,
        password: hashedPassword,
        userType: 'SuperAdmin', 
      });
      await adminUser.save();
      logger.info('Admin user created successfully with all privileges')
    }
  } catch (error) {
    logger.error('Error creating or updating admin user', error);
  }
};

module.exports = {seedAdminUser};
