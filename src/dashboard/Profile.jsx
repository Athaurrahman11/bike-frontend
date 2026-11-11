import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import api, { errMsg, imgUrl, onImgError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Field, PageHeader, Spinner } from '../components/ui';

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: user.name, email: user.email, phone: user.phone || '' } });

  const onSubmit = async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => v && form.append(k, v));
    if (file) form.append('profileImage', file);
    try {
      const res = await api.put('/auth/profile', form);
      setUser(res.data.user);
      setFile(null);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const preview = file ? URL.createObjectURL(file) : user.profileImage ? imgUrl(user.profileImage) : null;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6" noValidate>
      <h2 className="text-lg font-bold">Personal information</h2>
      <div className="flex items-center gap-4">
        {preview ? (
          <img src={preview} onError={onImgError} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-700" />
        ) : (
          <span className="grid h-20 w-20 place-items-center rounded-full bg-accent text-2xl font-black text-zinc-950">{user.name[0]?.toUpperCase()}</span>
        )}
        <label className="btn btn-outline">
          <Camera className="h-4 w-4" /> Change photo
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setFile(e.target.files[0] || null)} />
        </label>
      </div>
      <Field label="Full name" error={errors.name}>
        <input className="input" autoComplete="name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" autoComplete="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input className="input" type="tel" autoComplete="tel" {...register('phone', { pattern: { value: /^\+?[\d\s-]{7,20}$/, message: 'Enter a valid phone number' } })} />
        </Field>
      </div>
      <button className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting && <Spinner className="h-4 w-4" />} Save changes
      </button>
    </form>
  );
}

function PasswordForm() {
  const { setUser } = useAuth();
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      setUser(res.data.user);
      reset();
      toast.success('Password changed. Other devices have been signed out.');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6" noValidate>
      <h2 className="text-lg font-bold">Change password</h2>
      <Field label="Current password" error={errors.currentPassword}>
        <input className="input" type="password" autoComplete="current-password" {...register('currentPassword', { required: 'Current password is required' })} />
      </Field>
      <Field label="New password" error={errors.newPassword}>
        <input className="input" type="password" autoComplete="new-password" {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Use at least 8 characters' }, maxLength: { value: 72, message: 'Use at most 72 characters' } })} />
      </Field>
      <Field label="Confirm new password" error={errors.confirm}>
        <input className="input" type="password" autoComplete="new-password" {...register('confirm', { validate: (v) => v === watch('newPassword') || 'Passwords do not match' })} />
      </Field>
      <button className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting && <Spinner className="h-4 w-4" />} Update password
      </button>
    </form>
  );
}

export default function Profile() {
  return (
    <>
      <PageHeader title="My profile" subtitle="Manage your personal and contact details." />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}
