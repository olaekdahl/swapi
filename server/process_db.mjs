
import fs from 'fs';

const db = JSON.parse(fs.readFileSync('server/database.json', 'utf8'));

for (const key in db) {
  console.log(db[key]);
  for (const item of db[key]) {
    for (const field in item) {
      console.log(`\t${key}.${field}\n`)
      if (field === 'fields') {
        for (const subfield in item.fields) {
          item[subfield] = item.fields[subfield];
        }
        delete item.fields;
      }
    }
  }
}

fs.writeFileSync('./database2.json', JSON.stringify(db, null, 2));