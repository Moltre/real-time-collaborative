import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Camera, Lock, Mail, Loader2, Check, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const fileRef = useRef(null);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);

  const name = user?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await base44.auth.updateMe({ full_name: fullName });
      toast({ title: 'Profile updated', description: 'Your display name has been saved.' });
    } catch (err) {
      toast({ title: 'Could not save', description: err.message, variant: 'destructive' });
    } finally {
      setSavingName(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please choose an image under 5 MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.auth.updateMe({ photo_url: file_url });
      setPhotoUrl(file_url);
      toast({ title: 'Photo updated' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8 animate-fade-in">
      <PageHeader icon={User} title="User Profile" description="Update your display name, profile photo, and password settings." />

      {/* Profile photo + display name */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <Separator />

        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="w-20 h-20">
              {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">Click the camera to upload a photo.</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Display Name</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={user?.email || ''} disabled className="pl-9 bg-muted/50" />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <Button type="submit" disabled={savingName || fullName === (user?.full_name || '')}>
            {savingName ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Password</h2>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Change Password</p>
            <p className="text-xs text-muted-foreground">We will send a reset link to your email.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/forgot-password">Reset Password</Link>
          </Button>
        </div>
      </section>

      {/* Sign out */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <LogOut className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Session</h2>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Sign out everywhere</p>
            <p className="text-xs text-muted-foreground">Log out of your account on this device.</p>
          </div>
          <Button variant="destructive" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </section>
    </div>
  );
}