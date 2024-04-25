import fs from 'fs'
import axios from 'axios'

let getRemoteTables = async (config) => {
  
  const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${config.baseId}/tables`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`
    }
  })

  let tables = response.data.tables
  
  // write the remote tables to a JSON file next to the database.
  let dbFolder = config.dbPath.split('/').slice(0, -1).join('/')
  fs.writeFileSync(`${dbFolder}/remoteTables.json`, JSON.stringify(tables, null, 2))

  return response.data.tables
  
}

export default getRemoteTables