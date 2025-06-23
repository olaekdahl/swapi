# Web site for serving SWAPI data

## Changing the initial data
When you want to change the data, you can edit the files in the `json-data` folder and the `database.json` file. The `process_db.mjs` file is no longer needed, but it is kept here for reference.

## TODOS
- The junction requests are not as elegant as they should be. I used a brute force method to get the data into JS arrays and then searched through that. But I think there's a way to use the json-server tools that is more ideomatic. Do research to how to do that and refactor.


## Notes
- Weirdly, there is no connections to the transport collection. We'd expect it to be featured in a film or have a list of pilots (characters).
- 