const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/certificate_system';
const CLOUD_URI = process.env.MONGODB_URI;

const migrate = async () => {
    try {
        console.log('🚀 Starting Clean Migration (Bypassing Hooks)...');

        // 1. Connect to Local
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Connected to Local MongoDB');

        // 2. Fetch all data using lean objects
        const students = await localConn.collection('students').find({}).toArray();
        const certs = await localConn.collection('certificates').find({}).toArray();
        const admins = await localConn.collection('admins').find({}).toArray();
        const modules = await localConn.collection('modules').find({}).toArray();
        const courses = await localConn.collection('courses').find({}).toArray();

        console.log(`📊 Found: ${students.length} Students, ${certs.length} Certificates, ${admins.length} Admins, ${modules.length} Modules`);

        // 3. Connect to Cloud
        const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
        console.log('✅ Connected to Cloud MongoDB Atlas');

        // 4. Transfer using raw collection methods to BYPASS Mongoose hooks (Prevent double-hashing)
        if (students.length > 0) {
            console.log('⌛ Migrating Students (Raw)...');
            await cloudConn.collection('students').deleteMany({});
            await cloudConn.collection('students').insertMany(students);
            console.log('✅ Students Migrated');
        }

        if (certs.length > 0) {
            console.log('⌛ Migrating Certificates (Raw)...');
            await cloudConn.collection('certificates').deleteMany({});
            await cloudConn.collection('certificates').insertMany(certs);
            console.log('✅ Certificates Migrated');
        }

        if (admins.length > 0) {
            console.log('⌛ Migrating Admins (Raw)...');
            await cloudConn.collection('admins').deleteMany({});
            await cloudConn.collection('admins').insertMany(admins);
            console.log('✅ Admins Migrated');
        }

        if (modules.length > 0) {
            console.log('⌛ Migrating Curriculum Modules (Raw)...');
            await cloudConn.collection('modules').deleteMany({});
            await cloudConn.collection('modules').insertMany(modules);
            console.log('✅ Curriculum Migrated');
        }

        if (courses.length > 0) {
            console.log('⌛ Migrating Course Templates (Raw)...');
            await cloudConn.collection('courses').deleteMany({});
            await cloudConn.collection('courses').insertMany(courses);
            console.log('✅ Courses Migrated');
        }

        console.log('\n✨ Migration Complete! All data migrated without double-hashing.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Failed:', err);
        process.exit(1);
    }
};

migrate();
