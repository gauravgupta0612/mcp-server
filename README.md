# MCP Server

Dynamic Model Context Protocol (MCP) Server 

## Features

- **File Management** - Read, write, list, delete files and directories
- **System Operations** - Execute commands, get system info, process management
- **API Integration** - HTTP GET, POST, PUT, DELETE requests
- **Database Operations** - SQLite database management
- **Dynamic Resources** - Real-time system monitoring

## Quick Start

### 1. Install Dependencies

```
bash
npm install
```

### 2. Start the Server

```
bash
npm start
```

### 3. Configure the Server

Edit `config/server-config.json` to customize:

- Allowed directories for file operations
- Allowed commands for system operations
- Database settings
- Watch paths for file monitoring

## Available Tools

### File Management
| Tool | Description |
|------|-------------|
| `read_file` | Read contents of a file |
| `write_file` | Write content to a file |
| `list_directory` | List files in a directory |
| `delete_file` | Delete a file |
| `create_directory` | Create a new directory |
| `file_info` | Get file/directory information |

### System Operations
| Tool | Description |
|------|-------------|
| `execute_command` | Execute a system command |
| `get_system_info` | Get system information |
| `get_network_info` | Get network information |
| `list_processes` | List running processes |
| `get_disk_info` | Get disk space information |
| `get_current_time` | Get current system time |

### API Integration
| Tool | Description |
|------|-------------|
| `http_get` | Make HTTP GET request |
| `http_post` | Make HTTP POST request |
| `http_put` | Make HTTP PUT request |
| `http_delete` | Make HTTP DELETE request |
| `http_request` | Make generic HTTP request |

### Database Operations
| Tool | Description |
|------|-------------|
| `execute_query` | Execute SQL query |
| `create_table` | Create a database table |
| `list_tables` | List all tables |
| `table_info` | Get table structure |
| `insert_record` | Insert a record |
| `update_record` | Update records |
| `delete_record` | Delete records |

## Available Resources

| Resource URI | Description |
|--------------|-------------|
| `mcp://server/info` | Server information |
| `mcp://system/status` | System status and metrics |
| `mcp://filesystem/watch` | File system watcher status |
| `mcp://filesystem/directories` | Directory listings |
| `mcp://config` | Server configuration |
| `mcp://logs` | Server logs |

## Configuration

```
json
{
  "server": {
    "name": "mcp-server",
    "version": "1.0.0"
  },
  "tools": {
    "fileManagement": {
      "enabled": true,
      "allowedDirectories": ["./", "C:/Users/GauravGupta/Documents"]
    },
    "systemOperations": {
      "enabled": true,
      "allowedCommands": ["dir", "ls", "type", "cat"]
    },
    "apiIntegration": {
      "enabled": true,
      "timeout": 30000
    },
    "database": {
      "enabled": true,
      "defaultDbPath": "./data/mcp.db"
    }
  }
}
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev
```

## License

MIT License
