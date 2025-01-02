import app from "./app";
import { config } from "./config/config";
import connectDb from "./config/db";

const startServer = async () => {
  try {
    // connect to database
    await connectDb();
    const port = config.port || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
