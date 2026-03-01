/**
 * System Operations Tools
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export function registerSystemTools(config) {
  const tools = new Map();

  // Execute Command Tool
  tools.set('execute_command', {
    name: 'execute_command',
    description: 'Execute a system command and return the output',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The command to execute'
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000
        }
      },
      required: ['command']
    },
    handler: async ({ command, timeout = 30000 }) => {
      try {
        // Security check - validate command
        const cmd = command.trim();
        const baseCmd = cmd.split(' ')[0].toLowerCase();
        
        if (config.allowedCommands) {
          const isAllowed = config.allowedCommands.some(allowed => 
            baseCmd === allowed.toLowerCase() || cmd.toLowerCase().startsWith(allowed.toLowerCase())
          );
          if (!isAllowed) {
            return { error: `Command not allowed: ${baseCmd}. Allowed: ${config.allowedCommands.join(', ')}` };
          }
        }

        // Execute the command
        const { stdout, stderr } = await execAsync(cmd, { timeout });
        return {
          success: true,
          command: cmd,
          stdout: stdout || '(no output)',
          stderr: stderr || '(no errors)',
          platform: os.platform()
        };
      } catch (error) {
        return {
          success: false,
          command: command,
          error: error.message,
          stdout: error.stdout || '',
          stderr: error.stderr || ''
        };
      }
    }
  });

  // Get System Info Tool
  tools.set('get_system_info', {
    name: 'get_system_info',
    description: 'Get information about the system',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      try {
        const cpus = os.cpus();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        
        return {
          success: true,
          platform: os.platform(),
          arch: os.arch(),
          release: os.release(),
          type: os.type(),
          hostname: os.hostname(),
          homedir: os.homedir(),
          tmpdir: os.tmpdir(),
          cpuCount: cpus.length,
          cpuModel: cpus[0]?.model || 'Unknown',
          totalMemory: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          freeMemory: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          usedMemory: `${((totalMemory - freeMemory) / 1024 / 1024 / 1024).toFixed(2)} GB`,
          uptime: `${(os.uptime() / 60 / 60).toFixed(2)} hours`
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Get Network Info Tool
  tools.set('get_network_info', {
    name: 'get_network_info',
    description: 'Get network information for the system',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      try {
        const interfaces = os.networkInterfaces();
        const result = {};
        
        for (const [name, addrs] of Object.entries(interfaces)) {
          result[name] = addrs.map(addr => ({
            family: addr.family,
            address: addr.address,
            netmask: addr.netmask,
            mac: addr.mac,
            internal: addr.internal
          }));
        }

        return {
          success: true,
          hostname: os.hostname(),
          interfaces: result
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // List Running Processes Tool (Windows)
  tools.set('list_processes', {
    name: 'list_processes',
    description: 'List running processes on the system',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of processes to return',
          default: 20
        }
      },
      required: []
    },
    handler: async ({ limit = 20 }) => {
      try {
        const isWindows = os.platform() === 'win32';
        const cmd = isWindows 
          ? `tasklist /FO CSV /NH | head -n ${limit}`
          : `ps aux | head -n ${limit}`;
        
        const { stdout } = await execAsync(cmd);
        
        if (isWindows) {
          const processes = stdout.trim().split('\n')
            .filter(line => line.trim())
            .map(line => {
              const parts = line.split('","');
              return {
                name: parts[0]?.replace(/"/g, ''),
                pid: parseInt(parts[1]?.replace(/"/g, '') || '0'),
                sessionName: parts[2]?.replace(/"/g, ''),
                sessionNum: parts[3]?.replace(/"/g, ''),
                memUsage: parts[4]?.replace(/"/g, '')
              };
            });
          return { success: true, platform: 'windows', processes };
        } else {
          const processes = stdout.trim().split('\n').slice(1).map(line => {
            const parts = line.trim().split(/\s+/);
            return {
              user: parts[0],
              pid: parseInt(parts[1]),
              cpu: parts[2],
              mem: parts[3],
              vsz: parts[4],
              tty: parts[5],
              stat: parts[6],
              start: parts[7],
              time: parts[8],
              command: parts.slice(9).join(' ')
            };
          });
          return { success: true, platform: os.platform(), processes };
        }
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Get Disk Info Tool
  tools.set('get_disk_info', {
    name: 'get_disk_info',
    description: 'Get disk space information',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to check disk space (default: current drive)',
          default: 'C:'
        }
      },
      required: []
    },
    handler: async ({ path = 'C:' }) => {
      try {
        const isWindows = os.platform() === 'win32';
        const checkPath = isWindows ? path : '/';
        
        // Use Windows command or Unix df
        const cmd = isWindows 
          ? `wmic logicaldisk where "DeviceID='${path.replace(':', '')}:'" get Size,FreeSpace /VALUE`
          : `df -h "${checkPath}"`;
        
        const { stdout } = await execAsync(cmd);
        
        if (isWindows) {
          const lines = stdout.trim().split('\n');
          let freeSpace = 0;
          let size = 0;
          
          for (const line of lines) {
            if (line.startsWith('FreeSpace=')) {
              freeSpace = parseInt(line.split('=')[1]) || 0;
            }
            if (line.startsWith('Size=')) {
              size = parseInt(line.split('=')[1]) || 0;
            }
          }
          
          const used = size - freeSpace;
          return {
            success: true,
            platform: 'windows',
            path: path,
            total: `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`,
            free: `${(freeSpace / 1024 / 1024 / 1024).toFixed(2)} GB`,
            used: `${(used / 1024 / 1024 / 1024).toFixed(2)} GB`,
            percent: `${((used / size) * 100).toFixed(1)}%`
          };
        } else {
          return { success: true, output: stdout };
        }
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  // Get Current Time Tool
  tools.set('get_current_time', {
    name: 'get_current_time',
    description: 'Get the current system time',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      try {
        const now = new Date();
        return {
          success: true,
          iso: now.toISOString(),
          utc: now.toUTCString(),
          local: now.toLocaleString(),
          epoch: Math.floor(now.getTime() / 1000),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          offset: now.getTimezoneOffset()
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  return tools;
}
