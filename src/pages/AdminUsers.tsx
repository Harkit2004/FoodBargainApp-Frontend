import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, User as AdminUser } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Ban, CheckCircle, Search, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@clerk/clerk-react';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await adminService.getUsers(1, 20, '', token || undefined);
      if (response.success && response.data) {
        setUsers(response.data.users);
      } else {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, getToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;

    setIsActionLoading(true);
    try {
      const token = await getToken();
      const response = await adminService.banUser(selectedUser.id, banReason, token || undefined);
      if (response.success) {
        toast({
          title: "User Banned",
          description: `${selectedUser.displayName} has been banned.`,
        });
        setIsBanDialogOpen(false);
        setBanReason('');
        fetchUsers(); // Refresh list
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to ban user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnbanUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to unban ${user.displayName}?`)) return;

    setIsActionLoading(true);
    try {
      const token = await getToken();
      const response = await adminService.unbanUser(user.id, token || undefined);
      if (response.success) {
        toast({
          title: "User Unbanned",
          description: `${user.displayName} has been unbanned.`,
        });
        fetchUsers(); // Refresh list
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to unban user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/console')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Console
          </Button>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900">
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-white">{user.displayName}</TableCell>
                    <TableCell className="text-slate-300">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.isAdmin && <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">Admin</Badge>}
                        {user.isPartner && <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">Partner</Badge>}
                        {!user.isAdmin && !user.isPartner && <Badge variant="outline" className="border-slate-700 text-slate-400">User</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive" className="bg-red-900/50 text-red-400 hover:bg-red-900/60 border-red-900">
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-900/50 text-green-400 bg-green-900/10">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.isBanned ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUnbanUser(user)}
                          disabled={isActionLoading}
                          className="border-green-800 text-green-400 hover:bg-green-900/20 hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Unban
                        </Button>
                      ) : (
                        <Dialog open={isBanDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setIsBanDialogOpen(open);
                          if (open) setSelectedUser(user);
                          else {
                            setSelectedUser(null);
                            setBanReason('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                            >
                              <Ban className="w-4 h-4 mr-2" /> Ban
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                              <DialogTitle>Ban User</DialogTitle>
                              <DialogDescription className="text-slate-400">
                                Are you sure you want to ban {user.displayName}? They will lose access to the platform immediately.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Reason for Ban</label>
                                <Input
                                  placeholder="e.g., Violation of terms, Spamming"
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                  className="bg-slate-950 border-slate-800"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" onClick={() => setIsBanDialogOpen(false)} className="text-slate-400">Cancel</Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleBanUser}
                                disabled={!banReason.trim() || isActionLoading}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {isActionLoading ? "Banning..." : "Ban User"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
