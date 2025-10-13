import axios, { AxiosInstance } from 'axios';

export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
}

export interface Workflow {
  id?: string;
  name: string;
  active?: boolean;
  nodes?: any[];
  connections?: any;
  settings?: any;
  staticData?: any;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  data?: any;
}

export class N8nClient {
  private client: AxiosInstance;

  constructor(config: N8nConfig) {
    this.client = axios.create({
      baseURL: `${config.baseUrl}/api/v1`,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  // Workflow Operations

  async listWorkflows(): Promise<Workflow[]> {
    const response = await this.client.get('/workflows');
    return response.data.data || response.data;
  }

  async getWorkflow(workflowId: string): Promise<Workflow> {
    const response = await this.client.get(`/workflows/${workflowId}`);
    return response.data;
  }

  async createWorkflow(workflow: Workflow): Promise<Workflow> {
    const response = await this.client.post('/workflows', workflow);
    return response.data;
  }

  async updateWorkflow(workflowId: string, workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await this.client.patch(`/workflows/${workflowId}`, workflow);
    return response.data;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.client.delete(`/workflows/${workflowId}`);
  }

  async activateWorkflow(workflowId: string): Promise<Workflow> {
    return this.updateWorkflow(workflowId, { active: true });
  }

  async deactivateWorkflow(workflowId: string): Promise<Workflow> {
    return this.updateWorkflow(workflowId, { active: false });
  }

  // Execution Operations

  async listExecutions(workflowId?: string, limit: number = 20): Promise<WorkflowExecution[]> {
    const params: any = { limit };
    if (workflowId) {
      params.workflowId = workflowId;
    }
    const response = await this.client.get('/executions', { params });
    return response.data.data || response.data;
  }

  async getExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await this.client.get(`/executions/${executionId}`);
    return response.data;
  }

  async deleteExecution(executionId: string): Promise<void> {
    await this.client.delete(`/executions/${executionId}`);
  }

  // Credentials Operations (optional, for advanced usage)

  async listCredentials(): Promise<any[]> {
    const response = await this.client.get('/credentials');
    return response.data.data || response.data;
  }

  // Tags Operations

  async listTags(): Promise<any[]> {
    const response = await this.client.get('/tags');
    return response.data.data || response.data;
  }
}
