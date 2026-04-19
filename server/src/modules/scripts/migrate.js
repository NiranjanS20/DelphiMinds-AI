const { initDb, pool } = require('../config/db');

const run = async () => {
  try {
    await initDb();
    process.stdout.write('Database schema and migrations applied successfully.\n');
    await pool.end();
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Migration failed: ${error.message}\n`);
    await pool.end();
    process.exit(1);
  }
};

run();
