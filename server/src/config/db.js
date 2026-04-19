const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const pool = env.databaseUrl
  ? new Pool({ connectionString: env.databaseUrl })
  : new Pool({
      host: env.dbHost,
      port: env.dbPort,
      database: env.dbName,
      user: env.dbUser,
      password: env.dbPassword,
    });

pool.on('error', (error) => {
  logger.error('Unexpected PostgreSQL pool error', { error: error.message });
});

const query = (text, params = []) => pool.query(text, params);

const withTransaction = async (work) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const resolveMigrationsDir = () => {
  const candidates = [
    path.resolve(process.cwd(), 'database', 'migrations'),
    path.resolve(process.cwd(), '..', 'database', 'migrations'),
    path.resolve(process.cwd(), 'migrations'),
    path.resolve(process.cwd(), '..', 'migrations'),
    path.resolve(__dirname, '..', '..', '..', '..', 'database', 'migrations'),
    path.resolve(__dirname, '..', '..', '..', 'database', 'migrations'),
  ];

  const seen = new Set();

  for (const candidate of candidates) {
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);

    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  return null;
};

const resolveSchemaFile = () => {
  const candidates = [
    path.resolve(process.cwd(), 'database', 'schema.sql'),
    path.resolve(process.cwd(), '..', 'database', 'schema.sql'),
    path.resolve(process.cwd(), 'schema.sql'),
    path.resolve(process.cwd(), '..', 'schema.sql'),
    path.resolve(__dirname, '..', '..', '..', '..', 'database', 'schema.sql'),
    path.resolve(__dirname, '..', '..', '..', 'database', 'schema.sql'),
  ];

  const seen = new Set();

  for (const candidate of candidates) {
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);

    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
};

const runSchemaBootstrap = async () => {
  const schemaFile = resolveSchemaFile();
  if (!schemaFile) {
    logger.warn('schema.sql was not found. Skipping schema bootstrap.');
    return;
  }

  const schemaSql = fs.readFileSync(schemaFile, 'utf8');
  await query(schemaSql);
};

const runMigrations = async () => {
  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await query('CREATE EXTENSION IF NOT EXISTS citext');

  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = resolveMigrationsDir();
  if (!migrationsDir) {
    logger.warn('No migrations directory found. Skipping migration run.');
    return;
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => /^\d+_.*\.sql$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (const migrationFile of migrationFiles) {
    const alreadyApplied = await query('SELECT 1 FROM schema_migrations WHERE name = $1', [
      migrationFile,
    ]);

    if (alreadyApplied.rowCount > 0) {
      continue;
    }

    const migrationSql = fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf8');

    await withTransaction(async (client) => {
      await client.query(migrationSql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migrationFile]);
    });

    logger.info('Applied database migration', { migrationFile });
  }
};

const initDb = async () => {
  await runSchemaBootstrap();
  await runMigrations();

  logger.info('Database initialized');
};

module.exports = {
  pool,
  query,
  withTransaction,
  runMigrations,
  initDb,
};
