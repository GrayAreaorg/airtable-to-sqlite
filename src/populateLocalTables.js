import camelize from './camelize.js'
import slugify from 'slugify'

let attachmentTypes = ['multipleAttachments']
let referenceTypes = ['multipleRecordLinks','multipleLookupValues','multipleSelects']

import getRecords from './getRecords.js'

async function populateLocalTables(remoteTables, selectedFieldIds, dbInstance, base){

  await Promise.all( remoteTables.map(async remoteTable => {

    let records = await getRecords({
      base, 
      tableName: remoteTable.name,
      options:{
        fields: remoteTable.fields.filter(field => selectedFieldIds.includes(field.id)).map(field => field.id)
      }
    })

    let localTableName = camelize(remoteTable.name)

    // add each record to the appropriate table
    await Promise.all(records.map(async record => {
      
      // move record attachments to the attachments table
      record = await handleAttachments(remoteTable, record, dbInstance)

      // handle reference fields
      record = await handleReferenceRecords(remoteTable, record, dbInstance)
      
      // add the airtable record id to the record fields, 
      // because it isnt part of the fields
      record.fields.airtableId = record.id

      // convert field keys to camelCase
      record.fields = Object.keys(record.fields).reduce((acc, key) => {
        acc[camelize(key)] = record.fields[key]
        return acc
      }, {})

      // add the record to the table (excluding attachment fields)
      await dbInstance(localTableName).insert(record.fields)
    }))

    console.log(`Populated table: ${localTableName} with ${records.length} record(s).`)

  }))
  
}

async function handleAttachments(remoteTable, record, dbInstance){

  // get this table's attachment fields from the schema
  remoteTable
    .fields
    .filter(f => attachmentTypes.includes(f.type))
    .map(field => {

      // if this record doesn't have any attachments for this field, skip it
      if( !record.fields[field.name] ) return
      
      // now with each known attachment field, 
      // insert this record's attachments to the attachments table
      record.fields[field.name].map(async attachment => {
        await insertAttachmentRenditions(remoteTable, record, attachment, dbInstance)
      })

      // convert this field to a string of attachment ids
      record.fields[field.name] = record.fields[field.name].map(attachment => attachment.id).join(',')

    })
    
  return record
}

async function insertAttachmentRenditions(remoteTable, record, attachment, dbInstance){
  
  let localTableName = camelize(remoteTable.name)

  // get a list of renditions to add to the attachments table
  let renditions = []
  if( !attachment.thumbnails ){
    // no thumbnails when it's a video/audio file
    // so there is only one rendition
    renditions.push({
      size: 'full',
      downloadUrl: attachment.url,
      attachment
    })
  }else{
    // there are thumbnails, so we need to add each one as a rendition
    Object.keys(attachment.thumbnails).map(size => {
      renditions.push({
        size,
        downloadUrl: attachment.thumbnails[size].url,
        attachment
      })
    })
  }

  // add each rendition to the attachments table
  renditions.forEach(async rendition => {

    let extension = rendition.attachment.filename.split('.').pop()
    let filenameWithoutExtension = slugify(rendition.attachment.filename.split('.').slice(0, -1).join('.'))
    let filename = `${filenameWithoutExtension}.${rendition.attachment.id}.${rendition.size}.${extension}`

    await dbInstance('attachments').insert({
      airtableId: attachment.id,
      size: rendition.size,
      filename: filename,
      mimeType: attachment.type,
      downloadUrl: rendition.downloadUrl,
      linkedTableName: localTableName,
      linkedRecordId: record.id
    })
  })
}

async function handleReferenceRecords(remoteTable, record, dbInstance){

  // get this table's reference fields from the schema
  remoteTable
    .fields
    .filter(f => referenceTypes.includes(f.type))
    .forEach(async referenceField => {

      // if this record doesn't have any linked records for this field, skip it
      if( !record.fields[referenceField.name] ) return

      // convert this field to a string of linked record ids
      record.fields[referenceField.name] = JSON.stringify(record.fields[referenceField.name])


    })

  return record
}

export default populateLocalTables
