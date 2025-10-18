#!/usr/bin/env node

/**
 * MCP Server - STDIO Mode
 * 
 * This is a simplified entry point for STDIO mode.
 * It imports and uses the main server configured for STDIO transport.
 * 
 * Usage:
 *   node mcp-server.js
 * 
 * Or add to Claude Desktop / Cursor config:
 * {
 *   "mcpServers": {
 *     "enpara": {
 *       "command": "node",
 *       "args": ["mcp-server.js"],
 *       "cwd": "/path/to/enBankChatGptMcp-main"
 *     }
 *   }
 * }
 */

import { config } from 'dotenv';

// Load environment variables
config();

// Set STDIO mode
process.env.MCP_MODE = 'stdio';

// Import and run the main server
import('./server.js').catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});
