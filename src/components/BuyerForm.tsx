// components/BuyerForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerFormData } from '@/lib/validations';

interface BuyerFormProps {
  initialData?: any;
  isEdit?: boolean;
  isView?: boolean;
}

// Update these arrays to match your Prisma enum values exactly
const cities = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'];
const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'];
const bhkOptions = ['Studio', 'One', 'Two', 'Three', 'Four'];
const purposes = ['Buy', 'Rent'];
const timelines = [
  { value: '0-3m', label: '0-3 months' },
  { value: '3-6m', label: '3-6 months' },
  { value: '>6m', label: 'More than 6 months' },
  { value: 'Exploring', label: 'Exploring' }
];
const sources = ['Website', 'Referral', 'WalkIn', 'Call', 'Other'];
const statusOptions = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'];

// Helper function to convert form values to Prisma enum values
const mapFormToPrisma = (formData: any) => {
  return {
    ...formData,
    timeline: formData.timeline === '0-3m' ? 'ZeroToThree' :
      formData.timeline === '3-6m' ? 'ThreeToSix' :
        formData.timeline === '>6m' ? 'MoreThanSix' :
          formData.timeline,
    source: formData.source === 'Walk-in' ? 'WalkIn' : formData.source,
  };
};

// Helper function to convert Prisma values to form format
const mapPrismaToForm = (prismaData: any) => {
  if (!prismaData) return null;

  return {
    ...prismaData,
    timeline: prismaData.timeline === 'ZeroToThree' ? '0-3m' :
      prismaData.timeline === 'ThreeToSix' ? '3-6m' :
        prismaData.timeline === 'MoreThanSix' ? '>6m' :
          prismaData.timeline,
    source: prismaData.source === 'WalkIn' ? 'Walk-in' : prismaData.source,
  };
};

export default function BuyerForm({ initialData, isEdit = false, isView = false }: BuyerFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form data with default values
  const defaultFormData = {
    fullName: '',
    email: '',
    phone: '',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: '',
    purpose: 'Buy',
    budgetMin: null,
    budgetMax: null,
    timeline: 'Exploring',
    source: 'Website',
    status: 'New',
    notes: '',
    tags: [],
  };

  const [formData, setFormData] = useState<BuyerFormData>(defaultFormData as BuyerFormData);
  const [tagInput, setTagInput] = useState('');

  // Use useEffect to handle initialData changes
  useEffect(() => {
    if (initialData) {
      const formattedData = mapPrismaToForm(initialData);
      setFormData(formattedData as BuyerFormData);
    }
    setIsLoading(false);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isView) return; // Prevent changes in view mode

    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isView) return;

    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : parseInt(value),
    }));
  };

  const addTag = () => {
    if (isView) return;

    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      if (isView) return;
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (isView) return;

    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (isView) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEdit && initialData?.id ? `/api/buyers/${initialData.id}` : '/api/buyers';
      const method = isEdit && initialData?.id ? 'PUT' : 'POST';

      const prismaData = mapFormToPrisma(formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...prismaData,
          updatedAt: initialData?.updatedAt,
        }),
      });

      if (response.ok) {
        router.push('/buyers');
        router.refresh();
      } else {
        if (response.status === 404) {
          setErrors({ submit: 'Buyer not found. It may have been deleted.' });
        } else {
          const data = await response.json();
          if (data.error) {
            setErrors({ submit: data.error });
          } else if (data.errors) {
            const fieldErrors: Record<string, string> = {};
            data.errors.forEach((error: any) => {
              if (error.path) {
                fieldErrors[error.path[0]] = error.message;
              }
            });
            setErrors(fieldErrors);
          }
        }
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const showBhkField = ['Apartment', 'Villa'].includes(formData.propertyType);

  // Helper function to render field values in view mode
  const renderViewField = (value: any, fallback = '-') => {
    return (
      <p className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 border-gray-300">
        {value || fallback}
      </p>
    );
  };
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isView ? 'Buyer Details' : (isEdit ? 'Edit Buyer' : 'Add New Buyer')}
        </h2>
        <p className="text-gray-500 mt-1">
          {isView ? 'View buyer information' : 'Fill in the details below to add a new buyer'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
        {errors.submit && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.fullName || '-'}
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                    required
                    placeholder="Enter full name"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.fullName}
                  </p>}
                </>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.phone || '-'}
                </div>
              ) : (
                <>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                    required
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>}
                </>
              )}
            </div>

            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type <span className="text-red-500">*</span>
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.propertyType || '-'}
                </div>
              ) : (
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border bg-white"
                  required
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}
            </div>

            {/* BHK Field (Conditional) */}
            {showBhkField && (
              <div>
                <label htmlFor="bhk" className="block text-sm font-medium text-gray-700 mb-1">
                  BHK <span className="text-red-500">*</span>
                </label>
                {isView ? (
                  <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    {formData.bhk || '-'}
                  </div>
                ) : (
                  <>
                    <select
                      id="bhk"
                      name="bhk"
                      value={formData.bhk}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border bg-white"
                      required={showBhkField}
                    >
                      <option value="">Select BHK</option>
                      {bhkOptions.map(bhk => (
                        <option key={bhk} value={bhk}>
                          {bhk === 'One' ? '1' :
                            bhk === 'Two' ? '2' :
                              bhk === 'Three' ? '3' :
                                bhk === 'Four' ? '4' : bhk}
                        </option>
                      ))}
                    </select>
                    {errors.bhk && <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.bhk}
                    </p>}
                  </>
                )}
              </div>
            )}

            {/* Budget Min */}
            <div>
              <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Budget (INR)
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.budgetMin ? `₹${formData.budgetMin.toLocaleString()}` : '-'}
                </div>
              ) : (
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    id="budgetMin"
                    name="budgetMin"
                    value={formData.budgetMin || ''}
                    onChange={handleNumberChange}
                    min="0"
                    className="block w-full pl-8 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                Timeline <span className="text-red-500">*</span>
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {timelines.find(t => t.value === formData.timeline)?.label || formData.timeline || '-'}
                </div>
              ) : (
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border bg-white"
                  required
                >
                  <option value="">Select timeline</option>
                  {timelines.map(timeline => (
                    <option key={timeline.value} value={timeline.value}>
                      {timeline.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.email || '-'}
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>}
                </>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.city || '-'}
                </div>
              ) : (
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border bg-white"
                  required
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Purpose <span className="text-red-500">*</span>
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.purpose || '-'}
                </div>
              ) : (
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border bg-white"
                  required
                >
                  <option value="">Select purpose</option>
                  {purposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Budget Max */}
            <div>
              <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Budget (INR)
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.budgetMax ? `₹${formData.budgetMax.toLocaleString()}` : '-'}
                </div>
              ) : (
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    id="budgetMax"
                    name="budgetMax"
                    value={formData.budgetMax || ''}
                    onChange={handleNumberChange}
                    min="0"
                    className="block w-full pl-8 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                    placeholder="0"
                  />
                </div>
              )}
              {errors.budgetMax && <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.budgetMax}
              </p>}
            </div>

            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Source <span className="text-red-500">*</span>
              </label>
              {isView ? (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {formData.source === 'WalkIn' ? 'Walk-in' : formData.source || '-'}
                </div>
              ) : (
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border bg-white"
                  required
                >
                  <option value="">Select source</option>
                  {sources.map(source => (
                    <option key={source} value={source}>
                      {source === 'WalkIn' ? 'Walk-in' : source}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Status (Edit/View only) */}
            {(isEdit || isView) && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isView ? (
                  <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    {formData.status || '-'}
                  </div>
                ) : (
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border bg-white"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          {isView ? (
            <div className="mt-1 block w-full rounded-lg bg-gray-50 px-4 py-3 border border-gray-200 min-h-[100px]">
              {formData.notes || '-'}
            </div>
          ) : (
            <>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                maxLength={1000}
                placeholder="Add any additional notes here"
              />
              <p className="mt-2 text-sm text-gray-500 flex justify-between">
                <span>Max 1000 characters</span>
                <span className={formData.notes.length > 950 ? 'text-amber-600' : ''}>
                  {formData.notes.length}/1000
                </span>
              </p>
            </>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          {isView ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.length > 0 ? (
                formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No tags added</p>
              )}
            </div>
          ) : (
            <>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-4 border"
                  placeholder="Type a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Add Tag
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center pl-3 pr-2 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 rounded-full flex-shrink-0 w-5 h-5 inline-flex items-center justify-center text-blue-500 hover:bg-blue-200 hover:text-blue-900 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
          {isView ? (
            <button
              type="button"
              onClick={() => router.push('/buyers')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to List
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEdit ? 'Update Buyer' : 'Create Buyer'}
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {isEdit && initialData && (
          <input type="hidden" name="updatedAt" value={initialData.updatedAt?.toISOString()} />
        )}
      </form>
    </div>
  );
}