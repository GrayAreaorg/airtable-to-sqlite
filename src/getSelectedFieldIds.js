import fs from 'fs'
import inquirer from 'inquirer'

// loads in previously saved config.selectedFields, if any
// lets the user select / update selectedFields from a list of tables and fields
// saves the config.selectedFields back to config.json
// returns an array of airtable fieldIds to import

async function getSelectedFieldIds(isCli, config, tables){  

  let selectedFieldIds = config.selectedFieldIds || []

  if( !isCli && selectedFieldIds.length == 0 ) throw new Error(`No fields selected. Run airtable-to-sqlite via CLI to select fields.`)
  if( !isCli ) return selectedFieldIds

  // on CLI, prompt the user to select fields

  let choicesList = []
  tables.map(table => {
    choicesList.push(new inquirer.Separator(table.name))
    table.fields.map(field => {
      choicesList.push({
        name: `${field.name} (${field.type})`,
        value: field.id,
        short: field.name
      })
    })
  })
  
  let response = await inquirer.prompt({
    type: 'checkbox',
    name: 'fields',
    message: 'Select the fields you want to import\n',
    multiple: true,
    loop: false,
    default: selectedFieldIds,
    choices: choicesList,
  })

  selectedFieldIds = response.fields

  config.selectedFieldIds = selectedFieldIds
  await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
  return selectedFieldIds

}

export default getSelectedFieldIds