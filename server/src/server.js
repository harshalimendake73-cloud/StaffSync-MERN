import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` StaffSync Backend API running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

