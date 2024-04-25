import fs from 'fs'
import download from 'download'

class AttachmentDownloader{

  constructor(dbInstance){
    this.running = false
    this.maxDownloadAttempts = 3
  }

  downloadAttachments(dbInstance){
    this.dbInstance = dbInstance

    return new Promise(async(resolve, reject) => {
      
      // if there is no attachments table, 
      // then there are no attachments to download
      let attachmentsTableExists = await dbInstance.schema.hasTable('attachments')
      if( !attachmentsTableExists ){
        resolve()
        return
      }

      // otherwise, start downloading attachments and resolve once finished.
      this.start(()=>{
        // on complete
        resolve()
      })
    })
  }

  start(onComplete){
    // start downloading attachments
    if( !this.running ){
      this.running = true
      this.downloadNextAttachment(onComplete)
    }
  }

  async downloadNextAttachment(onComplete){
    // download the next attachment
    let attachment = await this.getNextAttachment()
    if( attachment ){
      await this.downloadAttachment(attachment)
      this.downloadNextAttachment()
    } else {
      console.log(`✅ All attachments downloaded!`)
      this.running = false
      if(onComplete) onComplete()
    }
  }

  async getNextAttachment(){
    
    // get the next attachment to download
    let attachment = await this.dbInstance
      .table('attachments')
      .whereNotNull('downloadUrl')
      .orderBy('downloadAttempts', 'asc')
      .first()
    
    // check if a file with this name already exists in the attachments folder
    if( attachment && fs.existsSync(`./public/attachments/${attachment.filename}`)){
      // if it does, remove the downloadUrl from the attachment in the database
      await this.dbInstance.table('attachments').where('id', attachment.id).update({downloadUrl: null})
      attachment = await this.getNextAttachment()
    }

    return attachment
  }

  async downloadAttachment(attachment){
    // download the attachment

    try{

      console.log(`downloading ${attachment.filename}`)
  
      await download(attachment.downloadUrl, './public/attachments', {
        filename: attachment.filename
      })
      
      // remove the downloadUrl from the attachment in the database
      await this.dbInstance.table('attachments')
        .where('id', attachment.id)
        .update({downloadUrl: null})

    } catch (error) {
      console.log(`Error downloading ${attachment.filename}: `)
      console.error(error)
      await this.handleDownloadError(attachment)
    }
  }

  async handleDownloadError(attachment){

    // increment the download attempts
    let downloadAttempts = attachment.downloadAttempts || 0
    downloadAttempts++
    
    //update the download attempts in the database
    await this.dbInstance.table('attachments')
      .where('id', attachment.id)
      .update({downloadAttempts})
    
  }
}

let attachmentDownloader = new AttachmentDownloader()
export default attachmentDownloader