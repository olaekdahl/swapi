# Star Wars Natural Language Query System

This SWAPI (Star Wars API) implementation now includes natural language query support using RAG (Retrieval-Augmented Generation) with vector database and OpenAI.

## Features

- **Natural Language Queries**: Ask questions about Star Wars in plain English
- **Vector Database Search**: Uses ChromaDB for semantic similarity search
- **OpenAI Integration**: Leverages GPT models for intelligent responses
- **Real-time Context**: Provides relevant context sources for each answer

## How to Use

### Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key that starts with `sk-`
2. **Internet Connection**: Required for OpenAI API calls and embedding generation
3. **ChromaDB Server**: Required for vector database functionality

### Getting Started

1. **Start ChromaDB Server**:
   ChromaDB requires a server to be running. Choose one of these options:
   
   **Option A: Using Python (Recommended)**
   ```bash
   # Install ChromaDB
   pip install chromadb
   
   # Start the server
   chroma run --host 0.0.0.0 --port 8000
   ```
   
   **Option B: Using Docker**
   ```bash
   # Run ChromaDB in Docker
   docker run -p 8000:8000 chromadb/chroma:latest
   ```
   
   The ChromaDB server should start on http://localhost:8000

2. **Start the Backend Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
2. **Start the Backend Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
   Server will run on http://localhost:3000

3. **Start the Frontend**:
   ```bash
   cd app/swapi
   npm install
   npm start
   ```
3. **Start the Frontend**:
   ```bash
   cd app/swapi
   npm install
   npm start
   ```
   Frontend will run on http://localhost:3001 (or another available port)

4. **Use the Interface**:
   - Enter your OpenAI API key
   - Click "Load Models" to fetch available GPT models
   - Select a model from the dropdown
   - Ask your question about Star Wars
   - View the AI-generated response with context sources

### Example Queries

- "Who is Luke Skywalker?"
- "What is the Death Star?"
- "Tell me about the planet Tatooine"
- "What movies feature Darth Vader?"
- "Which characters are from Naboo?"
- "What starships appear in A New Hope?"

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
- Uses **ChromaDB** for storing and searching vector embeddings
- Data is automatically ingested from `database.json` on first query
- Uses OpenAI's `text-embedding-3-small` model for embeddings
- Stores metadata for entity type, names, and other searchable fields

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

### ChromaDB Connection Issues

If you see errors like "Failed to connect to chromadb" or "ChromaDB server is not running":

1. **Make sure ChromaDB server is running**:
   ```bash
   # Check if ChromaDB is running
   curl http://localhost:8000/api/v1/heartbeat
   
   # If not running, start it:
   pip install chromadb
   chroma run --host 0.0.0.0 --port 8000
   ```

2. **Using Docker** (alternative):
   ```bash
   docker run -p 8000:8000 chromadb/chroma:latest
   ```

3. **Check the server status**:
   Visit http://localhost:3000/api/status to see the current system status

### Common Issues

- **Port 8000 in use**: If port 8000 is occupied, ChromaDB can be started on a different port:
  ```bash
  chroma run --host 0.0.0.0 --port 8001
  ```
  Then set the environment variable:
  ```bash
  export CHROMA_PORT=8001
  npm start
  ```

- **Different host**: To use a different ChromaDB host:
  ```bash
  export CHROMA_HOST=http://your-chroma-server
  export CHROMA_PORT=8000
  npm start
  ```

- **Python/pip not available**: ChromaDB requires Python. Install Python 3.8+ and pip first

- **OpenAI API issues**: Make sure your API key is valid and has sufficient credits

## Development

To extend or modify the system:

1. **Backend**: Edit files in `/server` directory
   - `index.js`: Main Express server with API endpoints
   - `vector-db-setup.js`: Vector database operations
   
2. **Frontend**: Edit files in `/app/swapi/src` directory
   - `App.js`: Main React component
   - `App.css`: Styling

3. **Testing**: Use the provided test scripts or browser interface