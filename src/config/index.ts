import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
    throw new Error("Couldn't find .env file");
}

const config = {
    jwtSecret: process.env.JWT_SECRET || 'SECRET',
    port: process.env.PORT || 8080,
    logs: {
        level: process.env.LOG_LEVEL || 'debug',
    },
    phpUrl: process.env.PHP_URL || '',
    soapUrl: process.env.SOAP_URL || '',
    soapApiKey: process.env.SOAP_API_KEY || '',
};

export default config;
