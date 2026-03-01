/**
 * API Integration Tools
 */

import axios from 'axios';

export function registerApiTools(config) {
  const tools = new Map();

  // HTTP GET Request Tool
  tools.set('http_get', {
    name: 'http_get',
    description: 'Make an HTTP GET request to a specified URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to make the GET request to'
        },
        headers: {
          type: 'object',
          description: 'Optional HTTP headers',
          default: {}
        },
        params: {
          type: 'object',
          description: 'Optional query parameters',
          default: {}
        }
      },
      required: ['url']
    },
    handler: async ({ url, headers = {}, params = {} }) => {
      try {
        const response = await axios.get(url, {
          headers,
          params,
          timeout: config.timeout || 30000
        });

        return {
          success: true,
          url,
          method: 'GET',
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        };
      } catch (error) {
        return {
          success: false,
          url,
          method: 'GET',
          error: error.message,
          code: error.code,
          status: error.response?.status
        };
      }
    }
  });

  // HTTP POST Request Tool
  tools.set('http_post', {
    name: 'http_post',
    description: 'Make an HTTP POST request to a specified URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to make the POST request to'
        },
        data: {
          type: 'object',
          description: 'The data to send in the request body'
        },
        headers: {
          type: 'object',
          description: 'Optional HTTP headers',
          default: {}
        },
        params: {
          type: 'object',
          description: 'Optional query parameters',
          default: {}
        }
      },
      required: ['url', 'data']
    },
    handler: async ({ url, data, headers = {}, params = {} }) => {
      try {
        const response = await axios.post(url, data, {
          headers,
          params,
          timeout: config.timeout || 30000
        });

        return {
          success: true,
          url,
          method: 'POST',
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        };
      } catch (error) {
        return {
          success: false,
          url,
          method: 'POST',
          error: error.message,
          code: error.code,
          status: error.response?.status
        };
      }
    }
  });

  // HTTP PUT Request Tool
  tools.set('http_put', {
    name: 'http_put',
    description: 'Make an HTTP PUT request to a specified URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to make the PUT request to'
        },
        data: {
          type: 'object',
          description: 'The data to send in the request body'
        },
        headers: {
          type: 'object',
          description: 'Optional HTTP headers',
          default: {}
        }
      },
      required: ['url', 'data']
    },
    handler: async ({ url, data, headers = {} }) => {
      try {
        const response = await axios.put(url, data, {
          headers,
          timeout: config.timeout || 30000
        });

        return {
          success: true,
          url,
          method: 'PUT',
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        };
      } catch (error) {
        return {
          success: false,
          url,
          method: 'PUT',
          error: error.message,
          code: error.code,
          status: error.response?.status
        };
      }
    }
  });

  // HTTP DELETE Request Tool
  tools.set('http_delete', {
    name: 'http_delete',
    description: 'Make an HTTP DELETE request to a specified URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to make the DELETE request to'
        },
        headers: {
          type: 'object',
          description: 'Optional HTTP headers',
          default: {}
        }
      },
      required: ['url']
    },
    handler: async ({ url, headers = {} }) => {
      try {
        const response = await axios.delete(url, {
          headers,
          timeout: config.timeout || 30000
        });

        return {
          success: true,
          url,
          method: 'DELETE',
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        };
      } catch (error) {
        return {
          success: false,
          url,
          method: 'DELETE',
          error: error.message,
          code: error.code,
          status: error.response?.status
        };
      }
    }
  });

  // Generic HTTP Request Tool
  tools.set('http_request', {
    name: 'http_request',
    description: 'Make a generic HTTP request with custom method',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        },
        url: {
          type: 'string',
          description: 'The URL to make the request to'
        },
        data: {
          type: 'object',
          description: 'The data to send in the request body'
        },
        headers: {
          type: 'object',
          description: 'Optional HTTP headers',
          default: {}
        },
        params: {
          type: 'object',
          description: 'Optional query parameters',
          default: {}
        }
      },
      required: ['method', 'url']
    },
    handler: async ({ method, url, data = null, headers = {}, params = {} }) => {
      try {
        const response = await axios({
          method,
          url,
          data,
          headers,
          params,
          timeout: config.timeout || 30000
        });

        return {
          success: true,
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        };
      } catch (error) {
        return {
          success: false,
          url,
          method,
          error: error.message,
          code: error.code,
          status: error.response?.status
        };
      }
    }
  });

  return tools;
}
