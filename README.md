# SWAPI - Star Wars API with Natural Language Query

[![CI](https://github.com/olaekdahl/swapi/actions/workflows/pr-test.yml/badge.svg)](https://github.com/olaekdahl/swapi/actions/workflows/pr-test.yaml)
[![CD](https://github.com/olaekdahl/swapi/actions/workflows/cd.yml/badge.svg)](https://github.com/olaekdahl/swapi/actions/workflows/cd.yml)

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

The system uses a **hybrid approach** combining vector search with intelligent API tool selection via LangChain agents:

1. **Vector Search** - Initial context retrieval using semantic similarity from embedded Star Wars data
2. **LangChain Agent** - Intelligent analysis and tool selection using OpenAI's function calling capabilities
3. **Custom API Tools** - Direct access to detailed Star Wars data via **12 specialized tools** (see detailed breakdown below)
4. **Comprehensive Response** - Combines initial vector context with fresh, complete API data

#### Tool Integration Workflow

```
User Query → Vector Search → Initial Context → LangChain Agent Analysis
                                                        ↓
Agent Tool Selection ← Tool Descriptions ← Available Tools (12 custom tools)
        ↓
API Calls via Selected Tools → Fresh Data → Combined with Vector Context
                                                        ↓
                                              Comprehensive AI Response
```

#### Custom Tool Benefits

- **Accuracy**: Direct API access ensures up-to-date, complete information
- **Relationships**: Tools can follow entity relationships (e.g., character → films → other characters)
- **Attribute Search**: Advanced filtering capabilities beyond basic vector similarity
- **Structured Data**: Returns properly formatted JSON data for reliable AI processing
- **Error Handling**: Robust error management ensures graceful degradation

### Available LangChain Tools

The system includes **12 specialized tools** built with LangChain's `DynamicStructuredTool` class, each designed for specific Star Wars data access patterns:

#### Core Entity Tools

- **`get_character`** - Get detailed character information by ID
  - *Schema*: `{ id: number }`
  - *Purpose*: Retrieves complete character data including name, physical attributes, homeworld, etc.
  
- **`get_film`** - Get detailed film information by ID
  - *Schema*: `{ id: number }`
  - *Purpose*: Retrieves movie details including title, director, release date, opening crawl, etc.
  
- **`get_planet`** - Get detailed planet information by ID
  - *Schema*: `{ id: number }`
  - *Purpose*: Retrieves planet data including climate, terrain, population, etc.
  
- **`get_starship`** - Get detailed starship information by ID
  - *Schema*: `{ id: number }`
  - *Purpose*: Retrieves starship specifications including model, class, speed, capacity, etc.
  
- **`get_species`** - Get detailed species information by ID
  - *Schema*: `{ id: number }`
  - *Purpose*: Retrieves species data including classification, language, lifespan, etc.
  
- **`get_vehicle`** - Get detailed vehicle information by ID
  - *Schema*: `{ id: number }`
  - *Purpose*: Retrieves vehicle specifications including model, class, crew capacity, etc.

#### Relationship Mapping Tools

- **`get_character_films`** - Get all films featuring a specific character
- **`get_film_characters`** - Get all characters appearing in a specific film
- **`get_planet_characters`** - Get all characters from a specific planet (homeworld)
- **`get_starship_characters`** - Get all characters who pilot a specific starship
- **`get_species_characters`** - Get all characters belonging to a specific species

#### Advanced Search Tool

- **`search_characters`** - Advanced character attribute search
  - *Schema*: `{ attribute: string }`
  - *Purpose*: Searches all characters for specific attributes like "red eyes", "blue hair", "yellow skin"
  - *Supported Attributes*: eye color, hair color, skin color, gender
  - *Intelligence*: Uses pattern matching to extract colors and attributes from natural language queries

### Tool Implementation Architecture

#### Technical Foundation

```javascript
// Built using LangChain's DynamicStructuredTool with Zod validation
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// Each tool follows this pattern:
export const getCharacterTool = new DynamicStructuredTool({
  name: 'get_character',
  description: 'Get detailed information about a Star Wars character by their ID...',
  schema: z.object({
    id: z.number().describe('The ID of the character to retrieve')
  }),
  func: async ({ id }) => {
    // API call implementation with error handling
  }
});
```

#### API Integration

- **Base URL**: `http://localhost:3000/api` - All tools connect to the local SWAPI server
- **HTTP Client**: Uses Axios for reliable HTTP requests with automatic JSON parsing
- **Response Format**: All tools return JSON.stringify'd responses for consistent LangChain consumption
- **Error Handling**: Comprehensive try-catch blocks with descriptive error messages

#### Tool Selection Intelligence

The LangChain agent automatically selects appropriate tools based on:

1. **Query Analysis**: Natural language processing to identify entities and relationships
2. **Context Awareness**: Uses initial vector search results to determine which IDs to query
3. **Tool Descriptions**: Rich descriptions guide the agent's tool selection decisions
4. **Schema Validation**: Zod schemas ensure proper parameter types and validation

#### Entity ID Extraction

```javascript
// Helper function extracts relevant entity IDs from vector search context
export function extractEntityIds(context) {
  const entityIds = {
    characters: [], films: [], planets: [], 
    starships: [], species: [], vehicles: []
  };
  // Parses metadata from vector search results to identify relevant entities
}
```

#### Error Resilience

- **Network Error Handling**: Graceful handling of API connection failures
- **Invalid ID Handling**: Descriptive error messages for non-existent entities
- **Rate Limiting Awareness**: Built to handle API rate limits without breaking agent flow
- **Fallback Responses**: Returns structured error messages that the agent can interpret and relay to users

### LangChain Tools Implementation Details

#### Tool Construction Pattern

All custom tools follow a consistent implementation pattern using LangChain's `DynamicStructuredTool`:

```javascript
export const getCharacterTool = new DynamicStructuredTool({
  name: 'get_character',
  description: 'Get detailed information about a Star Wars character by their ID. Use this when you need more details about a specific character.',
  schema: z.object({
    id: z.number().describe('The ID of the character to retrieve')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/characters/${id}`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching character ${id}: ${error.message}`;
    }
  }
});
```

#### Advanced Search Tool Implementation

The `search_characters` tool demonstrates sophisticated attribute parsing:

```javascript
export const searchCharactersTool = new DynamicStructuredTool({
  name: 'search_characters',
  description: 'Search all characters to find those with specific attributes like eye color, hair color, etc.',
  schema: z.object({
    attribute: z.string().describe('The attribute to search for (e.g., "red eyes", "blue hair")')
  }),
  func: async ({ attribute }) => {
    // Intelligent attribute parsing with regex pattern matching
    const attributeLower = attribute.toLowerCase();
    
    if (attributeLower.includes('eye')) {
      const color = attributeLower.match(/(red|blue|green|yellow|brown|black|white|orange|purple|pink)/)?.[1];
      // Filter characters by eye color
    }
    // Similar logic for hair color, skin color, gender, etc.
  }
});
```

#### Tool Array Export and Integration

```javascript
// All tools exported as a single array for easy agent integration
export const swapiTools = [
  getCharacterTool, getCharacterFilmsTool, getFilmTool, 
  getFilmCharactersTool, getPlanetTool, getPlanetCharactersTool,
  getStarshipTool, getStarshipCharactersTool, getSpeciesTool,
  getSpeciesCharactersTool, getVehicleTool, searchCharactersTool
];

// Used in agent initialization (from index.js):
const agent = await createToolCallingAgent({
  llm, tools: swapiTools, prompt
});
```

#### Context-Based Entity Extraction

The system includes intelligent entity ID extraction from vector search results:

```javascript
export function extractEntityIds(context) {
  const entityIds = { characters: [], films: [], planets: [], starships: [], species: [], vehicles: [] };
  
  context.forEach(item => {
    if (item.metadata && item.metadata.entity_type && item.metadata.entity_id) {
      const entityType = item.metadata.entity_type;
      const entityId = item.metadata.entity_id;
      
      if (entityIds[entityType] && !entityIds[entityType].includes(entityId)) {
        entityIds[entityType].push(entityId);
      }
    }
  });
  
  return entityIds;
}
```

#### Agent Prompt Integration

Tools are integrated into the agent system with comprehensive guidance:

```javascript
const prompt = ChatPromptTemplate.fromMessages([
  ['system', `You are an expert on Star Wars data with access to detailed information through API tools.

Available tools can help you get:
- Detailed character information and their films
- Film details and cast information  
- Planet information and inhabitants
- Starship and vehicle details
- Species information and characters
- Search functionality for attribute-based queries

Use the tools strategically to provide the most complete and accurate answer possible.`],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}']
]);
```

### Vector Database

- Uses **LanceDB** embedded in the Node.js server for storing and searching vector embeddings
- Data is automatically ingested from `database.json` on first query
- Uses OpenAI's `text-embedding-3-small` model for embeddings
- Stores metadata for entity type, names, and other searchable fields
- No external database server required - fully embedded solution

### Enhanced RAG Process

1. **Query Embedding**: User query is converted to vector embedding using OpenAI's `text-embedding-3-small`
2. **Vector Similarity Search**: LanceDB performs semantic search to find initially relevant Star Wars data
3. **Context Analysis**: System extracts entity IDs from vector search metadata using `extractEntityIds()` helper
4. **LangChain Agent Initialization**: Agent is created with access to all 12 custom tools and context-aware prompt
5. **Intelligent Tool Selection**: Agent analyzes query and context to determine which tools to use:
   - Single entity queries → Direct entity tools (`get_character`, `get_film`, etc.)
   - Relationship queries → Relationship mapping tools (`get_character_films`, etc.)
   - Attribute queries → Advanced search tool (`search_characters`)
6. **API Tool Execution**: Selected tools make targeted API calls to local SWAPI endpoints
7. **Response Synthesis**: OpenAI generates comprehensive response combining:
   - Initial vector search context (for semantic understanding)
   - Fresh API tool results (for accurate, complete data)
   - Tool execution metadata (for transparency)
8. **Structured Output**: Response includes answer, context sources, tool usage, and relevance scores

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
   - `index.js`: Main Express server with API endpoints and LangChain agent integration
   - `langchain-tools.js`: **Custom LangChain tools** - Add new tools or modify existing ones here
   - `vector-db-setup.js`: Vector database operations using LanceDB

2. **Frontend**: Edit files in `/app/swapi/src` directory
   - `App.js`: Main React component
   - `App.css`: Styling

3. **Testing**: Use the provided test scripts or browser interface

### Extending the Tool System

To add new custom tools to the LangChain agent:

1. **Create New Tool** in `langchain-tools.js`:

```javascript
export const getNewEntityTool = new DynamicStructuredTool({
  name: 'get_new_entity',
  description: 'Description of what this tool does',
  schema: z.object({
    id: z.number().describe('Parameter description')
  }),
  func: async ({ id }) => {
    // Implementation
  }
});
```

2. **Add to Tools Array**:

```javascript
export const swapiTools = [
  // ... existing tools
  getNewEntityTool
];
```

3. **Update Agent Prompt** in `index.js` to describe the new tool's capabilities

4. **Test Tool Integration** by running queries that would benefit from the new tool
