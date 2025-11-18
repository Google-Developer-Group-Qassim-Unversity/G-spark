'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrophyIcon, VoteIcon } from 'lucide-react';
import { getDepartmentVotes, castVote, Department } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function VotingSection() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
    // Check if user has voted
    const voted = localStorage.getItem('gspark-voted');
    setHasVoted(voted === 'true');
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartmentVotes();
      setDepartments(data.sort((a, b) => b.votes - a.votes));
    } catch (error) {
      console.error('[v0] Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (departmentId: number) => {
    if (hasVoted) {
      toast({
        title: 'Already Voted',
        description: 'You have already cast your vote!',
        variant: 'destructive',
      });
      return;
    }

    setVoting(departmentId);
    try {
      const success = await castVote(departmentId);
      
      if (success) {
        setHasVoted(true);
        localStorage.setItem('gspark-voted', 'true');
        await loadDepartments();
        
        toast({
          title: 'Vote Cast Successfully!',
          description: 'Thank you for participating!',
        });
      } else {
        toast({
          title: 'Vote Failed',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Vote error:', error);
      toast({
        title: 'Error',
        description: 'Failed to cast vote.',
        variant: 'destructive',
      });
    } finally {
      setVoting(null);
    }
  };

  const totalVotes = departments.reduce((sum, dept) => sum + dept.votes, 0);
  const maxVotes = Math.max(...departments.map(d => d.votes), 1);

  return (
    <section id="voting" className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FBBC05]/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-[#FBBC05] p-5 rounded-2xl shadow-lg">
                  <TrophyIcon className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#242E48] mb-3">
              خمن القسم الفائز
            </h2>
            <p className="text-lg text-gray-600 mb-2" style={{ direction: 'rtl' }}>
              صوت للقسم الذي تتوقع فوزه واربح جوائز
            </p>
            <div className="inline-flex items-center gap-2 bg-[#4285F4]/10 px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-[#4285F4]">
                إجمالي الأصوات: {totalVotes}
              </span>
            </div>
          </div>

          {/* Leaderboard */}
          <Card className="shadow-2xl border border-gray-200 bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#4285F4]/5 to-[#EA4335]/5 border-b border-gray-100">
              <CardTitle className="text-2xl text-[#242E48] flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-[#FBBC05]" />
                لوحة المتصدرين المباشرة
              </CardTitle>
              <CardDescription className="text-gray-600">
                صوّت للقسم الذي تتوقع أن يفوز وشارك في المنافسة!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4285F4] border-t-transparent"></div>
                  <p className="text-gray-600 mt-4">جاري التحميل...</p>
                </div>
              ) : (
                departments.map((dept, index) => {
                  const percentage = totalVotes > 0 ? (dept.votes / totalVotes) * 100 : 0;
                  const isLeader = index === 0;
                  const isTop3 = index < 3;

                  return (
                    <div 
                      key={dept.department_id} 
                      className={`space-y-3 p-4 rounded-xl transition-all duration-300 ${
                        isLeader ? 'bg-[#FBBC05]/10 border-2 border-[#FBBC05]' : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Rank Badge */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                            isLeader 
                              ? 'bg-gradient-to-br from-[#FBBC05] to-[#F4B400] text-white shadow-lg' 
                              : isTop3
                              ? 'bg-gradient-to-br from-[#4285F4] to-[#3367D6] text-white'
                              : 'bg-gray-200 text-gray-600'
                          } font-bold text-lg`}>
                            {index + 1}
                          </div>

                          {/* Department Name */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[#242E48] font-bold text-lg truncate">
                              {dept.department_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-600 text-sm font-medium">
                                {dept.votes} {dept.votes === 1 ? 'صوت' : 'أصوات'}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-[#4285F4] text-sm font-semibold">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Vote Button */}
                        <Button
                          size="lg"
                          onClick={() => handleVote(dept.department_id)}
                          disabled={hasVoted || voting !== null}
                          className={`${
                            hasVoted 
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : isLeader
                              ? 'bg-[#FBBC05] hover:bg-[#F4B400] text-white'
                              : 'bg-[#4285F4] hover:bg-[#4285F4]/90 text-white'
                          } font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100`}
                        >
                          {voting === dept.department_id ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              جاري التصويت...
                            </>
                          ) : hasVoted ? (
                            <>
                              <CheckCircle2Icon className="mr-2 h-5 w-5" />
                              تم التصويت
                            </>
                          ) : (
                            <>
                              <VoteIcon className="mr-2 h-5 w-5" />
                              صوّت الآن
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isLeader 
                              ? 'bg-gradient-to-r from-[#FBBC05] to-[#F4B400]' 
                              : 'bg-gradient-to-r from-[#4285F4] to-[#3367D6]'
                          }`}
                          style={{ width: `${(dept.votes / maxVotes) * 100}%` }}
                        />
                      </div>

                      {/* Leader Badge */}
                      {isLeader && (
                        <div className="flex items-center justify-center gap-2 text-[#FBBC05] font-bold text-sm">
                          <TrophyIcon className="h-4 w-4" />
                          المتصدر الحالي
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Vote Notice */}
              {!hasVoted && !loading && (
                <div className="mt-6 p-4 bg-[#4285F4]/5 rounded-xl border border-[#4285F4]/20">
                  <p className="text-[#242E48] text-sm text-center" style={{ direction: 'rtl' }}>
                    💡 <strong>ملاحظة:</strong> يمكنك التصويت مرة واحدة فقط، اختر بحكمة!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
