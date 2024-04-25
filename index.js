import { pathToFileURL } from 'url'
import getConfig from './src/getConfig.js'
import getBase from './src/getBase.js'
import getRemoteTables from './src/getRemoteTables.js'
import getSelectedFieldIds from './src/getSelectedFieldIds.js'
import backupExistingDb from './src/backupExistingDb.js'
import createDbInstance from './src/createDbInstance.js'
import createLocalTables from './src/createLocalTables.js'
import populateLocalTables from './src/populateLocalTables.js'
import attachmentDownloader from './src/attachmentDownloader.js'

// import path from 'path'
// import { execSync } from 'child_process'

// isCli = true if run via CLI, false if imported as module
const isCli = (import.meta.url === pathToFileURL(process.argv[1]).href)

async function airtableToSqlite(config){
  try{

    // get the configuration and remote data before changing anything
    if( !config ) config = await getConfig(isCli)
    let base = await getBase(config)
    let remoteTables = await getRemoteTables(config)
    let selectedFieldIds = await getSelectedFieldIds(isCli, config, remoteTables)
    
    // filter out tables that don't have any of our selected fields
    remoteTables = remoteTables.filter(t => {
      return t.fields.some(field => selectedFieldIds.includes(field.id))
    })
    
    // required data is now loaded, so we can start making changes to the local database
    await backupExistingDb(config)
    let dbInstance = await createDbInstance(config)
    await createLocalTables(remoteTables, selectedFieldIds, dbInstance)
    await populateLocalTables(remoteTables, selectedFieldIds, dbInstance, base)
    await attachmentDownloader.downloadAttachments(dbInstance)
    
    if( isCli ) process.exit()

  }catch(error){

    // try{
    //   await restoreLatestDbBackup()
    // }catch(error){
    //   console.error(error)
    // }

    console.error(error)
  }
}

if(isCli) airtableToSqlite()

// export the main function so other scripts can use it, (non cli mode)
export default airtableToSqlite