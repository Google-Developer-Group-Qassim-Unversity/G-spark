// API Configuration
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7001';

// Types
export interface Department {
  department_id: number;
  department_name: string;
  votes: number;
}

// Mock data fallback
const MOCK_DEPARTMENTS: Department[] = [
  { department_id: 1, department_name: 'Computer Science', votes: 45 },
  { department_id: 2, department_name: 'Software Engineering', votes: 38 },
  { department_id: 3, department_name: 'Information Technology', votes: 32 },
  { department_id: 4, department_name: 'Cyber Security', votes: 28 },
  { department_id: 5, department_name: 'Data Science', votes: 25 },
];

// Get department votes
export async function getDepartmentVotes(): Promise<Department[]> {
  try {
    const response = await fetch(`${BASE_URL}/departments/votes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('[v0] API not available, using mock data');
      return MOCK_DEPARTMENTS;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[v0] API error, using mock data:', error);
    return MOCK_DEPARTMENTS;
  }
}

// Cast a vote for a department
export async function castVote(departmentId: number): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/departments/votes/${departmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('[v0] Vote API not available');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[v0] Vote error:', error);
    return false;
  }
}
