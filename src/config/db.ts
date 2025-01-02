import mongoose from 'mongoose';
import { config } from './config';

const connectDb = async () => {
    try {
        //register events 
        mongoose.connection.on('connected', () => {
            console.log('Connected to database')
        })
        mongoose.connection.on('error', (err) => {
            console.log('error in connecting to database ', err);

        })
        //  connect to database 
        await mongoose.connect(config.databaseUrl as string)

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

}
export default connectDb;