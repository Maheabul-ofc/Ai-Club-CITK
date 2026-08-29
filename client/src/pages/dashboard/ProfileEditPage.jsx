import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usersService } from '../../services/users.js';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import FaceCapture from '../../components/common/FaceCapture.jsx';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../lib/axios.js';

const BRANCH_OPTIONS = [
  { value: 'CSE', label: 'Computer Science and Engineering' },
  { value: 'ECE', label: 'Electronics and Communication Engineering' },
  { value: 'Food Engineering', label: 'Food Engineering and Technology' },
  { value: 'Civil', label: 'Civil Engineering' },
  { value: 'Mechanical', label: 'Mechanical Engineering' },
  { value: 'EEE', label: 'Electrical and Electronics Engineering' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'Instrumentation', label: 'Instrumentation Engineering' }
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
  value: String(i + 1),
  label: `Semester ${i + 1}`
}));

const ProfileEditPage = () => {
  const { user } = useAuth();
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceEnrolling, setFaceEnrolling] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      contactNumber: user?.contactNumber || '',
      branch: user?.branch || '',
      semester: user?.semester || ''
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => usersService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const onSubmit = (data) => {
    const payload = { ...data };
    if (payload.semester) {
      payload.semester = parseInt(payload.semester, 10);
    } else {
      delete payload.semester; // Remove if empty so it doesn't fail validation
    }
    mutation.mutate(payload);
  };

  const handleFaceReEnroll = async (photos) => {
    setFaceEnrolling(true);
    try {
      await axiosInstance.post('/auth/face/re-enroll', { photos });
      toast.success('Face re-enrolled successfully!');
      setShowFaceCapture(false);
    } catch (error) {
      toast.error('Face re-enrollment failed. Please try again.');
    } finally {
      setFaceEnrolling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />

          <Input
            label="Contact Number"
            type="tel"
            {...register('contactNumber')}
            error={errors.contactNumber?.message}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <select
              {...register('branch')}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            >
              <option value="">Select Branch</option>
              {BRANCH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              {...register('semester')}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            >
              <option value="">Select Semester</option>
              {SEMESTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" isLoading={mutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Face Re-enrollment Section */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Face Re-enrollment</h2>
            <p className="text-sm text-gray-500 mt-1">
              Re-enroll your face if the attendance scanner is not recognizing you correctly (e.g. after a haircut, glasses, etc.).
            </p>
          </div>
          {showFaceCapture ? (
            <div className="space-y-3">
              <FaceCapture onCaptureComplete={handleFaceReEnroll} />
              <Button variant="outline" size="sm" onClick={() => setShowFaceCapture(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowFaceCapture(true)} isLoading={faceEnrolling}>
              📷 Re-enroll My Face
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileEditPage;

