import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import createConfig from './createConfig.js'

async function getConfig(isCli){

  let configExists = fs.existsSync(path.join(__dirname, '..', 'config.json'))
  if( !configExists && !isCli ) throw new Error(`config.json not found. Run airtable-to-sqlite via CLI to create a new config file.`)
  if( !configExists && isCli ) await createConfig()  
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'))

}

export default getConfig