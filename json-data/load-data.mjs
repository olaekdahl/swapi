import fs from 'fs';
import { exec } from 'child_process';

// Get list of *.json files in current directory
const files = fs.readdirSync('.')
  .filter(file => file.endsWith('.json'))
  .map(file => ({ fileName: file, tableName: file.split('.')[0] }));

// iterate through them
for (let { fileName, tableName } of files) {
  // mongoimport them into the database
  console.log(`Importing ${fileName} into ${tableName}`);
  exec(`mongoimport --uri mongodb://localhost:27017/swapi --collection ${tableName} --drop --file ./${fileName} --jsonArray`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}