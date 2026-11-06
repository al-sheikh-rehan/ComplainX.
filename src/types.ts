export type ComplaintCategory =
  | 'Water'
  | 'Sanitation'
  | 'Electricity'
  | 'Road'
  | 'Street Light'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  complaintId: string;
  name: string;
  email: string;
  phone: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  location: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  date: string;
  lastUpdated?: string;
  adminNotes?: string;
  assignedOfficer?: string;
  resolutionRemark?: string;
}

export interface ComplaintFormData {
  name: string;
  email: string;
  phone: string;
  category: ComplaintCategory | '';
  title: string;
  description: string;
  location: string;
  priority: ComplaintPriority;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  title?: string;
  description?: string;
  location?: string;
  priority?: string;
}

export type ActiveTab = 'home' | 'submit' | 'track' | 'complaints' | 'about' | 'official_dashboard';

export type UserRole = 'consumer' | 'official';

export interface ConsumerUser {
  role: 'consumer';
  consumerId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  wardNo?: string;
}

export interface OfficialUser {
  role: 'official';
  officialId: string;
  name: string;
  govtEmail?: string;
  designation: string;
  department: string;
  badgeNumber: string;
  jurisdiction: string;
}

export interface OfficialAccount {
  id: string;
  officialId: string;
  govtEmail: string;
  name: string;
  designation: string;
  department: string;
  badgeNumber: string;
  jurisdiction: string;
  pin: string;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
}

export interface DeveloperSession {
  isDeveloper: boolean;
  email: string;
  authenticatedAt: string;
}

export type AuthUser = ConsumerUser | OfficialUser;

