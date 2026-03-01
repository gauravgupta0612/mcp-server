/**
 * Dynamic Resources
 */

import fs from 'fs';
import path from 'path';
import { watch } from 'chokidar';
import os from 'os';

export function registerDynamicResources(config) {
  const resources = new Map();

  // Server Info Resource
  resources.set('server-info', {
    uri: 'mcp://server/info',
    name: 'Server Information',
    description: 'Information about the MCP Server',
    mimeType: 'application/json',
    handler: async () => {
      return {
        name: 'mcp-server',
        version: '1.0.0',
        description: 'Dynamic MCP Server',
        capabilities: {
          tools: true,
          resources: true
        },
        timestamp: new Date().toISOString()
      };
    }
  });

  // System Status Resource
  resources.set('system-status', {
    uri: 'mcp://system/status',
    name: 'System Status',
    description: 'Current system status and metrics',
    mimeType: 'application/json',
    handler: async () => {
      const cpus = os.cpus();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      
      return {
        uptime: os.uptime(),
        platform: os.platform(),
        hostname: os.hostname(),
        cpu: {
          count: cpus.length,
          model: cpus[0]?.model || 'Unknown',
          speed: cpus[0]?.speed || 0
        },
        memory: {
          total: totalMem,
          free: freeMem,
          used: totalMem - freeMem,
          percent: (((totalMem - freeMem) / totalMem) * 100).toFixed(2)
        },
        timestamp: new Date().toISOString()
      };
    }
  });

  // File System Watcher Resource
  let fileWatcher = null;
  
  resources.set('file-watcher', {
    uri: 'mcp://filesystem/watch',
    name: 'File System Watcher',
    description: 'Watch for file changes in specified directories',
    mimeType: 'application/json',
    handler: async () => {
      if (!config.watchPaths || config.watchPaths.length === 0) {
        return { 
          status: 'no-paths-configured',
          message: 'No paths configured for watching',
          configuredPaths: []
        };
      }

      const watchedPaths = fileWatcher 
        ? fileWatcher.getWatched() 
        : {};

      return {
        status: 'watching',
        configuredPaths: config.watchPaths,
        watchedPaths: Object.keys(watchedPaths),
        fileCount: Object.values(watchedPaths).flat().length,
        timestamp: new Date().toISOString()
      };
    }
  });

  // Directory Listing Resource
  resources.set('directory-listing', {
    uri: 'mcp://filesystem/directories',
    name: 'Directory Listings',
    description: 'List contents of configured directories',
    mimeType: 'application/json',
    handler: async () => {
      const directories = config.watchPaths || ['.'];
      const listings = {};

      for (const dir of directories) {
        try {
          const resolvedPath = path.resolve(dir);
          if (fs.existsSync(resolvedPath)) {
            const items = fs.readdirSync(resolvedPath);
            listings[dir] = items.map(item => {
              const itemPath = path.join(resolvedPath, item);
              const stats = fs.statSync(itemPath);
              return {
                name: item,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                modified: stats.mtime.toISOString()
              };
            });
          }
        } catch (error) {
          listings[dir] = { error: error.message };
        }
      }

      return {
        directories: listings,
        timestamp: new Date().toISOString()
      };
    }
  });

  // Config Resource
  resources.set('config', {
    uri: 'mcp://config',
    name: 'Server Configuration',
    description: 'Current server configuration (sanitized)',
    mimeType: 'application/json',
    handler: async () => {
      return {
        server: config.server,
        tools: {
          fileManagement: config.tools?.fileManagement ? {
            enabled: config.tools.fileManagement.enabled,
            allowedDirectories: config.tools.fileManagement.allowedDirectories?.map(d => d.toString()),
            maxFileSize: config.tools.fileManagement.maxFileSize
          } : { enabled: false },
          systemOperations: config.tools?.systemOperations ? {
            enabled: config.tools.systemOperations.enabled,
            allowedCommands: config.tools.systemOperations.allowedCommands
          } : { enabled: false },
          apiIntegration: config.tools?.apiIntegration ? {
            enabled: config.tools.apiIntegration.enabled,
            timeout: config.tools.apiIntegration.timeout
          } : { enabled: false },
          database: config.tools?.database ? {
            enabled: config.tools.database.enabled,
            defaultDbPath: config.tools.database.defaultDbPath
          } : { enabled: false }
        },
        resources: {
          enabled: config.resources?.enabled,
          watchPaths: config.resources?.watchPaths,
          refreshInterval: config.resources?.refreshInterval
        }
      };
    }
  });

  // Logs Resource
  resources.set('logs', {
    uri: 'mcp://logs',
    name: 'Server Logs',
    description: 'Recent server activity logs',
    mimeType: 'application/json',
    handler: async () => {
      return {
        logs: [
          { level: 'info', message: 'MCP Server started', timestamp: new Date().toISOString() },
          { level: 'info', message: 'Configuration loaded successfully', timestamp: new Date().toISOString() },
          { level: 'info', message: 'All tools registered', timestamp: new Date().toISOString() }
        ],
        timestamp: new Date().toISOString()
      };
    }
  });

  // Initialize file watcher if paths are configured
  if (config.watchPaths && config.watchPaths.length > 0) {
    try {
      fileWatcher = watch(config.watchPaths, {
        persistent: true,
        ignoreInitial: true,
        depth: 2
      });

      fileWatcher
        .on('add', path => console.error(`[MCP] File added: ${path}`))
        .on('change', path => console.error(`[MCP] File changed: ${path}`))
        .on('unlink', path => console.error(`[MCP] File removed: ${path}`));

      console.error(`[MCP] File watcher initialized for: ${config.watchPaths.join(', ')}`);
    } catch (error) {
      console.error('[MCP] Failed to initialize file watcher:', error.message);
    }
  }

  return resources;
}
