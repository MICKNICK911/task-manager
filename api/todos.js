/**
 * NETLIFY SERVERLESS FUNCTION - TODOS API
 * This file runs on Netlify's servers and connects to Neon PostgreSQL database
 * 
 * To use this, you need to:
 * 1. Create a Neon PostgreSQL database (free at neon.tech)
 * 2. Set the DATABASE_URL environment variable in Netlify
 */

// Import required modules
const { Pool } = require('pg');

/**
 * Create database connection pool
 * Netlify will provide DATABASE_URL from environment variables
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

// SQL to create todos table if it doesn't exist
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize database table
async function initDatabase() {
  try {
    await pool.query(CREATE_TABLE_SQL);
    console.log('Database table initialized or already exists');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize on first run
initDatabase();

/**
 * Main handler function - Netlify Functions use this structure
 */
exports.handler = async function(event, context) {
  // Set CORS headers for cross-origin requests
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  try {
    // Route the request based on HTTP method and path
    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(event);
      case 'POST':
        return await handlePost(event);
      case 'PATCH':
        return await handlePatch(event);
      case 'DELETE':
        return await handleDelete(event);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

/**
 * GET /api/todos - Get all todos or specific todo
 */
async function handleGet(event) {
  const { path } = event;
  const id = path.split('/').pop();
  
  // If path ends with a number, get specific todo
  if (!isNaN(id) && id !== 'todos') {
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Todo not found' })
      };
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0])
    };
  }
  
  // Otherwise get all todos
  const result = await pool.query(
    'SELECT * FROM todos ORDER BY created_at DESC'
  );
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.rows)
  };
}

/**
 * POST /api/todos - Create a new todo
 */
async function handlePost(event) {
  const body = JSON.parse(event.body || '{}');
  
  // Validate request body
  if (!body.text || typeof body.text !== 'string') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Todo text is required' })
    };
  }
  
  // Insert new todo
  const result = await pool.query(
    'INSERT INTO todos (text) VALUES ($1) RETURNING *',
    [body.text.trim()]
  );
  
  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.rows[0])
  };
}

/**
 * PATCH /api/todos/:id - Update a todo
 */
async function handlePatch(event) {
  const { path } = event;
  const id = path.split('/').pop();
  const body = JSON.parse(event.body || '{}');
  
  // Validate ID
  if (isNaN(id)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid todo ID' })
    };
  }
  
  // Check if todo exists
  const checkResult = await pool.query(
    'SELECT * FROM todos WHERE id = $1',
    [id]
  );
  
  if (checkResult.rows.length === 0) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Todo not found' })
    };
  }
  
  // Build update query dynamically based on provided fields
  const updates = [];
  const values = [];
  let paramIndex = 1;
  
  if (body.text !== undefined) {
    updates.push(`text = $${paramIndex}`);
    values.push(body.text);
    paramIndex++;
  }
  
  if (body.completed !== undefined) {
    updates.push(`completed = $${paramIndex}`);
    values.push(body.completed);
    paramIndex++;
  }
  
  // Always update the updated_at timestamp
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  
  // Add ID to values
  values.push(id);
  
  // Execute update
  const query = `
    UPDATE todos 
    SET ${updates.join(', ')} 
    WHERE id = $${paramIndex} 
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.rows[0])
  };
}

/**
 * DELETE /api/todos/:id - Delete a specific todo
 * DELETE /api/todos - Delete all completed todos
 */
async function handleDelete(event) {
  const { path } = event;
  const id = path.split('/').pop();
  
  // If path ends with a number, delete specific todo
  if (!isNaN(id) && id !== 'todos') {
    // Check if todo exists
    const checkResult = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Todo not found' })
      };
    }
    
    // Delete todo
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Todo deleted successfully' })
    };
  }
  
  // Otherwise delete all completed todos
  const result = await pool.query(
    'DELETE FROM todos WHERE completed = true RETURNING *'
  );
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: `Deleted ${result.rowCount} completed todos`,
      deletedCount: result.rowCount
    })
  };
}