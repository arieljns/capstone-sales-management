#!/usr/bin/env node
import 'dotenv/config';

import { DataSource } from 'typeorm';

let dataSourceModule;
try {
  dataSourceModule = await import('../dist/db/data-source.js');
} catch (error) {
  console.error(
    "ERROR: Could not load dist/db/data-source.js. Run `npm run build` first.",
  );
  process.exit(1);
}

let seedModule;
try {
  seedModule = await import('../dist/seeds/generateMockData.seed.js');
} catch (error) {
  console.error(
    'ERROR: Could not load dist/seeds/generateMockData.seed.js. Run `npm run build` to compile seed files.',
  );
  process.exit(1);
}

const existingDataSource =
  dataSourceModule.default instanceof DataSource
    ? dataSourceModule.default
    : null;

const baseOptions =
  dataSourceModule.dataSourceOptions ??
  (existingDataSource ? existingDataSource.options : undefined);

if (!baseOptions) {
  console.error('ERROR: Unable to resolve data source options for seeding.');
  process.exit(1);
}

const dataSource = existingDataSource ?? new DataSource(baseOptions);

let initializedHere = false;

try {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    initializedHere = true;
  }

  await seedModule.generateMockData(dataSource);
  console.log('Seeding complete via JS entry point.');
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('ERROR: Baseline seeding failed:', err.stack ?? err.message);
  process.exitCode = 1;
} finally {
  if (initializedHere && dataSource.isInitialized) {
    await dataSource.destroy();
  }
}
