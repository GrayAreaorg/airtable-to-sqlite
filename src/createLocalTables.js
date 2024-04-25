
import camelize from './camelize.js'

let attachmentTypes = ['multipleAttachments']

async function createLocalTables(remoteTables, selectedFieldIds, dbInstance){

  await Promise.all( remoteTables.map(async remoteTable => {
    
    let tableName = camelize(remoteTable.name)

    // create a local table for each remote table that has selected fields
    await dbInstance.schema.createTable(tableName, async localTable => {

      // table has been created, now add the fields
      localTable.increments('id').primary()
      localTable.string('airtableId').primary()

      // map the remote table data types to local table data types
      let dataTypes = {
        'richText': 'text',
        'multilineText': 'text',
        'singleSelect': 'text',
        'number': 'integer',
        'singleLineText': 'text',
        'url': 'text',
        'checkbox': 'boolean',
        'date': 'timestamp',
        'formula': 'text',
        // for the below, object data is converted into a string of ids referencing different tables
        'multipleSelects': 'text',
        'multipleLookupValues': 'text',
        'multipleAttachments': 'text',
        'multipleRecordLinks': 'text',
      }

      let remoteSelectedFields = remoteTable.fields.filter(field => selectedFieldIds.includes(field.id))
      
      await Promise.all(remoteSelectedFields.map(async field => {

        // if the field is an attachment type, make sure we have an attachments table
        if(attachmentTypes.includes(field.type)){
          await createAttachmentsTable(dbInstance)
        }

        // check if the field type is known
        if( !dataTypes[field.type] || !localTable[dataTypes[field.type]] ){
          throw new Error(`Unknown field type: ${field.type} with format ${dataTypes[field.type]} for field ${field.name}`)
        }

        let columnName = camelize(field.name)
        await localTable[dataTypes[field.type]](columnName)
        
      }))

      console.log(`Created table: ${tableName} with ${remoteTable.fields.length} field(s).`)

    })
  }))
}

async function createAttachmentsTable(dbInstance){
  // create shared table for attachments
  return new Promise(async (resolve, reject) => {
    
    // if the attachments table doesn't exist, create it
    let attachmentsTableExists = await dbInstance.schema.hasTable('attachments')
    if( attachmentsTableExists ){
      resolve()
      return
    }

    await dbInstance.schema.createTable('attachments', table => {
      table.increments('id').primary()
      table.string('airtableId')
      table.string('size')
      table.string('filename')
      table.string('mimeType')
      table.string('downloadUrl')
      table.integer('downloadAttempts').defaultTo(0)
      table.string('linkedTableName')
      table.string('linkedRecordId')
      resolve()
    })
  })
}

export default createLocalTables