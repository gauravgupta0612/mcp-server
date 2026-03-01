/**
 * Database Operations Tools
 * Using sql.js (pure JavaScript SQLite)
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let SQL = null;

// Initialize SQL.js
async function getSql() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

export function registerDatabaseTools(config) {
  const tools = new Map();
  const databases = new Map();

  // Get or create database connection
  async function getDb(dbPath = config.defaultDbPath) {
    const resolvedPath = path.resolve(dbPath);
    
    // Ensure directory exists
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!databases.has(resolvedPath)) {
      try {
        const Sql = await getSql();
        let dbData = null;
        
        // Load existing database if it exists
        if (fs.existsSync(resolvedPath)) {
          dbData = fs.readFileSync(resolvedPath);
        }
        
        const db = new Sql.Database(dbData);
        databases.set(resolvedPath, db);
        
        // Save function to persist data
        db.saveToFile = () => {
          const data = db.export();
          const buffer = Buffer.from(data);
          fs.writeFileSync(resolvedPath, buffer);
        };
      } catch (error) {
        throw new Error(`Failed to connect to database: ${error.message}`);
      }
    }
    
    return databases.get(resolvedPath);
  }

  // Execute SQL Query Tool
  tools.set('execute_query', {
    name: 'execute_query',
    description: 'Execute a SQL query on the database',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute'
        },
        params: {
          type: 'array',
          description: 'Optional query parameters',
          default: []
        },
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: ['query']
    },
    handler: async ({ query, params = [], dbPath }) => {
      try {
        const db = await getDb(dbPath || config.defaultDbPath);
        
        // Security: Only allow SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER
        const upperQuery = query.trim().toUpperCase();
        const allowed = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
        const isAllowed = allowed.some(op => upperQuery.startsWith(op));
        
        if (!isAllowed) {
          return { error: 'Only SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER queries are allowed' };
        }

        if (upperQuery.startsWith('SELECT')) {
          const results = db.exec(query, params);
          if (results.length > 0) {
            const columns = results[0].columns;
            const values = results[0].values.map(row => {
              const obj = {};
              columns.forEach((col, i) => {
                obj[col] = row[i];
              });
              return obj;
            });
            return {
              success: true,
              query,
              rowCount: values.length,
              results: values
            };
          }
          return {
            success: true,
            query,
            rowCount: 0,
            results: []
          };
        } else {
          db.run(query, params);
          db.saveToFile();
          const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
          const changes = db.getRowsModified();
          return {
            success: true,
            query,
            changes,
            lastInsertRowid: lastId
          };
        }
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Create Table Tool
  tools.set('create_table', {
    name: 'create_table',
    description: 'Create a new table in the database',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table to create'
        },
        columns: {
          type: 'string',
          description: 'Column definitions (e.g., "id INTEGER PRIMARY KEY, name TEXT, age INTEGER")'
        },
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: ['tableName', 'columns']
    },
    handler: async ({ tableName, columns, dbPath }) => {
      try {
        const db = await getDb(dbPath || config.defaultDbPath);
        const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
        
        db.run(query);
        db.saveToFile();
        
        return {
          success: true,
          message: `Table '${tableName}' created successfully`,
          query
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // List Tables Tool
  tools.set('list_tables', {
    name: 'list_tables',
    description: 'List all tables in the database',
    inputSchema: {
      type: 'object',
      properties: {
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: []
    },
    handler: async ({ dbPath }) => {
      try {
        const db = await getDb(dbPath || config.defaultDbPath);
        const query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
        const results = db.exec(query);
        
        if (results.length > 0) {
          const tables = results[0].values.map(row => row[0]);
          return {
            success: true,
            tables,
            count: tables.length
          };
        }
        
        return {
          success: true,
          tables: [],
          count: 0
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Get Table Info Tool
  tools.set('table_info', {
    name: 'table_info',
    description: 'Get information about a table structure',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table'
        },
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: ['tableName']
    },
    handler: async ({ tableName, dbPath }) => {
      try {
        const db = await getDb(dbPath || config.defaultDbPath);
        const query = `PRAGMA table_info(${tableName})`;
        const results = db.exec(query);
        
        if (results.length > 0) {
          const columns = results[0].values.map(row => ({
            cid: row[0],
            name: row[1],
            type: row[2],
            notNull: row[3] === 1,
            defaultValue: row[4],
            primaryKey: row[5] === 1
          }));
          
          return {
            success: true,
            tableName,
            columns
          };
        }
        
        return {
          success: true,
          tableName,
          columns: []
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Insert Record Tool
  tools.set('insert_record', {
    name: 'insert_record',
    description: 'Insert a record into a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table'
        },
        data: {
          type: 'object',
          description: 'Data to insert as key-value pairs'
        },
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: ['tableName', 'data']
    },
    handler: async ({ tableName, data, dbPath }) => {
      try {
        const db = await getDb(dbPath || config.defaultDbPath);
        
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(data);
        
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        db.run(query, values);
        db.saveToFile();
        
        const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
        
        return {
          success: true,
          message: 'Record inserted successfully',
          lastInsertRowid: lastId
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Update Record Tool
  tools.set('update_record', {
    name: 'update_record',
    description: 'Update records in a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table'
        },
        data: {
          type: 'object',
          description: 'Data to update as key-value pairs'
        },
        where: {
          type: 'string',
          description: 'WHERE clause (e.g., "id = ?")'
        },
        whereParams: {
          type: 'array',
          description: 'Parameters for WHERE clause'
        },
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: ['tableName', 'data', 'where', 'whereParams']
    },
    handler: async ({ tableName, data, where, whereParams, dbPath }) => {
      try {
        const db = await getDb(dbPath || config.defaultDbPath);
        
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...whereParams];
        
        const query = `UPDATE ${tableName} SET ${setClause} WHERE ${where}`;
        db.run(query, values);
        db.saveToFile();
        
        const changes = db.getRowsModified();
        
        return {
          success: true,
          message: 'Record updated successfully',
          changes
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Delete Record Tool
  tools.set('delete_record', {
    name: 'delete_record',
    description: 'Delete records from a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table'
        },
        where: {
          type: 'string',
          description: 'WHERE clause (e.g., "id = ?")'
        },
        whereParams: {
          type: 'array',
          description: 'Parameters for WHERE clause'
        },
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: ['tableName', 'where', 'whereParams']
    },
    handler: async ({ tableName, where, whereParams, dbPath }) => {
      try {
        const db = await getDb(dbPath || config.defaultDbPath);
        
        const query = `DELETE FROM ${tableName} WHERE ${where}`;
        db.run(query, whereParams);
        db.saveToFile();
        
        const changes = db.getRowsModified();
        
        return {
          success: true,
          message: 'Record deleted successfully',
          changes
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Close Database Tool
  tools.set('close_database', {
    name: 'close_database',
    description: 'Close a database connection',
    inputSchema: {
      type: 'object',
      properties: {
        dbPath: {
          type: 'string',
          description: 'Path to the database file',
          default: './data/mcp.db'
        }
      },
      required: []
    },
    handler: async ({ dbPath }) => {
      try {
        const resolvedPath = path.resolve(dbPath || config.defaultDbPath);
        
        if (databases.has(resolvedPath)) {
          // Save before closing
          databases.get(resolvedPath).saveToFile();
          databases.get(resolvedPath).close();
          databases.delete(resolvedPath);
          return { success: true, message: 'Database connection closed' };
        }
        
        return { error: 'No database connection found' };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  return tools;
}
