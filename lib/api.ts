// API Configuration
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://vote.albrrak773.com"
console.log('🌍 API Base URL:', BASE_URL);
// Types
export interface Department {
  department_id: number;
  department_name: string;
  votes: number;
}

export interface DepartmentResponse {
  [key: string]: {
    votes: number;
    department_name: string;
  };
}

export interface HasVotedResponse {
  has_voted: boolean;
}

// Mock data fallback
const MOCK_DEPARTMENTS: Department[] = [
  { department_id: 1, department_name: 'Computer Science', votes: 45 },
  { department_id: 2, department_name: 'Software Engineering', votes: 38 },
  { department_id: 3, department_name: 'Information Technology', votes: 32 },
  { department_id: 4, department_name: 'Cyber Security', votes: 28 },
  { department_id: 5, department_name: 'Data Science', votes: 25 },
];

// Transform backend response to frontend format
function transformDepartmentResponse(response: DepartmentResponse): Department[] {
  return Object.entries(response).map(([id, data]) => ({
    department_id: parseInt(id),
    department_name: data.department_name,
    votes: data.votes,
  }));
}

// Get department votes (public endpoint)
export async function getDepartmentVotes(): Promise<Department[]> {
  try {
    console.log('[v0] Fetching departments from:', `${BASE_URL}/departments/votes`);
    
    const response = await fetch(`${BASE_URL}/departments/votes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('[v0] Department response status:', response.status);

    if (!response.ok) {
      console.warn('[v0] API not available, using mock data');
      const error = await response.text();
      console.error('[v0] API response error:', error);
      return MOCK_DEPARTMENTS;
    }

    const data: DepartmentResponse = await response.json();
    console.log('[v0] Departments fetched:', Object.keys(data).length);
    return transformDepartmentResponse(data);
  } catch (error) {
    console.warn('[v0] API error, using mock data:', error);
    return MOCK_DEPARTMENTS;
  }
}

// Check if user has voted (authenticated endpoint)
export async function checkHasVoted(token: string): Promise<boolean> {
  try {
    console.log('[v0] Checking vote status at:', `${BASE_URL}/members/votes`);
    
    const response = await fetch(`${BASE_URL}/members/votes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    console.log('[v0] Check voted response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Check voted API error:', response.status, errorText);
      return false;
    }

    const data: HasVotedResponse = await response.json();
    console.log('[v0] Vote status:', data);
    return data.has_voted;
  } catch (error) {
    console.error('[v0] Check voted error:', error);
    return false;
  }
}

// Cast a vote for a department (authenticated endpoint)
export async function castVote(
  departmentId: number, 
  token: string
): Promise<{ success: boolean; departments?: Department[]; error?: string }> {
  try {
    console.log('[v0] Casting vote for department:', departmentId);
    console.log('[v0] API URL:', `${BASE_URL}/departments/votes/${departmentId}`);
    
    const response = await fetch(`${BASE_URL}/departments/votes/${departmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('[v0] Vote response status:', response.status);

    // Handle 409 Conflict (already voted)
    if (response.status === 409) {
      const error = await response.json();
      console.log('[v0] Already voted:', error);
      return {
        success: false,
        error: error.detail || 'Member has already voted',
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Vote API error:', response.status, errorText);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data: DepartmentResponse = await response.json();
    console.log('[v0] Vote successful, updated departments:', Object.keys(data).length);
    return {
      success: true,
      departments: transformDepartmentResponse(data),
    };
  } catch (error) {
    console.error('[v0] Vote error:', error);
    return { success: false, error: 'Network error' };
  }
}