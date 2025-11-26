export const commands = {
  'reset-dev-db': async () => {
    await docker.exec('supabase_db', ['dropdb', 'postgres']);
    await docker.exec('supabase_db', ['createdb', 'postgres']);
    await runMigrations();
    return 'Database reset complete';
  },
  
  'deploy-functions': async () => {
    const functions = await listFunctions();
    for (const func of functions) {
      await deployFunction(func);
    }
    return 'All functions deployed';
  }
};