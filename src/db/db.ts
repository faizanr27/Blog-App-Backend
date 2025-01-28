const mongoose = require('mongoose')
require('dotenv').config()


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URI, {});
        console.log("MongoDB connected");

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log('An unknown error occurred');
        }
        process.exit(1);
    }
}

export default connectDB;