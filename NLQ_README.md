# Star Wars Natural Language Query System

This SWAPI (Star Wars API) implementation now includes natural language query support using RAG (Retrieval-Augmented Generation) with vector database and OpenAI.

## Features

- **Natural Language Queries**: Ask questions about Star Wars in plain English
- **Embedded Vector Database**: Uses LanceDB embedded in the Node.js server
- **OpenAI Integration**: Leverages GPT models for intelligent responses
- **Real-time Context**: Provides relevant context sources for each answer

## How to Use

### Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key that starts with `sk-`
2. **Internet Connection**: Required for OpenAI API calls and embedding generation

### Getting Started

1. **Start the Backend Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
   Server will run on http://localhost:3000
   
   The LanceDB vector database will be automatically created and embedded in the server - no separate database server setup required!

2. **Start the Frontend**:
   ```bash
   cd app/swapi
   npm install
   npm start
   ```
   Frontend will run on http://localhost:3001 (or another available port)

3. **Use the Interface**:
   - Enter your OpenAI API key
   - Click "Load Models" to fetch available GPT models
   - Select a model from the dropdown
   - Ask your question about Star Wars
   - View the AI-generated response with context sources

### Example Queries

#### Character Information
- "Who is Luke Skywalker?"
- "Tell me about Darth Vader"
- "What characters are from Naboo?"

#### Attribute-Based Queries (Enhanced Search)
- "What characters have red eyes?"
- "Which characters have blue hair?"
- "Characters with yellow skin"
- "Who has brown eyes?"

#### Film and Story Queries
- "What is the Death Star?"
- "Tell me about the planet Tatooine"
- "What movies feature Darth Vader?"
- "What starships appear in A New Hope?"

**Note**: The system uses advanced hybrid search for attribute-based queries (like eye color, hair color, etc.) combining vector similarity with exact keyword matching for improved accuracy and recall.

## API Endpoints

### GET /api/status
Returns the system status including vector database initialization state.

**Response**:
```json
{
  "api": "running",
  "vectorDatabase": "ready|not_initialized|error",
  "timestamp": "2025-06-24T19:24:19.514Z"
}
```

### POST /api/models
Fetches available OpenAI models for the provided API key.

**Request**:
```json
{
  "apiKey": "sk-your-openai-api-key"
}
```

**Response**:
```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "gpt-4",
      "created": 1687882411
    }
  ]
}
```

### POST /api/query
Process a natural language query using RAG.

**Request**:
```json
{
  "apiKey": "sk-your-openai-api-key",
  "model": "gpt-3.5-turbo",
  "query": "Who is Luke Skywalker?"
}
```

**Response**:
```json
{
  "query": "Who is Luke Skywalker?",
  "answer": "Luke Skywalker is a main character...",
  "context": [
    {
      "content": "This is a character from Star Wars...",
      "metadata": {"entity_type": "characters", "name": "Luke Skywalker"},
      "relevance": 0.95
    }
  ],
  "model": "gpt-3.5-turbo",
  "timestamp": "2025-06-24T19:24:19.514Z"
}
```

## Technical Implementation

### Vector Database
- Uses **LanceDB** embedded in the Node.js server for storing and searching vector embeddings
- Data is automatically ingested from `database.json` on first query
- Uses OpenAI's `text-embedding-3-small` model for embeddings
- Stores metadata for entity type, names, and other searchable fields
- No external database server required - fully embedded solution

### RAG Process
1. User query is converted to vector embedding
2. Similarity search finds relevant Star Wars data
3. Top 5 most relevant results are used as context
4. OpenAI generates response based on context and query
5. Response includes both answer and source context

### Security
- API keys are not stored on the server
- Input validation for all parameters
- Rate limiting awareness and error handling
- CORS enabled for frontend communication

## Data Source

The system uses the existing Star Wars API data from `database.json` which includes:
- Films
- Characters
- Planets
- Species
- Starships
- Vehicles

All data is processed and vectorized to enable semantic search capabilities.

## Error Handling

The system includes comprehensive error handling for:
- Invalid API keys
- Rate limiting
- Model availability
- Vector database issues
- Network connectivity problems

## Troubleshooting

### Common Issues

- **Vector database initialization errors**: The system will automatically create the LanceDB database on first use. Check the console logs for any OpenAI API key or network issues.

- **OpenAI API issues**: Make sure your API key is valid and has sufficient credits

- **Port conflicts**: If port 3000 is in use, the server will fail to start. Use a different port:
  ```bash
  PORT=3001 npm start
  ```

## Development

To extend or modify the system:

1. **Backend**: Edit files in `/server` directory
   - `index.js`: Main Express server with API endpoints
   - `vector-db-setup.js`: Vector database operations using LanceDB
   
2. **Frontend**: Edit files in `/app/swapi/src` directory
   - `App.js`: Main React component
   - `App.css`: Styling

3. **Testing**: Use the provided test scripts or browser interface