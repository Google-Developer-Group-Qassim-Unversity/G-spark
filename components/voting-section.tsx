'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrophyIcon } from 'lucide-react';
import { getDepartmentVotes, castVote, checkHasVoted, Department } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@clerk/nextjs';
import { DepartmentCard } from '@/components/department-card';

export function VotingSection() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [checkingVoteStatus, setCheckingVoteStatus] = useState(false);
  const { toast } = useToast();
  
  // Clerk authentication
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

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

  const checkUserVoteStatus = async () => {
    setCheckingVoteStatus(true);
    try {
      const token = await getToken();
      
      if (token) {
        console.log('[v0] Got token for vote status check, length:', token.length);
        const hasVotedFromApi = await checkHasVoted(token);
        setHasVoted(hasVotedFromApi);
      } else {
        console.warn('[v0] No token available for vote status check');
      }
    } catch (error) {
      console.error('[v0] Failed to check vote status:', error);
      // Fallback to localStorage
      if (user) {
        const voted = localStorage.getItem(`gspark-voted-${user.id}`);
        setHasVoted(voted === 'true');
      }
    } finally {
      setCheckingVoteStatus(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      checkUserVoteStatus();
    } else {
      // Fallback to old localStorage method for unauthenticated users
      const voted = localStorage.getItem('gspark-voted');
      setHasVoted(voted === 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  const handleVote = async (departmentId: number) => {
    if (!isSignedIn) {
      toast({
        title: '!لازم تسجل دخول',
        description: '...تحتاج حساب عشان تخمّن بنوديك تسجّل الحين',
        variant: 'default',
      });
      
      // Redirect to sign-in page
      const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://your-main-app.com';
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setTimeout(() => {
        window.location.href = `${mainAppUrl}/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
      }, 1500);
      return;
    }

    if (hasVoted) {
      toast({
        title: 'سجلنا تصويتك من زمان ما تقدر تصوت الا مرة!',
        description: 'لا يمكنك التصويت إلا مرة واحدة!',
        variant: 'destructive',
      });
      return;
    }

    setVoting(departmentId);
    try {
      const token = await getToken();
      
      if (!token) {
        console.warn('[v0] No token available for voting');
        toast({
          title: 'خطأ في المصادقة',
          description: 'لم نتمكن من الحصول على رمز المصادقة.',
          variant: 'destructive',
        });
        setVoting(null);
        return;
      }

      console.log('[v0] Got token for voting, length:', token.length);
      const result = await castVote(departmentId, token);
      
      if (result.success && result.departments) {
        setHasVoted(true);
        setDepartments(result.departments.sort((a, b) => b.votes - a.votes));
        
        // Store in localStorage as backup
        if (user) {
          localStorage.setItem(`gspark-voted-${user.id}`, 'true');
        } else {
          localStorage.setItem('gspark-voted', 'true');
        }
        
        toast({
          title: 'تم التصويت بنجاح!',
          description: 'شكراً لمشاركتك!',
        });
      } else if (result.error === 'Member has already voted') {
        setHasVoted(true);
        toast({
          title: 'لقد قمت بالتصويت مسبقاً',
          description: 'لا يمكنك التصويت إلا مرة واحدة!',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'فشل التصويت',
          description: result.error || 'الرجاء المحاولة لاحقاً.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Vote error:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تسجيل التصويت.',
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
              قفلنا موقع النقاط من شهر ، والحين تغيرت النتائج تقدر تتوقع مين في المركز الاول 🤔
            </p>
          </div>

          {/* Leaderboard */}
          <Card dir='rtl' className="shadow-2xl border border-gray-200 bg-gradient-to-r from-[#4285F4]/5 to-[#EA4335]/5 overflow-hidden">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-2xl text-[#242E48] flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-[#FBBC05]" />
                لوحة المتصدرين
              </CardTitle>
              <CardDescription className="text-gray-600">

              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {loading || checkingVoteStatus ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4285F4] border-t-transparent"></div>
                  <p className="text-gray-600 mt-4">
                    {loading ? 'جاري التحميل...' : 'جاري التحقق من حالة التصويت...'}
                  </p>
                </div>
              ) : (
                departments.map((dept, index) => (
                  <DepartmentCard
                    key={dept.department_id}
                    dept={dept}
                    index={index}
                    totalVotes={totalVotes}
                    maxVotes={maxVotes}
                    hasVoted={hasVoted}
                    voting={voting}
                    isSignedIn={isSignedIn}
                    onVote={handleVote}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
