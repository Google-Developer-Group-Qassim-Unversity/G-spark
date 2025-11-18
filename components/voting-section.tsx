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
    <section id="voting" className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-[var(--gspark-purple)] to-[var(--gspark-pink)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <TrophyIcon className="h-16 w-16 text-[var(--gspark-yellow)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Guess the Winning Department
            </h2>
            <p className="text-lg text-white/80" style={{ direction: 'rtl' }}>
              صوت للقسم الذي تتوقع فوزه
            </p>
            <p className="text-sm text-white/60 mt-2">
              Total Votes: {totalVotes}
            </p>
          </div>

          {/* Leaderboard */}
          <Card className="glass border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Live Leaderboard</CardTitle>
              <CardDescription className="text-white/70">
                Vote for the department you think will win!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-white">Loading...</div>
              ) : (
                departments.map((dept, index) => {
                  const percentage = totalVotes > 0 ? (dept.votes / totalVotes) * 100 : 0;
                  const isLeader = index === 0;

                  return (
                    <div key={dept.department_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            isLeader 
                              ? 'bg-[var(--gspark-yellow)] text-[var(--gspark-dark)]' 
                              : 'bg-white/20 text-white'
                          } font-bold text-sm`}>
                            {index + 1}
                          </div>
                          <span className="text-white font-semibold">
                            {dept.department_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white/80 text-sm font-medium">
                            {dept.votes} votes ({percentage.toFixed(1)}%)
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleVote(dept.department_id)}
                            disabled={hasVoted || voting !== null}
                            className={`${
                              hasVoted 
                                ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                                : 'bg-white text-[var(--gspark-purple)] hover:bg-white/90'
                            } font-semibold`}
                          >
                            {voting === dept.department_id ? (
                              'Voting...'
                            ) : hasVoted ? (
                              'Voted'
                            ) : (
                              <>
                                <VoteIcon className="mr-1 h-4 w-4" />
                                Vote
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isLeader 
                              ? 'bg-[var(--gspark-yellow)]' 
                              : 'bg-white/40'
                          }`}
                          style={{ width: `${(dept.votes / maxVotes) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
