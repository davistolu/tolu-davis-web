import app from './app.js';
import { initDatabase, getActiveDriver } from './db/db.js';

const PORT = process.env.PORT || 5000;

// Start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 [ToluOS Backend] Server running on port ${PORT}`);
    console.log(`🔗 REST API: http://localhost:${PORT}/api/`);
    console.log(`📡 Database Driver: ${getActiveDriver()}`);
    console.log(`💻 Ready to receive frontend requests!\n`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL ERROR] Server failed to start:', err);
  process.exit(1);
});
