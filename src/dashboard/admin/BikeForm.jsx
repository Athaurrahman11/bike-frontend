// Add bike (/admin/bikes/new) and edit bike (/admin/bikes/:id/edit)
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ChevronLeft, Upload, X } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { errMsg, imgUrl, onImgError } from '../../services/api';
import { ErrorState, Field, PageHeader, Spinner, TableSkeleton } from '../../components/ui';

const MAX_IMAGES = 8;
const DEFAULTS = { name: '', brand: '', category: '', description: '', engineCapacity: '', fuelType: 'Petrol', transmission: 'Manual', pricePerDay: '', securityDeposit: '', availabilityStatus: 'available', maintenanceStatus: 'good' };
const number = (label, max) => ({ required: `${label} is required`, min: { value: 0, message: `${label} cannot be negative` }, ...(max && { max: { value: max, message: `${label} must be at most ${max}` } }) });

export default function BikeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const categories = useFetch('/categories');
  const existing = useFetch(id ? `/bikes/${id}` : null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: DEFAULTS });
  const [kept, setKept] = useState([]); // image URLs already on the bike
  const [files, setFiles] = useState([]); // new uploads
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  // fill the form once the bike AND the category options have loaded (the <select> needs its options first)
  const bike = existing.data?.bike;
  const categoriesReady = Boolean(categories.data);
  useEffect(() => {
    if (!bike || !categoriesReady) return;
    reset(Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, k === 'category' ? bike.category?._id || '' : bike[k] ?? ''])));
    setKept(bike.images);
  }, [bike, categoriesReady, reset]);

  const addFiles = (e) => {
    const room = MAX_IMAGES - kept.length - files.length;
    const picked = [...e.target.files];
    if (picked.length > room) toast.error(`A bike can have at most ${MAX_IMAGES} images`);
    setFiles([...files, ...picked.slice(0, Math.max(room, 0))]);
    e.target.value = '';
  };

  const onSubmit = async (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    if (id) form.append('existingImages', JSON.stringify(kept));
    files.forEach((f) => form.append('images', f));
    try {
      await (id ? api.put(`/bikes/${id}`, form) : api.post('/bikes', form));
      toast.success(id ? 'Bike updated' : 'Bike added');
      navigate('/admin/bikes');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (id && existing.error) return <ErrorState message={existing.error} onRetry={existing.reload} />;
  if ((id && !existing.data) || !categories.data) return categories.error ? <ErrorState message={categories.error} onRetry={categories.reload} /> : <TableSkeleton />;

  return (
    <>
      <Link to="/admin/bikes" className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-accent">
        <ChevronLeft className="h-4 w-4" /> Back to bikes
      </Link>
      <PageHeader title={id ? 'Edit bike' : 'Add bike'} />
      {categories.data.categories.length === 0 && (
        <p role="alert" className="mb-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">
          You need at least one category first. <Link to="/admin/categories" className="font-semibold underline">Create a category</Link>
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-6 lg:grid-cols-[1fr_360px]" noValidate>
        <div className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bike name" error={errors.name}><input className="input" {...register('name', { required: 'Name is required' })} /></Field>
            <Field label="Brand" error={errors.brand}><input className="input" {...register('brand', { required: 'Brand is required' })} /></Field>
            <Field label="Category" error={errors.category}>
              <select className="input" {...register('category', { required: 'Choose a category' })}>
                <option value="">Select a category</option>
                {categories.data.categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Engine capacity (cc, 0 for electric)" error={errors.engineCapacity}><input className="input" type="number" min="0" {...register('engineCapacity', number('Engine capacity', 3000))} /></Field>
            <Field label="Fuel type">
              <select className="input" {...register('fuelType')}><option>Petrol</option><option>Electric</option><option>Hybrid</option></select>
            </Field>
            <Field label="Transmission">
              <select className="input" {...register('transmission')}><option>Manual</option><option>Automatic</option><option>Semi-Automatic</option></select>
            </Field>
            <Field label="Rental price per day" error={errors.pricePerDay}><input className="input" type="number" min="0" step="0.01" {...register('pricePerDay', number('Price'))} /></Field>
            <Field label="Security deposit" error={errors.securityDeposit}><input className="input" type="number" min="0" step="0.01" {...register('securityDeposit', number('Deposit'))} /></Field>
            <Field label="Availability">
              <select className="input" {...register('availabilityStatus')}><option value="available">Available</option><option value="unavailable">Unavailable</option></select>
            </Field>
            <Field label="Maintenance status">
              <select className="input" {...register('maintenanceStatus')}><option value="good">Good</option><option value="in_maintenance">In maintenance</option></select>
            </Field>
          </div>
          <Field label="Description" error={errors.description}>
            <textarea className="input" rows="5" {...register('description', { maxLength: { value: 3000, message: 'Description is too long' } })} />
          </Field>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-1 font-bold">Images</h2>
            <p className="mb-4 text-xs text-zinc-400">Up to {MAX_IMAGES} images. JPG, PNG or WebP, max 5 MB each. The first image is the cover.</p>
            <div className="grid grid-cols-3 gap-3">
              {kept.map((src) => (
                <Thumb key={src} src={imgUrl(src)} onRemove={() => setKept(kept.filter((s) => s !== src))} />
              ))}
              {previews.map((src, i) => (
                <Thumb key={src} src={src} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />
              ))}
              {kept.length + files.length < MAX_IMAGES && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-zinc-700 text-zinc-400 transition hover:border-accent hover:text-accent">
                  <span className="flex flex-col items-center gap-1 text-xs"><Upload className="h-5 w-5" /> Upload</span>
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={addFiles} />
                </label>
              )}
            </div>
          </div>
          <button className="btn btn-primary w-full py-3" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="h-4 w-4" />} {id ? 'Save changes' : 'Add bike'}
          </button>
        </div>
      </form>
    </>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-800">
      <img src={src} onError={onImgError} alt="" className="h-full w-full object-cover" />
      <button type="button" onClick={onRemove} aria-label="Remove image" className="absolute top-1 right-1 rounded-full bg-zinc-950/80 p-1 text-white hover:bg-red-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
