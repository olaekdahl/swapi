# SWAPI - Star Wars API with Natural Language Query

## The Star Wars API

[swapi.dev](https://swapi.dev) fork with enhanced natural language query capabilities.

## What happened to swapi.co?

Unfortunately swapi.co is not maintained anymore.

## What is this?

An "unofficial" fork of "swapi" from https://github.com/Juriy/swapi re-written using Node.js, now enhanced with **natural language query support** using RAG (Retrieval-Augmented Generation) with vector database, OpenAI, and **LangChain tools** for enhanced accuracy.

## Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **LanceDB** - Embedded vector database for semantic search
- **OpenAI API** - GPT models and text embeddings
- **LangChain** - AI agent system with specialized tools
- **Swagger** - API documentation
- **Passport.js** - Authentication
- **JSON Server** - Alternative data serving

### Frontend
- **React.js** - Modern web interface for natural language queries
- **HTML/CSS** - Classic web interface for API documentation
- **Server-Side Events (SSE)** - Real-time progress updates

### Database
- **JSON file storage** - Star Wars data in database.json
- **Vector embeddings** - Semantic search capabilities
- **Relationship mapping** - Many-to-many entity relationships

## Features

### Core API Features
- **RESTful API** - Access to all Star Wars data
- **Swagger Documentation** - Interactive API documentation at `/api-docs`
- **Authentication** - Admin login system
- **CORS Support** - Cross-origin requests enabled

### Natural Language Query Features
- **Natural Language Queries** - Ask questions about Star Wars in plain English
- **Embedded Vector Database** - Uses LanceDB embedded in the Node.js server
- **OpenAI Integration** - Leverages GPT models for intelligent responses
- **LangChain Agent System** - Uses tools to make API calls for additional details
- **Real-time Context** - Provides relevant context sources for each answer
- **Enhanced Accuracy** - Combines vector search with direct API access

## API Routes

### Core Data Endpoints

Access the main Star Wars data through these endpoints:

- **Films**: `/api/films` - All Star Wars movies
- **Characters**: `/api/characters` - All characters  
- **Planets**: `/api/planets` - All planets
- **Species**: `/api/species` - All species
- **Starships**: `/api/starships` - All starships
- **Vehicles**: `/api/vehicles` - All vehicles
- **Transports**: `/api/transports` - All transport vehicles

### Relationship Endpoints

Many-to-many relationships between entities:

| URL | Junction table | Explanation |
|-----|---------------|-------------|
| `/api/characters/:character_id/films` | characters_films | Films featuring a character |
| `/api/characters/:character_id/starships` | starships_characters | Starships piloted by a character |
| `/api/characters/:character_id/vehicles` | vehicles_characters | Vehicles used by a character |
| `/api/films/:film_id/characters` | films_characters | Characters appearing in a film |
| `/api/films/:film_id/planets` | films_planets | Planets featured in a film |
| `/api/films/:film_id/starships` | films_starships | Starships appearing in a film |
| `/api/films/:film_id/species` | films_species | Species featured in a film |
| `/api/films/:film_id/vehicles` | films_vehicles | Vehicles appearing in a film |
| `/api/planets/:planet_id/characters` | planets_characters | Characters from a planet |
| `/api/planets/:planet_id/films` | films_planets | Films featuring a planet |
| `/api/species/:species_id/characters` | species_characters | Characters of a species |
| `/api/species/:species_id/films` | films_species | Films featuring a species |
| `/api/starships/:starship_id/characters` | starships_characters | Pilots of a starship |
| `/api/starships/:starship_id/films` | films_starships | Films featuring a starship |
| `/api/vehicles/:vehicle_id/characters` | vehicles_characters | Drivers of a vehicle |

### Natural Language Query API Endpoints

#### GET `/api/status`
Returns the system status including vector database initialization state.

**Response**:
```json
{
  "api": "running",
  "vectorDatabase": "ready|not_initialized|error",
  "timestamp": "2025-06-24T19:24:19.514Z"
}
```

#### POST `/api/models`
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

#### POST `/api/query`
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

### Documentation Endpoints

- **Swagger UI**: `/api-docs` - Interactive API documentation
- **Swagger JSON**: `/api/swagger.json` - OpenAPI specification
- **Natural Language Interface**: `/nlq` - Web interface for natural language queries

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

2. **Start the Frontend** (Optional - for Natural Language Queries):
   ```bash
   cd app/swapi
   npm install
   npm start
   ```
   Frontend will run on http://localhost:3001 (or another available port)

3. **Use the Interface**:
   - **Classic API**: Visit http://localhost:3000 for API documentation and endpoints
   - **Natural Language Queries**: Visit http://localhost:3001/nlq
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
- "What movies is Luke Skywalker in?" **(Enhanced with API tool calls)**

#### Attribute-Based Queries (Enhanced Search)
- "What characters have red eyes?" **(Enhanced with search tool)**
- "Which characters have blue hair?"
- "Characters with yellow skin"
- "Who has brown eyes?"

#### Film and Story Queries
- "What is the Death Star?"
- "Tell me about the planet Tatooine"
- "What movies feature Darth Vader?" **(Enhanced with API tool calls)**
- "What starships appear in A New Hope?" **(Enhanced with API tool calls)**

#### Detailed Relationship Queries **(New with LangChain)**
- "Who pilots the Millennium Falcon?" 
- "What characters are from Tatooine?"
- "Which films feature the Death Star?"
- "What species appear in the original trilogy?"

**Note**: The system now uses **LangChain agents with API tools** to provide much more comprehensive and accurate answers by combining vector search with direct API calls to get complete, up-to-date information.

## Technical Implementation

### Enhanced RAG with LangChain Tools

The system now uses **LangChain agents** with specialized tools for enhanced accuracy:

1. **Vector Search** - Initial context retrieval using semantic similarity
2. **LangChain Agent** - Intelligent tool selection and API calls
3. **API Tools** - Direct access to detailed Star Wars data via 12+ specialized tools
4. **Comprehensive Response** - Combines initial context with fresh API data

### Available LangChain Tools

- `get_character` - Get detailed character information
- `get_character_films` - Get films featuring a specific character
- `get_film` - Get detailed film information
- `get_film_characters` - Get characters in a specific film
- `get_planet` - Get detailed planet information
- `get_planet_characters` - Get characters from a specific planet
- `get_starship` - Get detailed starship information
- `get_starship_characters` - Get characters who pilot a starship
- `get_species` - Get detailed species information
- `get_species_characters` - Get characters of a specific species
- `get_vehicle` - Get detailed vehicle information
- `search_characters` - Advanced character attribute search

### Vector Database
- Uses **LanceDB** embedded in the Node.js server for storing and searching vector embeddings
- Data is automatically ingested from `database.json` on first query
- Uses OpenAI's `text-embedding-3-small` model for embeddings
- Stores metadata for entity type, names, and other searchable fields
- No external database server required - fully embedded solution

### Enhanced RAG Process
1. User query is converted to vector embedding
2. Similarity search finds initially relevant Star Wars data
3. **LangChain agent analyzes context and decides which tools to use**
4. **Agent makes targeted API calls to get additional details**
5. **OpenAI generates comprehensive response using both vector context and API results**
6. Response includes both answer and detailed source context

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
- JSON parsing errors with detailed debugging information

## Troubleshooting

### Common Issues

- **Vector database initialization errors**: The system will automatically create the LanceDB database on first use. Check the console logs for any OpenAI API key or network issues.

- **OpenAI API issues**: Make sure your API key is valid and has sufficient credits

- **Port conflicts**: If port 3000 is in use, the server will fail to start. Use a different port:
  ```bash
  PORT=3001 npm start
  ```

- **JSON parsing errors**: If you see "Unexpected non-whitespace character after JSON", this usually indicates the database.json file has formatting issues or multiple JSON objects. Check the server console for detailed error information.

## Development

To extend or modify the system:

1. **Backend**: Edit files in `/server` directory
   - `index.js`: Main Express server with API endpoints
   - `vector-db-setup.js`: Vector database operations using LanceDB
   
2. **Frontend**: Edit files in `/app/swapi/src` directory
   - `App.js`: Main React component
   - `App.css`: Styling

3. **Testing**: Use the provided test scripts or browser interface
