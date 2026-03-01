/**
 * File Management Tools
 */

import fs from 'fs';
import path from 'path';

export function registerFileTools(config) {
  const tools = new Map();

  // Read File Tool
  tools.set('read_file', {
    name: 'read_file',
    description: 'Read the contents of a file from the specified path',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path of the file to read'
        }
      },
      required: ['path']
    },
    handler: async ({ path: filePath }) => {
      try {
        // Security check - validate path
        const resolvedPath = path.resolve(filePath);
        
        if (config.allowedDirectories) {
          const isAllowed = config.allowedDirectories.some(dir => 
            resolvedPath.startsWith(path.resolve(dir))
          );
          if (!isAllowed) {
            return { error: 'Access denied: Path not in allowed directories' };
          }
        }

        if (!fs.existsSync(resolvedPath)) {
          return { error: `File not found: ${filePath}` };
        }

        const stats = fs.statSync(resolvedPath);
        if (stats.size > config.maxFileSize) {
          return { error: `File too large: ${stats.size} bytes (max: ${config.maxFileSize})` };
        }

        const content = fs.readFileSync(resolvedPath, 'utf-8');
        return { success: true, path: filePath, content, size: stats.size };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Write File Tool
  tools.set('write_file', {
    name: 'write_file',
    description: 'Write content to a file at the specified path',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path of the file to write'
        },
        content: {
          type: 'string',
          description: 'The content to write to the file'
        }
      },
      required: ['path', 'content']
    },
    handler: async ({ path: filePath, content }) => {
      try {
        const resolvedPath = path.resolve(filePath);
        
        if (config.allowedDirectories) {
          const isAllowed = config.allowedDirectories.some(dir => 
            resolvedPath.startsWith(path.resolve(dir))
          );
          if (!isAllowed) {
            return { error: 'Access denied: Path not in allowed directories' };
          }
        }

        // Create directory if it doesn't exist
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(resolvedPath, content, 'utf-8');
        const stats = fs.statSync(resolvedPath);
        return { success: true, path: filePath, size: stats.size };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // List Directory Tool
  tools.set('list_directory', {
    name: 'list_directory',
    description: 'List files and directories in a specified path',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path of the directory to list'
        },
        recursive: {
          type: 'boolean',
          description: 'Whether to list files recursively',
          default: false
        }
      },
      required: ['path']
    },
    handler: async ({ path: dirPath, recursive = false }) => {
      try {
        const resolvedPath = path.resolve(dirPath);
        
        if (config.allowedDirectories) {
          const isAllowed = config.allowedDirectories.some(dir => 
            resolvedPath.startsWith(path.resolve(dir))
          );
          if (!isAllowed) {
            return { error: 'Access denied: Path not in allowed directories' };
          }
        }

        if (!fs.existsSync(resolvedPath)) {
          return { error: `Directory not found: ${dirPath}` };
        }

        const stats = fs.statSync(resolvedPath);
        if (!stats.isDirectory()) {
          return { error: `Not a directory: ${dirPath}` };
        }

        const listDir = (dir, depth = 0) => {
          const items = fs.readdirSync(dir);
          const result = [];
          
          for (const item of items) {
            const fullPath = path.join(dir, item);
            const itemStats = fs.statSync(fullPath);
            
            result.push({
              name: item,
              path: fullPath,
              type: itemStats.isDirectory() ? 'directory' : 'file',
              size: itemStats.size,
              modified: itemStats.mtime.toISOString()
            });

            if (itemStats.isDirectory() && recursive && depth < 5) {
              result.push(...listDir(fullPath, depth + 1));
            }
          }
          
          return result;
        };

        const items = listDir(resolvedPath);
        return { success: true, path: dirPath, items, count: items.length };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Delete File Tool
  tools.set('delete_file', {
    name: 'delete_file',
    description: 'Delete a file from the specified path',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path of the file to delete'
        }
      },
      required: ['path']
    },
    handler: async ({ path: filePath }) => {
      try {
        const resolvedPath = path.resolve(filePath);
        
        if (config.allowedDirectories) {
          const isAllowed = config.allowedDirectories.some(dir => 
            resolvedPath.startsWith(path.resolve(dir))
          );
          if (!isAllowed) {
            return { error: 'Access denied: Path not in allowed directories' };
          }
        }

        if (!fs.existsSync(resolvedPath)) {
          return { error: `File not found: ${filePath}` };
        }

        fs.unlinkSync(resolvedPath);
        return { success: true, path: filePath, deleted: true };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Create Directory Tool
  tools.set('create_directory', {
    name: 'create_directory',
    description: 'Create a new directory at the specified path',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path of the directory to create'
        }
      },
      required: ['path']
    },
    handler: async ({ path: dirPath }) => {
      try {
        const resolvedPath = path.resolve(dirPath);
        
        if (config.allowedDirectories) {
          const isAllowed = config.allowedDirectories.some(dir => 
            resolvedPath.startsWith(path.resolve(dir))
          );
          if (!isAllowed) {
            return { error: 'Access denied: Path not in allowed directories' };
          }
        }

        if (fs.existsSync(resolvedPath)) {
          return { error: `Directory already exists: ${dirPath}` };
        }

        fs.mkdirSync(resolvedPath, { recursive: true });
        return { success: true, path: dirPath, created: true };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // File Info Tool
  tools.set('file_info', {
    name: 'file_info',
    description: 'Get information about a file or directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path of the file or directory'
        }
      },
      required: ['path']
    },
    handler: async ({ path: filePath }) => {
      try {
        const resolvedPath = path.resolve(filePath);
        
        if (config.allowedDirectories) {
          const isAllowed = config.allowedDirectories.some(dir => 
            resolvedPath.startsWith(path.resolve(dir))
          );
          if (!isAllowed) {
            return { error: 'Access denied: Path not in allowed directories' };
          }
        }

        if (!fs.existsSync(resolvedPath)) {
          return { error: `Path not found: ${filePath}` };
        }

        const stats = fs.statSync(resolvedPath);
        return {
          success: true,
          path: filePath,
          name: path.basename(resolvedPath),
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          accessed: stats.atime.toISOString()
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  return tools;
}
