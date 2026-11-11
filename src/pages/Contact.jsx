import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { Field, Spinner } from '../components/ui';

const info = [
  [MapPin, 'Visit us', '21 Throttle Street, Motor City'],
  [Phone, 'Call us', '+1 (555) 010-2030'],
  [Mail, 'Email', 'hello@rideon.example'],
  [Clock, 'Opening hours', 'Every day, 8:00 - 20:00'],
];

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/contact', data);
      toast.success(res.data.message);
      reset();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-sm font-semibold tracking-widest text-accent uppercase">Contact us</p>
      <h1 className="heading mt-2 text-4xl sm:text-5xl">Questions? Talk to us.</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <ul className="space-y-4">
          {info.map(([Icon, title, text]) => (
            <li key={title} className="card flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-800 text-accent"><Icon className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-zinc-400">{title}</p>
                <p className="font-semibold">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" error={errors.name}>
              <input className="input" autoComplete="name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className="input" type="email" autoComplete="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
            </Field>
          </div>
          <Field label="Message" error={errors.message}>
            <textarea className="input" rows="6" {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Please write at least 10 characters' }, maxLength: { value: 2000, message: 'Message is too long' } })} />
          </Field>
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="h-4 w-4" />} Send message
          </button>
        </form>
      </div>
    </div>
  );
}
