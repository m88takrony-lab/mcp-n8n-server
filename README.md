# n8n MCP Server

> A Model Context Protocol (MCP) server that bridges Claude AI with n8n workflow automation, enabling intelligent workflow creation and management through natural language.

## Table of Contents

- [What is This?](#what-is-this)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
  - [Method 1: Docker (Recommended)](#method-1-docker-recommended)
  - [Method 2: Local Development](#method-2-local-development)
  - [Method 3: Portainer Deployment](#method-3-portainer-deployment)
- [Configuration](#configuration)
  - [Connecting to Claude Desktop](#connecting-to-claude-desktop)
  - [Connecting to Claude Code (CLI)](#connecting-to-claude-code-cli)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)

---

## What is This?

This project provides a **Model Context Protocol (MCP) server** that connects AI assistants (like Claude) to your [n8n](https://n8n.io/) workflow automation instance. With this integration, you can:

- **Create workflows** using natural language descriptions
- **Manage existing workflows** (activate, deactivate, update, delete)
- **Monitor executions** and debug issues
- **Query workflow status** and configuration
- **Automate workflow operations** through conversational AI

### Why Use This?

Instead of manually building workflows in the n8n UI, you can simply describe what you want to Claude:

> "Create a workflow that monitors my GitHub repository for new issues, sends a Slack notification to the team channel, and creates a Trello card for tracking."

Claude, connected to your n8n instance via this MCP server, can build the workflow for you automatically.

---

## Features

- **Full Workflow Management**
  - List, create, update, and delete workflows
  - Activate and deactivate workflows on demand
  - Get detailed workflow configurations

- **Execution Monitoring**
  - View workflow execution history
  - Get detailed execution logs and results
  - Delete old executions

- **Resource Management**
  - List and manage credentials
  - Organize workflows with tags

- **Flexible Deployment**
  - Docker support for containerized environments
  - Local development setup
  - Portainer-ready for home lab deployments

- **Secure Integration**
  - API key authentication
  - Environment-based configuration
  - No hardcoded credentials

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20 or higher** (for local development)
- **Docker and Docker Compose** (for containerized deployment)
- **A running n8n instance** (self-hosted or cloud)
- **n8n API key** (instructions below)
- **Claude Desktop** or **Claude Code** (CLI)

### Getting Your n8n API Key

1. Log in to your n8n instance
2. Navigate to **Settings** → **n8n API**
3. Click **Create an API Key**
4. Copy the generated API key (you'll need this for configuration)
5. Store it securely (treat it like a password)

---

## Quick Start

Get up and running in 3 minutes:

```bash
# Clone the repository
git clone https://github.com/nourdeo/mcp-n8n-server.git
cd mcp-n8n-server

# Install dependencies
npm install

# Create configuration
cp .env.example .env
# Edit .env with your n8n details

# Build the project
npm run build

# Start the server
npm start
```

Then configure Claude (see [Configuration](#configuration) section).

---

## Installation Methods

### Method 1: Docker (Recommended)

Best for production deployments, home labs, and containerized environments.

#### Step 1: Clone the repository

```bash
git clone https://github.com/nourdeo/mcp-n8n-server.git
cd mcp-n8n-server
```

#### Step 2: Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your n8n details:

```env
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here
```

#### Step 3: Build and run with Docker Compose

```bash
docker-compose up -d
```

#### Step 4: Verify it's running

```bash
docker ps | grep mcp-n8n-server
docker logs mcp-n8n-server
```

---

### Method 2: Local Development

Best for development, testing, and customization.

#### Step 1: Install dependencies

```bash
npm install
```

#### Step 2: Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

#### Step 3: Build the project

```bash
npm run build
```

#### Step 4: Run the server

```bash
npm start
```

For development with auto-reload:

```bash
npm run watch
```

---

### Method 3: Portainer Deployment

Perfect for home lab environments using Portainer.

#### Step 1: Create a new stack

1. Open Portainer
2. Go to **Stacks** → **Add stack**
3. Name it `mcp-n8n-server`

#### Step 2: Upload docker-compose.yml

Either upload the `docker-compose.yml` file or paste its contents:

```yaml
version: '3.8'

services:
  mcp-n8n-server:
    build: .
    container_name: mcp-n8n-server
    environment:
      - N8N_BASE_URL=${N8N_BASE_URL}
      - N8N_API_KEY=${N8N_API_KEY}
    restart: unless-stopped
    stdin_open: true
    tty: true
```

#### Step 3: Add environment variables

In Portainer's environment variables section, add:

- `N8N_BASE_URL`: `https://your-n8n-instance.com`
- `N8N_API_KEY`: `your-api-key-here`

#### Step 4: Deploy

Click **Deploy the stack** and wait for it to start.

---

## Configuration

### Connecting to Claude Desktop

Claude Desktop uses a configuration file to connect to MCP servers.

**Configuration file location:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

#### For Local Installation:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-n8n-server/build/index.js"],
      "env": {
        "N8N_BASE_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `/absolute/path/to/` with the actual path to your installation.

#### For Docker Installation:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-n8n-server",
        "node",
        "build/index.js"
      ],
      "env": {
        "N8N_BASE_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**After editing the config, restart Claude Desktop.**

---

### Connecting to Claude Code (CLI)

Claude Code (the CLI version) has a separate configuration file.

**Configuration file location:**

- **macOS/Linux**: `~/.config/claude/config.json`
- **Windows**: `%USERPROFILE%\.config\claude\config.json`

Create or edit this file:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-n8n-server/build/index.js"],
      "env": {
        "N8N_BASE_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**After editing the config, restart Claude Code.**

---

## Available Tools

The MCP server exposes the following tools to Claude:

### Workflow Management

| Tool | Description |
|------|-------------|
| `list_workflows` | List all workflows with their status |
| `get_workflow` | Get detailed information about a specific workflow |
| `create_workflow` | Create a new workflow from scratch |
| `update_workflow` | Update an existing workflow's configuration |
| `delete_workflow` | Permanently delete a workflow |
| `activate_workflow` | Activate a workflow to make it run |
| `deactivate_workflow` | Deactivate a workflow to stop it |

### Execution Management

| Tool | Description |
|------|-------------|
| `list_executions` | List workflow execution history |
| `get_execution` | Get detailed execution logs and results |
| `delete_execution` | Delete a specific execution record |

### Resource Management

| Tool | Description |
|------|-------------|
| `list_credentials` | List all configured credentials |
| `list_tags` | List all available tags |

---

## Usage Examples

Once connected to Claude, you can use natural language to interact with your n8n instance:

### Basic Queries

```
"List all my n8n workflows"
"Show me the details of workflow ID 123"
"What are the recent executions for my email workflow?"
```

### Workflow Management

```
"Create a new workflow called 'Daily Backup Notification'"
"Activate the workflow with ID 456"
"Deactivate all workflows tagged with 'testing'"
```

### Advanced Workflow Creation

```
"Help me build a workflow that:
1. Monitors my GitHub repository for new issues
2. Sends a Slack notification to #dev-team
3. Creates a Trello card in the 'To Do' list"
```

```
"Create a workflow that checks my website every 5 minutes
and sends me an email if it's down"
```

### Debugging and Monitoring

```
"Show me all failed executions from the past week"
"Why did workflow 789 fail? Show me the execution details"
"List all workflows that haven't been executed in the past month"
```

---

## Project Structure

```
mcp-n8n-server/
├── src/
│   ├── index.ts              # Main MCP server implementation
│   └── n8n-client.ts         # n8n API client wrapper
├── build/                    # Compiled JavaScript (generated)
│   ├── index.js
│   └── n8n-client.js
├── node_modules/             # Dependencies (generated)
├── .env                      # Your environment variables (not in git)
├── .env.example              # Example environment variables template
├── .gitignore                # Git ignore rules
├── .dockerignore             # Docker ignore rules
├── package.json              # Node.js dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── tsconfig.json             # TypeScript compiler configuration
├── Dockerfile                # Docker image definition
├── docker-compose.yml        # Docker Compose orchestration
└── README.md                 # This file
```

---

## Development

### Available Scripts

```bash
# Build the project
npm run build

# Watch mode (auto-recompile on changes)
npm run watch

# Start the server
npm start

# Development mode (build + start)
npm run dev
```

### Making Changes

1. Edit TypeScript files in `src/`
2. Run `npm run build` to compile
3. Test with `npm start`
4. For active development, use `npm run watch` in one terminal and `npm start` in another

### Adding New Tools

To add a new MCP tool:

1. Add the API method to `src/n8n-client.ts`
2. Register the tool in `src/index.ts`
3. Define the tool's schema and handler
4. Rebuild and test

---

## Troubleshooting

### Connection Issues

#### Verify n8n is accessible:

```bash
curl https://your-n8n-instance.com/api/v1/workflows \
  -H "X-N8N-API-KEY: your-api-key"
```

Expected: JSON response with workflows list

#### Check Docker logs:

```bash
docker logs mcp-n8n-server
```

Look for connection errors or authentication issues.

#### Verify environment variables:

```bash
docker exec mcp-n8n-server env | grep N8N
```

Ensure both `N8N_BASE_URL` and `N8N_API_KEY` are set correctly.

---

### Authentication Errors

**Symptoms**: 401 Unauthorized or 403 Forbidden

**Solutions**:
- Ensure your API key is valid and hasn't expired
- Verify the API key has the necessary permissions
- Check that you're using the correct API key format
- Confirm the base URL is correct (no trailing slash)

---

### Claude Not Seeing the Server

**Symptoms**: MCP server not listed in Claude, tools unavailable

**Solutions**:
- Restart Claude Desktop/Code after updating config
- Verify the config file path is correct
- Check JSON syntax in config file (use a JSON validator)
- Ensure the server process is running:
  - Docker: `docker ps | grep mcp-n8n-server`
  - Local: Check if the process is active
- Review Claude's MCP logs for error messages

---

### Build Errors

**Symptoms**: TypeScript compilation fails

**Solutions**:
- Ensure Node.js 20+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build directory: `rm -rf build && npm run build`

---

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`, but always double-check
   - Use `.env.example` as a template

2. **Use HTTPS for n8n**
   - Always use `https://` in `N8N_BASE_URL`
   - Don't expose n8n over plain HTTP

3. **Secure your API keys**
   - Treat API keys like passwords
   - Rotate keys regularly
   - Use separate keys for different environments

4. **Network restrictions**
   - Use firewall rules to limit access to n8n API
   - Consider VPN or private networks for home labs
   - Use Docker networks for container isolation

5. **Regular updates**
   - Keep dependencies up to date: `npm update`
   - Monitor for security advisories
   - Rebuild Docker images periodically

6. **Access control**
   - Limit who can access the MCP server
   - Use read-only API keys when possible
   - Audit workflow changes regularly

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue with details and reproduction steps
2. **Suggest features**: Open an issue with your idea and use case
3. **Submit pull requests**: Fork the repo, make changes, and submit a PR
4. **Improve documentation**: Help make this README even better

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/nourdeo/mcp-n8n-server.git
cd mcp-n8n-server

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and test
npm run build
npm start

# Commit and push
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Resources

### Official Documentation

- [n8n Documentation](https://docs.n8n.io/) - Learn about n8n workflow automation
- [n8n API Reference](https://docs.n8n.io/api/api-reference/) - Complete n8n API documentation
- [Model Context Protocol](https://modelcontextprotocol.io/) - Learn about MCP architecture
- [Claude Desktop](https://claude.ai/download) - Download Claude Desktop app
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code) - Claude CLI documentation

### Community and Support

- [n8n Community Forum](https://community.n8n.io/) - Get help from the n8n community
- [MCP GitHub](https://github.com/modelcontextprotocol) - MCP specification and examples
- [Anthropic Discord](https://discord.gg/anthropic) - Join the Anthropic community

### Related Projects

- [n8n](https://github.com/n8n-io/n8n) - The n8n workflow automation tool
- [MCP Servers](https://github.com/modelcontextprotocol/servers) - Collection of MCP server implementations

---

**Built with Claude Code** - An AI-assisted development project demonstrating the power of human-AI collaboration.

---

## Questions?

If you have questions or need help:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search [existing issues](https://github.com/nourdeo/mcp-n8n-server/issues)
3. Open a [new issue](https://github.com/nourdeo/mcp-n8n-server/issues/new) with details

Happy automating!
