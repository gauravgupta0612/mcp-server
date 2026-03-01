/**
 * Dynamic MCP Server
 * Main Entry Point
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { registerFileTools } from './tools/file-tools.js';
import { registerSystemTools } from './tools/system-tools.js';
import { registerApiTools } from './tools/api-tools.js';
import { registerDatabaseTools } from './tools/database-tools.js';
import { registerDynamicResources } from './resources/dynamic-resources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const configPath = path.join(__dirname, '../config/server-config.json');
let config = {
  server: { name: 'mcp-server', version: '1.0.0', description: 'Dynamic MCP Server' },
  tools: { enabled: true, fileManagement: { enabled: true }, systemOperations: { enabled: true }, apiIntegration: { enabled: true }, database: { enabled: true } },
  resources: { enabled: true }
};

try {
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData);
    console.error(`[MCP] Configuration loaded from ${configPath}`);
  } else {
    console.error('[MCP] Using default configuration');
  }
} catch (error) {
  console.error('[MCP] Error loading configuration:', error.message);
}

// Create the MCP Server
class MCPServer {
  constructor() {
    this.tools = new Map();
    this.resources = new Map();
    
    // Register all tools first
    this.registerTools();
    
    // Register all resources
    this.registerResources();

    console.error(`[MCP] Server initialized with ${this.tools.size} tools and ${this.resources.size} resources`);

    // Now create server with all capabilities
    const toolCapabilities = {};
    this.tools.forEach((_, name) => {
      toolCapabilities[name] = {};
    });

    const resourceCapabilities = {};
    this.resources.forEach((resource, name) => {
      resourceCapabilities[resource.uri] = {};
    });

    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
        description: config.server.description
      },
      {
        capabilities: {
          tools: toolCapabilities,
          resources: resourceCapabilities
        }
      }
    );

    // Set up request handlers
    this.setupHandlers();
  }

  registerTools() {
    // File Management Tools
    if (config.tools.enabled && config.tools.fileManagement?.enabled) {
      const fileTools = registerFileTools(config.tools.fileManagement);
      fileTools.forEach((tool, name) => {
        this.tools.set(name, tool);
      });
    }

    // System Operations Tools
    if (config.tools.enabled && config.tools.systemOperations?.enabled) {
      const systemTools = registerSystemTools(config.tools.systemOperations);
      systemTools.forEach((tool, name) => {
        this.tools.set(name, tool);
      });
    }

    // API Integration Tools
    if (config.tools.enabled && config.tools.apiIntegration?.enabled) {
      const apiTools = registerApiTools(config.tools.apiIntegration);
      apiTools.forEach((tool, name) => {
        this.tools.set(name, tool);
      });
    }

    // Database Tools
    if (config.tools.enabled && config.tools.database?.enabled) {
      const dbTools = registerDatabaseTools(config.tools.database);
      dbTools.forEach((tool, name) => {
        this.tools.set(name, tool);
      });
    }
  }

  registerResources() {
    if (config.resources.enabled) {
      const dynamicResources = registerDynamicResources(config.resources);
      dynamicResources.forEach((resource, name) => {
        this.resources.set(name, resource);
      });
    }
  }

  setupHandlers() {
    // List Tools Handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const toolsList = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));
      return { tools: toolsList };
    });

    // Call Tool Handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.get(name);
      
      if (!tool) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Tool '${name}' not found`
            }
          ],
          isError: true
        };
      }

      try {
        const result = await tool.handler(args);
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });

    // List Resources Handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resourcesList = Array.from(this.resources.values()).map(resource => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType
      }));
      return { resources: resourcesList };
    });

    // Read Resource Handler
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      const resource = Array.from(this.resources.values()).find(r => r.uri === uri);
      
      if (!resource) {
        throw new Error(`Resource '${uri}' not found`);
      }

      const content = await resource.handler();
      return {
        contents: [
          {
            uri: uri,
            mimeType: resource.mimeType,
            text: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
          }
        ]
      };
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP] Server started and ready');
  }
}

// Start the server
const server = new MCPServer();
server.start().catch(error => {
  console.error('[MCP] Failed to start server:', error);
  process.exit(1);
});
