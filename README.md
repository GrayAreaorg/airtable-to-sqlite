# airtable-to-sqlite

Can be run as a CLI or via JavaScript import.

## CLI Usage

```
$ node ./index.js
```

## Module Usage

```
import airtableToSqlite from 'airtable-to-sqlite'

await airtableToSqlite({
  apiKey: "(your api key here)",
  baseId: "(your base id here)",
  selectedFieldIds: [
    "(field id)",
    "(field id)",
    "(field id)",
  ]
})
```

