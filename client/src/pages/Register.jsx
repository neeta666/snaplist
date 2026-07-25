// Register page.
//
// On success: the backend returns { user, token } (API Contract, section
// 2.1). We call useAuthStore.setAuth(user, token) directly rather than
// going through the session-restoration path (GET /auth/me) — we already
// have a fresh, trustworthy user object from the register response itself,
// so a second round-trip to fetch the same data would be redundant.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema } from '../schemas/authSchemas';
import { apiClient } from '../lib/apiClient';
import { extractApiError } from '../lib/apiErrors';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setFormError('');
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/register', values);
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate('/dashboard');
    } catch (error) {
      const { message, fieldErrors } = extractApiError(error);

      // Map any per-field errors from the backend (e.g. a 422 the frontend
      // schema didn't happen to catch) onto the matching form fields.
      let matchedAnyField = false;
      fieldErrors.forEach(({ field, message: fieldMessage }) => {
        if (field === 'name' || field === 'email' || field === 'password') {
          setError(field, { type: 'server', message: fieldMessage });
          matchedAnyField = true;
        }
      });

      // A 409 (duplicate email) has no field-level errors array, but is
      // still best shown next to the email field rather than as a generic
      // banner, since the user knows exactly what to fix.
      if (!matchedAnyField && error?.response?.status === 409) {
        setError('email', { type: 'server', message });
      } else if (!matchedAnyField) {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gray-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}