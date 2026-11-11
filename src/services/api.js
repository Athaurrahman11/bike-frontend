import axios from 'axios';
import placeholder from '../assets/placeholder.svg';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL, withCredentials: true });

export const errMsg = (err) => err.response?.data?.message || err.message || 'Something went wrong';

// Uploaded images are stored as "/uploads/x.jpg" (relative to the API origin); Cloudinary/seed images are absolute.
const apiOrigin = baseURL.startsWith('http') ? new URL(baseURL).origin : '';
export const imgUrl = (src) => (!src ? placeholder : src.startsWith('/') ? apiOrigin + src : src);
export const onImgError = (e) => {
  if (!e.target.src.endsWith(placeholder)) e.target.src = placeholder;
};

// drops empty filters so they are not sent as "?search=&category="
export const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

export default api;
