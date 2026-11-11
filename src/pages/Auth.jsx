// Login, Register, Forgot password and Reset password share one card layout.
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { homeFor, useAuth } from '../context/AuthContext';
import { Field, Spinner } from '../components/ui';

const emailRule = { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } };
const passwordRule = { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' }, maxLength: { value: 72, message: 'Use at most 72 characters' } };

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="card rise p-7">
        <h1 className="heading text-3xl">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-400">{subtitle}</p>
        {children}
      </div>
      {footer && <p className="mt-5 text-center text-sm text-zinc-400">{footer}</p>}
    </div>
  );
}

const Submit = ({ busy, children }) => (
  <button className="btn btn-primary w-full py-3" disabled={busy}>
    {busy && <Spinner className="h-4 w-4" />} {children}
  </button>
);

const A = (props) => <Link className="font-semibold text-accent hover:underline" {...props} />;

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  if (user) return <Navigate to={from || homeFor(user)} replace />;

  const onSubmit = async (data) => {
    try {
      const u = await login(data);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      // admins always land on the admin panel; customers return to where they came from
      navigate(u.role === 'admin' ? '/admin' : from || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to manage your bookings." footer={<>New here? <A to="/register">Create an account</A></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" autoComplete="email" {...register('email', emailRule)} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input className="input" type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} />
        </Field>
        <div className="text-right text-sm"><A to="/forgot-password">Forgot password?</A></div>
        <Submit busy={isSubmitting}>Log in</Submit>
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { user, register: signUp } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  if (user) return <Navigate to={from || homeFor(user)} replace />;

  const onSubmit = async ({ confirm, ...data }) => {
    try {
      await signUp(data);
      toast.success('Account created. Welcome to RideOn!');
      navigate(from || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <AuthCard title="Create account" subtitle="Book your first ride in minutes." footer={<>Already have an account? <A to="/login">Log in</A></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <input className="input" autoComplete="name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" autoComplete="email" {...register('email', emailRule)} />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input className="input" type="tel" autoComplete="tel" {...register('phone', { required: 'Phone number is required', pattern: { value: /^\+?[\d\s-]{7,20}$/, message: 'Enter a valid phone number' } })} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input className="input" type="password" autoComplete="new-password" {...register('password', passwordRule)} />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <input className="input" type="password" autoComplete="new-password" {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })} />
        </Field>
        <Submit busy={isSubmitting}>Create account</Submit>
      </form>
    </AuthCard>
  );
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <AuthCard title="Forgot password" subtitle="We will email you a link to reset it." footer={<A to="/login">Back to log in</A>}>
      {sent ? (
        <p role="status" className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-300">If that email is registered, a reset link is on its way. The link is valid for 30 minutes.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Email" error={errors.email}>
            <input className="input" type="email" autoComplete="email" {...register('email', emailRule)} />
          </Field>
          <Submit busy={isSubmitting}>Send reset link</Submit>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <AuthCard title="Set a new password" subtitle="Choose a password you have not used before." footer={<A to="/login">Back to log in</A>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="New password" error={errors.password}>
          <input className="input" type="password" autoComplete="new-password" {...register('password', passwordRule)} />
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          <input className="input" type="password" autoComplete="new-password" {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })} />
        </Field>
        <Submit busy={isSubmitting}>Update password</Submit>
      </form>
    </AuthCard>
  );
}
