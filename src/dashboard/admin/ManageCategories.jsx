import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { errMsg, imgUrl, onImgError } from '../../services/api';
import { Async, ConfirmDialog, EmptyState, Field, Modal, PageHeader, Spinner } from '../../components/ui';

// `editing` is null (closed), {} (new) or a category (edit)
function CategoryModal({ editing, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  useEffect(() => {
    if (editing) reset({ name: editing.name || '', description: editing.description || '', image: null });
  }, [editing, reset]);

  const onSubmit = async ({ name, description, image }) => {
    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    if (image?.[0]) form.append('image', image[0]);
    try {
      await (editing._id ? api.put(`/categories/${editing._id}`, form) : api.post('/categories', form));
      toast.success(editing._id ? 'Category updated' : 'Category added');
      onSaved();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <Modal open={Boolean(editing)} title={editing?._id ? 'Edit category' : 'Add category'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name}>
          <input className="input" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' }, maxLength: { value: 60, message: 'Name is too long' } })} />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea className="input" rows="3" {...register('description', { maxLength: { value: 500, message: 'Description is too long' } })} />
        </Field>
        <Field label="Image (optional)">
          <input type="file" accept="image/jpeg,image/png,image/webp" className="input file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-sm file:text-white" {...register('image')} />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={isSubmitting}>{isSubmitting && <Spinner className="h-4 w-4" />} Save</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ManageCategories() {
  const q = useFetch('/categories');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const remove = (category) => async () => {
    try {
      await api.delete(`/categories/${category._id}`);
      toast.success('Category deleted');
    } catch (err) {
      toast.error(errMsg(err));
    }
    q.reload();
  };

  return (
    <>
      <PageHeader title="Categories" subtitle="Group your motorcycles so customers can filter them.">
        <button className="btn btn-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add category</button>
      </PageHeader>
      <Async q={q} isEmpty={(d) => d.categories.length === 0} empty={<EmptyState icon={Tags} title="No categories yet" text="Create a category before adding bikes." action={<button className="btn btn-primary" onClick={() => setEditing({})}>Add category</button>} />}>
        {(d) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {d.categories.map((c) => (
              <div key={c._id} className="card flex gap-4 p-5">
                {c.image ? (
                  <img src={imgUrl(c.image)} onError={onImgError} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-zinc-800 text-accent"><Tags className="h-6 w-6" /></span>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{c.name}</h2>
                  <p className="line-clamp-2 text-sm text-zinc-400">{c.description || 'No description'}</p>
                  <p className="mt-1 text-xs font-semibold text-accent">{c.bikeCount} bike{c.bikeCount === 1 ? '' : 's'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="btn btn-outline btn-sm" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></button>
                  <button className="btn btn-outline btn-sm text-red-400" aria-label={`Delete ${c.name}`} onClick={() => setConfirm({ title: 'Delete category', message: `Delete the "${c.name}" category?`, confirmText: 'Delete', danger: true, onConfirm: remove(c) })}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Async>
      <CategoryModal editing={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); q.reload(); }} />
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
