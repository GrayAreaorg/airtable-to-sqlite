import knex from 'knex'
import sqlite3 from 'sqlite3'

async function createDbInstance({useExistingDb, dbPath}){

  if( !useExistingDb ){
    // create the DB file
    new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
  }  

  // Connect to the database
  const dbInstance = knex({
    client: 'sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true
  })

  return dbInstance
}

export default createDbInstance