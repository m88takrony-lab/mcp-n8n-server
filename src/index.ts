#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { N8nClient, Workflow } from './n8n-client.js';

dotenv.config();

const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_BASE_URL || !N8N_API_KEY) {
  console.error('Error: N8N_BASE_URL and N8N_API_KEY must be set in environment variables');
  process.exit(1);
}

const n8nClient = new N8nClient({
  baseUrl: N8N_BASE_URL,
  apiKey: N8N_API_KEY,
});

const server = new Server(
  {
    name: 'mcp-n8n-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: 'list_workflows',
    description: 'List all workflows in your n8n instance',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_workflow',
    description: 'Get details of a specific workflow by ID',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'The ID of the workflow to retrieve',
        },
      },
      required: ['workflowId'],
    },
  },
  {
    name: 'create_workflow',
    description: 'Create a new workflow in n8n',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the workflow',
        },
        nodes: {
          type: 'array',
          description: 'Array of workflow nodes (optional, can be added later)',
        },
        connections: {
          type: 'object',
          description: 'Connections between nodes (optional)',
        },
        active: {
          type: 'boolean',
          description: 'Whether the workflow should be active',
          default: false,
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Tags for the workflow',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_workflow',
    description: 'Update an existing workflow',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'The ID of the workflow to update',
        },
        name: {
          type: 'string',
          description: 'New name for the workflow',
        },
        nodes: {
          type: 'array',
          description: 'Updated array of workflow nodes',
        },
        connections: {
          type: 'object',
          description: 'Updated connections between nodes',
        },
        active: {
          type: 'boolean',
          description: 'Whether the workflow should be active',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Tags for the workflow',
        },
      },
      required: ['workflowId'],
    },
  },
  {
    name: 'delete_workflow',
    description: 'Delete a workflow by ID',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'The ID of the workflow to delete',
        },
      },
      required: ['workflowId'],
    },
  },
  {
    name: 'activate_workflow',
    description: 'Activate a workflow by ID',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'The ID of the workflow to activate',
        },
      },
      required: ['workflowId'],
    },
  },
  {
    name: 'deactivate_workflow',
    description: 'Deactivate a workflow by ID',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'The ID of the workflow to deactivate',
        },
      },
      required: ['workflowId'],
    },
  },
  {
    name: 'list_executions',
    description: 'List workflow executions, optionally filtered by workflow ID',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Optional workflow ID to filter executions',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of executions to return (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_execution',
    description: 'Get details of a specific execution by ID',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'The ID of the execution to retrieve',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'delete_execution',
    description: 'Delete an execution by ID',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'The ID of the execution to delete',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'list_credentials',
    description: 'List all credentials configured in n8n',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_tags',
    description: 'List all tags available in n8n',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handler for calling tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_workflows': {
        const workflows = await n8nClient.listWorkflows();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflows, null, 2),
            },
          ],
        };
      }

      case 'get_workflow': {
        if (!args?.workflowId) {
          throw new Error('workflowId is required');
        }
        const workflow = await n8nClient.getWorkflow(args.workflowId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflow, null, 2),
            },
          ],
        };
      }

      case 'create_workflow': {
        if (!args) {
          throw new Error('Workflow data is required');
        }
        const workflow = await n8nClient.createWorkflow(args as unknown as Workflow);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflow, null, 2),
            },
          ],
        };
      }

      case 'update_workflow': {
        if (!args?.workflowId) {
          throw new Error('workflowId is required');
        }
        const { workflowId, ...updates } = args;
        const workflow = await n8nClient.updateWorkflow(workflowId as string, updates);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflow, null, 2),
            },
          ],
        };
      }

      case 'delete_workflow': {
        if (!args?.workflowId) {
          throw new Error('workflowId is required');
        }
        await n8nClient.deleteWorkflow(args.workflowId as string);
        return {
          content: [
            {
              type: 'text',
              text: `Workflow ${args.workflowId} deleted successfully`,
            },
          ],
        };
      }

      case 'activate_workflow': {
        if (!args?.workflowId) {
          throw new Error('workflowId is required');
        }
        const workflow = await n8nClient.activateWorkflow(args.workflowId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflow, null, 2),
            },
          ],
        };
      }

      case 'deactivate_workflow': {
        if (!args?.workflowId) {
          throw new Error('workflowId is required');
        }
        const workflow = await n8nClient.deactivateWorkflow(args.workflowId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflow, null, 2),
            },
          ],
        };
      }

      case 'list_executions': {
        const executions = await n8nClient.listExecutions(
          args?.workflowId as string | undefined,
          args?.limit as number | undefined
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(executions, null, 2),
            },
          ],
        };
      }

      case 'get_execution': {
        if (!args?.executionId) {
          throw new Error('executionId is required');
        }
        const execution = await n8nClient.getExecution(args.executionId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(execution, null, 2),
            },
          ],
        };
      }

      case 'delete_execution': {
        if (!args?.executionId) {
          throw new Error('executionId is required');
        }
        await n8nClient.deleteExecution(args.executionId as string);
        return {
          content: [
            {
              type: 'text',
              text: `Execution ${args.executionId} deleted successfully`,
            },
          ],
        };
      }

      case 'list_credentials': {
        const credentials = await n8nClient.listCredentials();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(credentials, null, 2),
            },
          ],
        };
      }

      case 'list_tags': {
        const tags = await n8nClient.listTags();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tags, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('n8n MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
