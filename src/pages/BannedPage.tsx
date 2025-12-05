import React, { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { disputeService } from '@/services/disputeService';
import { ShieldAlert, LogOut, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BannedPage: React.FC = () => {
  const { signOut, getToken } = useClerkAuth();
  const { user } = useAuth(); // Note: user might be null or partial if banned logic kicked in early
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLogout = () => {
    signOut();
    window.location.href = '/';
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !message.trim()) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();
      const response = await disputeService.submitDispute(reason, message, token || undefined);

      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: "Dispute Submitted",
          description: "Your dispute has been sent to the admin team for review.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to submit dispute.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Dispute error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Account Suspended</h1>
            <p className="text-slate-400">
              Your account has been suspended due to a violation of our policies.
              You cannot access the platform at this time.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmitDispute} className="w-full space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Dispute Reason</label>
                <Input
                  placeholder="e.g., Wrongful suspension"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Message to Admin</label>
                <Textarea
                  placeholder="Explain why you believe this ban should be lifted..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-slate-950 border-slate-800 min-h-[100px]"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Submit Dispute
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4 w-full">
              <p className="text-green-400 text-sm">
                Your dispute has been submitted successfully. We will review your case and contact you via email.
              </p>
            </div>
          )}

          <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
