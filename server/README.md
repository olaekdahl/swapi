# Web site for serving SWAPI data

## Vector Database

The application uses LanceDB to provide vector search capabilities with OpenAI embeddings. The vector database is now pre-built during the GitHub Actions workflow to improve performance:

- **Pre-building**: The `build-vector-db.js` script builds the vector database during CI/CD using the `OPENAI_API_KEY` secret
- **Fast startup**: The pre-built database is included in the Docker container, eliminating slow first-query performance
- **Fallback**: If no pre-built database is found, the system will build it on-demand as before

## Changing the initial data
When you want to change the data, you can edit the files in the `json-data` folder and the `database.json` file. The `process_db.mjs` file is no longer needed, but it is kept here for reference.

## TODOS
- The junction requests are not as elegant as they should be. I used a brute force method to get the data into JS arrays and then searched through that. But I think there's a way to use the json-server tools that is more ideomatic. Do research to how to do that and refactor.


## Notes
- Weirdly, there is no connections to the transport collection. We'd expect it to be featured in a film or have a list of pilots (characters).
- 