import {
  Complaint,
  ComplaintFormData,
  ComplaintStatus,
  AuthUser,
  ConsumerUser,
  OfficialUser,
} from '../types';
import { safeLocalStorage } from './safeStorage';

const STORAGE_KEY = 'smart_community_complaints';
const AUTH_USER_KEY = 'complainx_auth_user';

export const DEMO_CONSUMER_USER: ConsumerUser = {
  role: 'consumer',
  consumerId: 'CNS-4921',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '98765-43210',
  address: 'Flat 402, Green Valley Apartments, Sector 14',
  wardNo: 'Ward 18 (West District)',
};

export const DEMO_OFFICIAL_USER: OfficialUser = {
  role: 'official',
  officialId: 'OFF-7721',
  name: 'Er. Vikram Malhotra',
  designation: 'Zonal Chief Grievance Officer',
  department: 'Municipal Public Works & Utilities Dept.',
  badgeNumber: 'MCD-ENG-089',
  jurisdiction: 'Zone 4 (Central & West Sectors)',
};

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = safeLocalStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed.role === 'consumer' || parsed.role === 'official')
    ) {
      return parsed as AuthUser;
    }
    // Corrupted record, clear it
    safeLocalStorage.removeItem(AUTH_USER_KEY);
    return null;
  } catch (e) {
    console.warn('Failed to parse auth user from storage, cleared:', e);
    safeLocalStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function setStoredAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      safeLocalStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      safeLocalStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save auth user to storage', e);
  }
}

export const INITIAL_SEED_COMPLAINTS: Complaint[] = [
  {
    complaintId: 'CMP1001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '555-0143',
    category: 'Water',
    title: 'Main pipeline leakage near Central Park',
    description: 'High-pressure clean water is leaking from the underground main pipe on Elm Boulevard opposite Central Park entrance, causing street flooding.',
    location: 'Elm Blvd & 4th Avenue, opposite Central Park West Gate',
    priority: 'High',
    status: 'In Progress',
    date: '2026-09-14',
    lastUpdated: '2026-09-15',
    adminNotes: 'Civic Water Department inspection team dispatched. Excavation scheduled for today.',
  },
  {
    complaintId: 'CMP1002',
    name: 'David Miller',
    email: 'david.m@example.com',
    phone: '555-0182',
    category: 'Street Light',
    title: 'Multiple street lights flickering and dark on Oak Avenue',
    description: 'Five consecutive street lights are completely dark between blocks 12 and 16 on Oak Avenue, creating dangerous visibility for night pedestrians.',
    location: 'Oak Avenue, between Block 12 and Block 16',
    priority: 'Medium',
    status: 'Pending',
    date: '2026-09-15',
    lastUpdated: '2026-09-15',
  },
  {
    complaintId: 'CMP1003',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    phone: '555-0199',
    category: 'Sanitation',
    title: 'Overflowing public garbage disposal bin behind Market Complex',
    description: 'Municipal waste bin has not been collected for three days. Waste is spilling onto the pedestrian sidewalk creating hygiene and odor problems.',
    location: 'Rear parking alley, Community Market Complex #4',
    priority: 'High',
    status: 'Resolved',
    date: '2026-09-11',
    lastUpdated: '2026-09-13',
    adminNotes: 'Sanitation vehicle cleared the dump site and replaced the damaged bin lid.',
  },
  {
    complaintId: 'CMP1004',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    phone: '555-0211',
    category: 'Road',
    title: 'Severe pothole cluster damaging vehicles near School Zone',
    description: 'Deep potholes on the northbound lane right before St. Jude Elementary school crossing. Vehicles are forced to brake suddenly.',
    location: 'North Pine Street, 100m before St. Jude Elementary',
    priority: 'High',
    status: 'In Progress',
    date: '2026-09-13',
    lastUpdated: '2026-09-14',
    adminNotes: 'Roads & Highways engineering team marked zone for cold-mix patch work.',
  },
  {
    complaintId: 'CMP1005',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '555-0234',
    category: 'Electricity',
    title: 'Frequent voltage surges and transformer sparking',
    description: 'Pole transformer emits sparks during peak evening hours (7 PM - 10 PM) causing flickering indoor appliances and power cut-outs.',
    location: 'Corner of Maple Street and 7th Cross',
    priority: 'Medium',
    status: 'Pending',
    date: '2026-09-16',
    lastUpdated: '2026-09-16',
  },
];

export function getStoredComplaints(): Complaint[] {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
      return INITIAL_SEED_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(
        (c): c is Complaint =>
          Boolean(c && typeof c === 'object' && typeof c.complaintId === 'string' && c.complaintId.trim())
      );
      if (valid.length > 0) {
        return valid;
      }
    }
    // Invalid/corrupted array in storage: reset to clean seed data
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
    return INITIAL_SEED_COMPLAINTS;
  } catch (err) {
    console.warn('Failed to read complaints from storage, resetting to seed:', err);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
    return INITIAL_SEED_COMPLAINTS;
  }
}

export function saveStoredComplaints(complaints: Complaint[]): void {
  try {
    const valid = Array.isArray(complaints)
      ? complaints.filter(
          (c): c is Complaint =>
            Boolean(c && typeof c === 'object' && typeof c.complaintId === 'string')
        )
      : [];
    const toSave = valid.length > 0 ? valid : INITIAL_SEED_COMPLAINTS;
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Failed to save complaints to storage:', err);
  }
}

export function generateNextComplaintId(existing: Complaint[]): string {
  let highestNum = 1000;
  if (Array.isArray(existing)) {
    existing.forEach((c) => {
      if (c && typeof c.complaintId === 'string') {
        const match = c.complaintId.match(/CMP(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > highestNum) {
            highestNum = num;
          }
        }
      }
    });
  }
  return `CMP${highestNum + 1}`;
}

export function addComplaintToStorage(formData: ComplaintFormData): Complaint {
  const current = getStoredComplaints();
  const newId = generateNextComplaintId(current);
  const today = new Date().toISOString().split('T')[0];

  const newComplaint: Complaint = {
    complaintId: newId,
    name: formData.name.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    category: formData.category as any,
    title: formData.title.trim(),
    description: formData.description.trim(),
    location: formData.location.trim(),
    priority: formData.priority,
    status: 'Pending',
    date: today,
    lastUpdated: today,
  };

  const updated = [newComplaint, ...current];
  saveStoredComplaints(updated);
  return newComplaint;
}

export function findComplaintById(id: string): Complaint | undefined {
  const complaints = getStoredComplaints();
  const cleanId = id.trim().toUpperCase();
  return complaints.find((c) => c.complaintId.toUpperCase() === cleanId);
}

export function updateComplaintStatusInStorage(
  id: string,
  newStatus: ComplaintStatus,
  adminNotes?: string
): Complaint | undefined {
  const complaints = getStoredComplaints();
  const cleanId = id.trim().toUpperCase();
  let updatedRecord: Complaint | undefined;

  const updated = complaints.map((c) => {
    if (c.complaintId.toUpperCase() === cleanId) {
      updatedRecord = {
        ...c,
        status: newStatus,
        lastUpdated: new Date().toISOString().split('T')[0],
        adminNotes: adminNotes ?? c.adminNotes,
      };
      return updatedRecord;
    }
    return c;
  });

  if (updatedRecord) {
    saveStoredComplaints(updated);
  }
  return updatedRecord;
}

export function deleteComplaintFromStorage(id: string): void {
  const complaints = getStoredComplaints();
  const cleanId = id.trim().toUpperCase();
  const filtered = complaints.filter((c) => c.complaintId.toUpperCase() !== cleanId);
  saveStoredComplaints(filtered);
}

export function resetToDemoComplaints(): Complaint[] {
  saveStoredComplaints(INITIAL_SEED_COMPLAINTS);
  return INITIAL_SEED_COMPLAINTS;
}
