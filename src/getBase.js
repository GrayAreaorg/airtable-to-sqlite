import Airtable from 'airtable'

async function getBase(config){
  
  Airtable.configure({apiKey: config.apiKey})
  const base = Airtable.base(config.baseId)
  return base
  
}

export default getBase