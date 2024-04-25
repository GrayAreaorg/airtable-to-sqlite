import fs from 'fs'
import inquirer from 'inquirer';

async function createConfig(){

  // prompt the user for their Airtable API key and Base ID
  let config = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: '\nFirst, generate an airtable API key with permissions:\n - data.records:read\n - schema.bases:read\n\nGenerate it at https://airtable.com/create/tokens\nPaste it here:'
    },
    {
      type: 'input',
      name: 'baseId',
      message: '\nNow enter your Airtable Base ID.\nWhen editing a base, the ID is in the URL: https://airtable.com/(baseId)\nPaste it here:'
    },
    {
      type: 'list',
      name: 'useExistingDb',
      message: 'Are you appending Airtable tables to an existing sqlite database or creating a new one just from Airtable?',
      choices: [
        {
          name:'Adding Airtable tables to existing database',
          value:true,
          short:'Existing'
        },{
          name:'Creating new database from Airtable',
          value:false,
          short:'New'
        }
      ]
    },
    {
      // only ask for the dbPath if they are using an existing database
      when: answers => {
        return answers.useExistingDb
      },
      type: 'input',
      name: 'dbPath',
      message: 'Path to your existing DB to amend. For example: ./data/database.db',
    }
  ])

  // default for dbPath is ./data/database.db
  if( !config.dbPath ) config.dbPath = './data/database.db'

  // write the config JSON file
  await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))

}

export default createConfig