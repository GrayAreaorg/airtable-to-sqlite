
import fs from 'fs'
import moment from 'moment'

async function backupExistingDb({useExistingDb, dbPath}){

  // if existing database doesn't exist, skip backup
  if(!fs.existsSync(dbPath)) return

  // create backups folder in the same folder as dbPath
  const backupsFolder = dbPath.replace(/\/[^/]+$/, '/dbBackups')
  if (!fs.existsSync(backupsFolder)) fs.mkdirSync(backupsFolder)

  // backup the existing database
  fs.copyFileSync(dbPath, `${backupsFolder}/database-backup.${ moment().format('YYYY-MM-DD-HH-MM-SS') }.db`)
  
  if( !useExistingDb ){
    // delete the existing database
    fs.unlinkSync(dbPath)
  }
  
}

export default backupExistingDb