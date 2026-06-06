export type UserRole = 'Admin' | 'Project Manager' | 'Team Member';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export type ProjectStatus = 'Active' | 'Completed' | 'On Hold';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  deadline: string;
  status: ProjectStatus;
  members: User[] | string[];
  createdBy: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Comment {
  _id?: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Attachment {
  _id?: string;
  filename: string;
  filepath: string;
  filetype?: string;
  uploadedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: Project | string;
  assignedMember?: User | null;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  comments: Comment[];
  attachments: Attachment[];
  createdBy: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActivityType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_assigned'
  | 'task_completed'
  | 'member_added';

export interface Activity {
  _id: string;
  text: string;
  user: User;
  type: ActivityType;
  project?: Project | null;
  task?: Task | null;
  createdAt: string;
}
