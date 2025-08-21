// In src/renderer/src/pages/ProfilePage.tsx
// (This is a large component, but it's complete)
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// --- Form Schemas for Validation ---
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().optional()
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword']
  });

export default function ProfilePage() {
  const { currentUser } = useAuth();

  // --- Profile Form Logic ---
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || ''
    }
  });

  const onProfileSubmit = async (data) => {
    if (!currentUser) return;
    try {
      toast.info('Updating profile...');
      await window.db.updateProfile({ id: currentUser.id, ...data });
      toast.success('Profile updated successfully!');
      // Note: You may need to update the currentUser in your AuthContext
      // to see changes immediately without a refresh.
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  // --- Password Form Logic ---
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }
  } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onPasswordSubmit = async (data) => {
    if (!currentUser) return;
    try {
      toast.info('Changing password...');
      await window.db.changePassword({
        id: currentUser.id,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (error: any) {
      toast.error(`Failed to change password: ${error.message}`);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...registerProfile('name')} />
                {profileErrors.name && <p className="text-sm text-destructive">{profileErrors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...registerProfile('email')} />
                {profileErrors.email && <p className="text-sm text-destructive">{profileErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...registerProfile('phone')} />
                {profileErrors.phone && <p className="text-sm text-destructive">{profileErrors.phone.message}</p>}
              </div>
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your security credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input id="oldPassword" type="password" {...registerPassword('oldPassword')} />
                {passwordErrors.oldPassword && <p className="text-sm text-destructive">{passwordErrors.oldPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
                {passwordErrors.newPassword && <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} />
                {passwordErrors.confirmPassword && <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" variant="secondary" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}