import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FaCamera, FaCheckCircle } from 'react-icons/fa';
import { authService } from '../../services/auth.js';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import FaceCapture from '../../components/common/FaceCapture.jsx';

const SignupMemberPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    branch: '',
    semester: '',
    contactNumber: '',
    photos: null
  });

  const branches = ['CSE', 'ECE', 'Food Engineering', 'Civil', 'Mechanical', 'EEE', 'IT', 'Instrumentation'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signupMutation = useMutation({
    mutationFn: (data) => authService.signupMember(data),
    onSuccess: () => {
      toast.success('Account created! You can now log in.');
      navigate('/login');
    },
    onError: (error) => {
      const apiError = error.response?.data;
      if (apiError?.errors?.length > 0) {
        const firstError = apiError.errors[0];
        toast.error(`Validation failed on ${firstError.path.join('.')}: ${firstError.message}`);
      } else {
        toast.error(apiError?.message || 'Registration failed');
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Omit confirmPassword from payload
    const { confirmPassword, ...rawPayload } = formData;
    
    const payload = {};
    Object.keys(rawPayload).forEach(key => {
      if (rawPayload[key] !== '' && rawPayload[key] !== null) {
        payload[key] = rawPayload[key];
      }
    });

    if (payload.semester) {
      payload.semester = parseInt(payload.semester, 10);
    }
    
    if (!payload.photos || payload.photos.length !== 5) {
      toast.error('Please complete face registration first.');
      return;
    }

    signupMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Join AI Club</h2>
          <p className="mt-2 text-gray-600">Register as a member to participate in events and workshops.</p>
        </div>

        <Card className="shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name *" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Email Address *" type="email" name="email" value={formData.email} onChange={handleChange} required />
                <Input label="Password *" type="password" name="password" value={formData.password} onChange={handleChange} required />
                <Input label="Confirm Password *" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                <Input label="Contact Number" type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
              </div>
            </div>

            {/* Academic Info Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} />
                
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Branch</label>
                  <select 
                    name="branch" 
                    value={formData.branch} 
                    onChange={handleChange}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Semester</label>
                  <select 
                    name="semester" 
                    value={formData.semester} 
                    onChange={handleChange}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Face Capture Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Face Registration (Attendance)</h3>
              {formData.photos ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center justify-center text-green-700">
                  <FaCheckCircle className="text-4xl mb-2" />
                  <p className="font-medium">Face registration complete ({formData.photos.length} photos)</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setFormData({...formData, photos: null})}>
                    Retake Photos
                  </Button>
                </div>
              ) : (
                <FaceCapture onCaptureComplete={(photos) => {
                  setFormData({...formData, photos});
                  toast.success('Face registration photos saved!');
                }} />
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Want to be a Coordinator?{' '}
                <Link to="/signup/coordinator" className="font-medium text-brand-600 hover:text-brand-500">
                  Apply here
                </Link>
              </p>
              <Button type="submit" size="lg" isLoading={signupMutation.isPending} className="w-full sm:w-auto px-8">
                Complete Registration
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupMemberPage;
