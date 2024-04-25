
let getRecords = ({base, tableName, options}) => {
  
  return new Promise((resolve, reject) => {
    
    if( !base ) reject('No base provided')
    if( !tableName ) reject('No tableName provided')
    
    let allRecords = []

    base(tableName)
      .select(options)
      .eachPage(function page(records, fetchNextPage) {

        // console.log(`Fetched ${records.length} records from ${tableName}`)

        // This function (`page`) will get called for each page of records.
        records.forEach(function(record) {
          allRecords.push(record)
        })
  
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
  
      }, function done(err) {
        
        if (err) {
          console.error(err);
          reject(err)
        }

        resolve(allRecords)

      })
  })
}

export default getRecords