'use client';

import { Button } from '@/components/ui/button';
import { VoteIcon, CheckCircle2 as CheckCircle2Icon } from 'lucide-react';
import { Department } from '@/lib/api';

interface DepartmentCardProps {
  dept: Department;
  index: number;
  totalVotes: number;
  maxVotes: number;
  hasVoted: boolean;
  voting: number | null;
  isSignedIn: boolean;
  onVote: (departmentId: number) => void;
}

export function DepartmentCard({
  dept,
  index,
  totalVotes,
  maxVotes,
  hasVoted,
  voting,
  isSignedIn,
  onVote,
}: DepartmentCardProps) {
  const percentage = totalVotes > 0 ? (dept.votes / totalVotes) * 100 : 0;

  return (
    <div 
      className="p-5 md:p-6 rounded-2xl transition-all duration-300 bg-white border border-gray-200 hover:border-[#4285F4] hover:shadow-lg"
    >
      {/* Top Row: Rank, Department Name, Vote Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Rank Badge */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 bg-gray-100 text-gray-600 font-bold text-lg">
          {index + 1}
        </div>

        {/* Department Name */}
        <h3 className="text-[#242E48] font-bold text-base md:text-lg flex-1">
          {dept.department_name}
        </h3>
      </div>
      {/* Vote Button */}
        <Button
          size="sm"
          onClick={() => onVote(dept.department_id)}
          disabled={hasVoted || voting !== null}
          className={`${
            hasVoted 
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
              : !isSignedIn
              ? 'bg-[#4285F4] hover:bg-[#3367D6] text-white'
              : 'bg-[#4285F4] hover:bg-[#3367D6] text-white'
          } font-semibold px-5 py-2.5 mb-5 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shrink-0 text-sm`}
        >
          {voting === dept.department_id ? (
            <>
              <div className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent ml-2"></div>
              <span className="text-xs">جاري...</span>
            </>
          ) : hasVoted ? (
            <>
              <CheckCircle2Icon className="ml-2 h-4 w-4 inline" />
              <span>تم التصويت</span>
            </>
          ) : (
            <>
              <VoteIcon className="ml-2 h-4 w-4 inline" />
              <span>صوّت الآن</span>
            </>
          )}
        </Button>

      {/* Vote Count and Percentage */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <span className="text-gray-600 font-medium">
        {dept.votes} أصوات
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-[#4285F4] font-bold">
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 bg-[#4285F4] rounded-full"
          style={{ width: `${(dept.votes / maxVotes) * 100}%` }}
        />
      </div>
    </div>
  );
}
