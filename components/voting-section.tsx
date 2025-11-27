'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrophyIcon } from 'lucide-react';
import { getDepartmentVotes, castVote, checkHasVoted, Department } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@clerk/nextjs';
import { DepartmentCard } from '@/components/department-card';
import { motion } from 'framer-motion';

export function VotingSection() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [checkingVoteStatus, setCheckingVoteStatus] = useState(false);
  const { toast } = useToast();
  
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
        const hasVotedFromApi = await checkHasVoted(token);
        setHasVoted(hasVotedFromApi);
      } 
    } catch (error) {
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
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      checkUserVoteStatus();
    } else {
      const voted = localStorage.getItem('gspark-voted');
      setHasVoted(voted === 'true');
    }
  }, [isSignedIn, user]);

  const handleVote = async (departmentId: number) => {
    if (!isSignedIn) {
      toast({
        title: '!لازم تسجل دخول',
        description: '...تحتاج حساب عشان تخمّن بنوديك تسجّل الحين',
        variant: 'default',
      });
      
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
        toast({
          title: 'خطأ في المصادقة',
          description: 'لم نتمكن من الحصول على رمز المصادقة.',
          variant: 'destructive',
        });
        setVoting(null);
        return;
      }

      const result = await castVote(departmentId, token);
      
      if (result.success && result.departments) {
        setHasVoted(true);
        setDepartments(result.departments.sort((a, b) => b.votes - a.votes));
        
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
    <section id="voting" className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden bg-white">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Top Right: Red Blob */}
        <div 
          className="absolute -top-[10%] -right-[5%] w-[65vw] h-[65vw] rounded-full blur-[110px] opacity-15"
          style={{ background: 'radial-gradient(circle, #EA4335 0%, #FF4473 60%, transparent 100%)' }} 
        />

        {/* Bottom Left: Blue Blob */}
        <div 
          className="absolute -bottom-[15%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-15"
          style={{ background: 'radial-gradient(circle, #4285F4 0%, #242E48 60%, transparent 100%)' }}
        />

        {/* Floating Spark Dots */}
        <motion.div 
          className="absolute top-[20%] left-[10%] w-4 h-4 rounded-full bg-[#EA4335] blur-[2px]"
          animate={{ y: [0, -25, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[30%] right-[15%] w-3 h-3 rounded-full bg-[#4285F4] blur-[1px]"
          animate={{ y: [0, 25, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>

      {/* --- NEW: Connector Gradient (Top Fade) --- */}
      {/* This ensures the bottom of Notifications blends seamlessly here */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      {/* ------------------------------------------ */}

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#FBBC05]/30 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative bg-[#FBBC05] p-5 rounded-2xl shadow-lg shadow-[#FBBC05]/20">
                  <TrophyIcon className="h-16 w-16 text-white" />
                </div>
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#242E48] mb-3">
              خمن القسم الفائز
            </h2>
            <p className="text-lg text-gray-600 mb-2" style={{ direction: 'rtl' }}>
              قفلنا موقع النقاط من شهر، والحين تغيرت النتائج تقدر تتوقع مين في المركز الاول 🤔
            </p>
          </div>

          {/* Leaderboard */}
          <Card dir='rtl' className="shadow-2xl shadow-gray-200/50 border border-gray-100 bg-white/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b border-gray-50/50 bg-gradient-to-r from-[#4285F4]/5 to-[#EA4335]/5">
              <CardTitle className="text-2xl text-[#242E48] flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-[#FBBC05]" />
                لوحة المتصدرين
              </CardTitle>
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
                    isSignedIn={isSignedIn || false}
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