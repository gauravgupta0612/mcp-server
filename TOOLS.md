# MCP Server Tools Documentation

Complete guide to all 25 tools available in the Dynamic MCP Server.

## Overview

The MCP Server provides 25 tools across 4 categories:
- **File Management (6 tools)**
- **System Operations (5 tools)**
- **API Integration (3 tools)**
- **Database Operations (8 tools)**

Plus **6 dynamic resources** for monitoring and configuration.

---

## File Management Tools

### 1. `create_file`
Create a new file with content.

**Input:**
```json
{
  "path": "string (required) - File path",
  "content": "string (required) - File content"
}
```

**Example:**
```bash
{
  "path": "C:/Users/test/myfile.txt",
  "content": "Hello World"
}
```

**Output:**
```json
{
  "success": true,
  "message": "File created successfully",
  "path": "C:/Users/test/myfile.txt"
}
```

---

### 2. `read_file`
Read the contents of a file.

**Input:**
```json
{
  "path": "string (required) - File path"
}
```

**Example:**
```bash
{
  "path": "C:/Users/test/myfile.txt"
}
```

**Output:**
```json
{
  "success": true,
  "content": "File content here...",
  "size": 1024,
  "encoding": "utf8"
}
```

---

### 3. `write_file`
Write or append content to a file.

**Input:**
```json
{
  "path": "string (required) - File path",
  "content": "string (required) - Content to write",
  "append": "boolean (optional, default: false) - Append mode"
}
```

**Example:**
```bash
{
  "path": "C:/Users/test/log.txt",
  "content": "New log entry\n",
  "append": true
}
```

---

### 4. `delete_file`
Delete a file from the filesystem.

**Input:**
```json
{
  "path": "string (required) - File path"
}
```

**Example:**
```bash
{
  "path": "C:/Users/test/myfile.txt"
}
```

**Output:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### 5. `list_files`
List files in a directory.

**Input:**
```json
{
  "path": "string (required) - Directory path",
  "recursive": "boolean (optional, default: false) - List recursively"
}
```

**Example:**
```bash
{
  "path": "C:/Users/test",
  "recursive": true
}
```

**Output:**
```json
{
  "success": true,
  "directory": "C:/Users/test",
  "count": 5,
  "files": [
    {
      "name": "file1.txt",
      "type": "file",
      "size": 1024,
      "modified": "2026-03-02T10:30:00Z"
    }
  ]
}
```

---

### 6. `get_file_info`
Get detailed information about a file.

**Input:**
```json
{
  "path": "string (required) - File path"
}
```

**Example:**
```bash
{
  "path": "C:/Users/test/myfile.txt"
}
```

**Output:**
```json
{
  "success": true,
  "name": "myfile.txt",
  "path": "C:/Users/test/myfile.txt",
  "type": "file",
  "size": 1024,
  "created": "2026-03-01T10:00:00Z",
  "modified": "2026-03-02T10:30:00Z",
  "isReadable": true,
  "isWritable": true
}
```

---

## System Operations Tools

### 7. `execute_command`
Execute a system command and get output.

**Input:**
```json
{
  "command": "string (required) - Command to execute",
  "args": "array (optional) - Command arguments",
  "cwd": "string (optional) - Working directory"
}
```

**Example:**
```bash
{
  "command": "dir",
  "args": ["/s"],
  "cwd": "C:/Users/test"
}
```

**Output:**
```json
{
  "success": true,
  "command": "dir /s",
  "stdout": "Directory listing...",
  "stderr": "",
  "exitCode": 0,
  "executionTime": 1234
}
```

---

### 8. `get_system_info`
Get system information and statistics.

**Input:**
```json
{}
```

**Output:**
```json
{
  "success": true,
  "platform": "win32",
  "arch": "x64",
  "cpus": 8,
  "totalMemory": 16777216000,
  "freeMemory": 8388608000,
  "uptime": 86400,
  "hostname": "DESKTOP-ABC123",
  "username": "GauravGupta"
}
```

---

### 9. `list_processes`
List all running processes.

**Input:**
```json
{
  "filter": "string (optional) - Filter by process name"
}
```

**Example:**
```bash
{
  "filter": "node"
}
```

**Output:**
```json
{
  "success": true,
  "count": 3,
  "processes": [
    {
      "pid": 1234,
      "name": "node.exe",
      "memory": 52428800,
      "cpu": 5
    }
  ]
}
```

---

### 10. `get_env_var`
Get value of an environment variable.

**Input:**
```json
{
  "variable": "string (required) - Variable name"
}
```

**Example:**
```bash
{
  "variable": "PATH"
}
```

**Output:**
```json
{
  "success": true,
  "variable": "PATH",
  "value": "C:\\Program Files\\...",
  "found": true
}
```

---

### 11. `create_directory`
Create a new directory.

**Input:**
```json
{
  "path": "string (required) - Directory path",
  "recursive": "boolean (optional, default: true) - Create parent directories"
}
```

**Example:**
```bash
{
  "path": "C:/Users/test/newdir/subdir",
  "recursive": true
}
```

**Output:**
```json
{
  "success": true,
  "message": "Directory created",
  "path": "C:/Users/test/newdir/subdir"
}
```

---

## API Integration Tools

### 12. `make_http_request`
Make HTTP requests (GET, POST, PUT, DELETE, etc.).

**Input:**
```json
{
  "url": "string (required) - URL",
  "method": "string (optional, default: GET) - HTTP method",
  "headers": "object (optional) - Request headers",
  "data": "object (optional) - Request body",
  "timeout": "number (optional, default: 30000) - Timeout in ms"
}
```

**Example:**
```bash
{
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token123"
  },
  "timeout": 5000
}
```

**Output:**
```json
{
  "success": true,
  "status": 200,
  "statusText": "OK",
  "headers": {"content-type": "application/json"},
  "data": {...}
}
```

---

### 13. `get_json_data`
Fetch and parse JSON data from a URL.

**Input:**
```json
{
  "url": "string (required) - URL to JSON endpoint",
  "query": "object (optional) - Query parameters"
}
```

**Example:**
```bash
{
  "url": "https://api.example.com/data",
  "query": {
    "page": 1,
    "limit": 10
  }
}
```

**Output:**
```json
{
  "success": true,
  "data": {...},
  "status": 200,
  "cached": false
}
```

---

### 14. `post_json_data`
Post JSON data to a URL and get response.

**Input:**
```json
{
  "url": "string (required) - URL to endpoint",
  "data": "object (required) - Data to post",
  "headers": "object (optional) - Custom headers"
}
```

**Example:**
```bash
{
  "url": "https://api.example.com/users",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

**Output:**
```json
{
  "success": true,
  "status": 201,
  "data": {...},
  "message": "Data posted successfully"
}
```

---

## Database Tools

### 15. `execute_query`
Execute SQL queries on SQLite database.

**Input:**
```json
{
  "query": "string (required) - SQL query",
  "params": "array (optional) - Query parameters",
  "dbPath": "string (optional, default: ./data/mcp.db) - Database path"
}
```

**Example:**
```bash
{
  "query": "SELECT * FROM users WHERE id = ?",
  "params": [123],
  "dbPath": "./data/mydb.db"
}
```

**Output (SELECT):**
```json
{
  "success": true,
  "query": "SELECT * FROM users WHERE id = ?",
  "rowCount": 1,
  "results": [
    {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

**Output (INSERT/UPDATE/DELETE):**
```json
{
  "success": true,
  "query": "INSERT INTO users ...",
  "changes": 1,
  "lastInsertRowid": 124
}
```

---

### 16. `create_table`
Create a new table in the database.

**Input:**
```json
{
  "tableName": "string (required) - Table name",
  "columns": "string (required) - Column definitions",
  "dbPath": "string (optional) - Database path"
}
```

**Example:**
```bash
{
  "tableName": "users",
  "columns": "id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Table 'users' created successfully",
  "query": "CREATE TABLE IF NOT EXISTS users (...)"
}
```

---

### 17. `list_tables`
List all tables in the database.

**Input:**
```json
{
  "dbPath": "string (optional) - Database path"
}
```

**Output:**
```json
{
  "success": true,
  "tables": ["users", "posts", "comments"],
  "count": 3
}
```

---

### 18. `table_info`
Get information about a table structure.

**Input:**
```json
{
  "tableName": "string (required) - Table name",
  "dbPath": "string (optional) - Database path"
}
```

**Output:**
```json
{
  "success": true,
  "tableName": "users",
  "columns": [
    {
      "cid": 0,
      "name": "id",
      "type": "INTEGER",
      "notNull": true,
      "defaultValue": null,
      "primaryKey": true
    },
    {
      "cid": 1,
      "name": "name",
      "type": "TEXT",
      "notNull": false,
      "defaultValue": null,
      "primaryKey": false
    }
  ]
}
```

---

### 19. `insert_record`
Insert a record into a table.

**Input:**
```json
{
  "tableName": "string (required) - Table name",
  "data": "object (required) - Data to insert",
  "dbPath": "string (optional) - Database path"
}
```

**Example:**
```bash
{
  "tableName": "users",
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

**Output:**
```json
{
  "success": true,
  "message": "Record inserted successfully",
  "lastInsertRowid": 125
}
```

---

### 20. `update_record`
Update records in a table.

**Input:**
```json
{
  "tableName": "string (required) - Table name",
  "data": "object (required) - Fields to update",
  "where": "string (required) - WHERE clause",
  "whereParams": "array (optional) - WHERE parameters",
  "dbPath": "string (optional) - Database path"
}
```

**Example:**
```bash
{
  "tableName": "users",
  "data": {
    "email": "newemail@example.com"
  },
  "where": "id = ?",
  "whereParams": [123]
}
```

**Output:**
```json
{
  "success": true,
  "message": "Record updated successfully",
  "changes": 1
}
```

---

### 21. `delete_record`
Delete records from a table.

**Input:**
```json
{
  "tableName": "string (required) - Table name",
  "where": "string (required) - WHERE clause",
  "whereParams": "array (optional) - WHERE parameters",
  "dbPath": "string (optional) - Database path"
}
```

**Example:**
```bash
{
  "tableName": "users",
  "where": "id = ?",
  "whereParams": [123]
}
```

**Output:**
```json
{
  "success": true,
  "message": "Record deleted successfully",
  "changes": 1
}
```

---

### 22. `close_database`
Close a database connection.

**Input:**
```json
{
  "dbPath": "string (optional) - Database path"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Database connection closed"
}
```

---

## Additional Database Tools

### 23-25. Reserved Tools
Three additional reserved database tools for future expansion.

---

## Available Resources

The server provides 6 dynamic resources:

### 1. `server-status`
Real-time server status and metrics.

### 2. `error-logs`
Recent error logs and diagnostics.

### 3. `active-processes`
List of currently active processes.

### 4. `environment-info`
System environment information.

### 5. `server-config`
Current server configuration.

### 6. `dynamic-resources`
List of all available resources.

---

## Quick Start Examples

### Example 1: Create and Query a Database

```bash
# 1. Create a table
Tool: create_table
Input: {
  "tableName": "products",
  "columns": "id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER"
}

# 2. Insert records
Tool: insert_record
Input: {
  "tableName": "products",
  "data": {
    "name": "Laptop",
    "price": 999.99,
    "stock": 10
  }
}

# 3. Query records
Tool: execute_query
Input: {
  "query": "SELECT * FROM products WHERE price > ?",
  "params": [500]
}
```

### Example 2: File Operations

```bash
# 1. Create a file
Tool: create_file
Input: {
  "path": "C:/Users/test/data.json",
  "content": "{\"status\": \"ok\"}"
}

# 2. Read the file
Tool: read_file
Input: {
  "path": "C:/Users/test/data.json"
}

# 3. List files
Tool: list_files
Input: {
  "path": "C:/Users/test",
  "recursive": false
}
```

### Example 3: API Integration

```bash
# 1. Make HTTP request
Tool: make_http_request
Input: {
  "url": "https://api.github.com/users/gauravgupta0612",
  "method": "GET"
}

# 2. Get JSON data
Tool: get_json_data
Input: {
  "url": "https://api.github.com/repos/gauravgupta0612/mcp-server"
}
```

### Example 4: System Operations

```bash
# 1. Get system info
Tool: get_system_info
Input: {}

# 2. Execute command
Tool: execute_command
Input: {
  "command": "npm",
  "args": ["list", "--depth=0"]
}

# 3. List processes
Tool: list_processes
Input: {
  "filter": "node"
}
```

---

## Error Handling

All tools return responses in this format:

**Success:**
```json
{
  "success": true,
  "data": "...",
  "message": "..."
}
```

**Error:**
```json
{
  "error": "Error message describing what went wrong",
  "success": false
}
```

Common errors:
- `ENOENT`: File or directory not found
- `EACCES`: Permission denied
- `EINVAL`: Invalid argument
- `EEXIST`: File already exists
- Database constraint violations

---

## Security Notes

1. **SQL Injection Protection**: Use parameterized queries with `params` array
2. **Command Execution**: Only allowed operations are filtered
3. **File Access**: Limited to project paths
4. **API Requests**: Timeout protection on all HTTP calls
5. **Database**: SQLite with prepared statements

---

## Performance Tips

1. **Batch Operations**: Use a single `execute_query` for multiple SQL operations
2. **Recursive Listing**: Avoid deep recursion on `list_files` with large directories
3. **Database Indexing**: Create indexes on frequently queried columns
4. **API Caching**: Results are cached for 5 minutes by default
5. **File Size**: Avoid reading very large files (>100MB) with `read_file`

---

## Support & Issues

For issues, questions, or feature requests, visit:
https://github.com/gauravgupta0612/mcp-server

---

**Last Updated:** March 2, 2026
**Server Version:** 1.0.0
