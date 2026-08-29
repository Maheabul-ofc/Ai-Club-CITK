import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FaCamera, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Card from '../../components/common/Card.jsx';
import FaceCapture from '../../components/common/FaceCapture.jsx';
import { authService } from '../../services/auth.js';
import { departmentsService } from '../../services/departments.js';

const SignupCoordinatorPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    branch: '',
    semester: '',
    module: '',
    contactNumber: '',
    photos: null
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: departmentsResponse, isLoading: isLoadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsService.getDepartments
  });
  const departments = departmentsResponse?.data || [];

  const signupMutation = useMutation({
    mutationFn: (data) => authService.signupCoordinator(data),
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      const apiError = error.response?.data;
      if (apiError?.errors?.length > 0) {
        const firstError = apiError.errors[0];
        toast.error(`Validation failed on ${firstError.path.join('.')}: ${firstError.message}`);
      } else {
        toast.error(apiError?.message || 'Failed to sign up');
      }
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || formData.password !== formData.confirmPassword) {
      return toast.error("Please fill all required fields correctly.");
    }
    setStep(3);
  };

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

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow text-center">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Application Submitted!</h2>
        <p className="text-gray-600 mb-6">Your application is now under review.</p>
        
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center mb-2">1</div>
            <span className="text-sm font-medium">Department Review</span>
          </div>
          <div className="h-1 w-16 bg-gray-200 mt-[-24px]"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full text-gray-500 flex items-center justify-center mb-2">2</div>
            <span className="text-sm text-gray-500">Asst Chief Review</span>
          </div>
        </div>

        <p className="text-gray-600 mb-6">You will be notified at {formData.email} once approved.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 px-4 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">Coordinator Application</h1>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          <div className={`absolute left-0 top-1/2 h-1 bg-blue-600 -z-10 transform -translate-y-1/2 transition-all duration-300`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 bg-white ${step >= s ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
              {s}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm font-medium text-gray-500">
          <span>Department</span>
          <span className="ml-6">Profile Info</span>
          <span>Review</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4">Select Department</h2>
          {isLoadingDepts ? (
            <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div 
                  key={dept.id}
                  onClick={() => setFormData({...formData, departmentId: dept.id})}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.departmentId === dept.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:shadow'}`}
                >
                  <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                  {dept.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dept.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => setStep(2)} 
              disabled={!formData.departmentId}
            >
              Next Step
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleNextStep2} className="space-y-6 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name *" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Email *" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <Input label="Password *" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <Input label="Confirm Password *" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            
            <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Branch</label>
              <select name="branch" value={formData.branch} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Branch</option>
                {['CSE', 'ECE', 'Food Engineering', 'Civil', 'Mechanical', 'EEE', 'IT', 'Instrumentation'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Semester</label>
              <select name="semester" value={formData.semester} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input label="Module" name="module" value={formData.module} onChange={handleChange} />
            <Input label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
            <Button type="submit">Next Step</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
            <p>After submission, your application will be reviewed by the Department Convenor, then the Assistant Chief Convenor. You will be notified once approved.</p>
          </div>

          <Card>
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Application Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block">Department</span><span className="font-medium">{departments.find(d => d.id === formData.departmentId)?.name}</span></div>
                <div><span className="text-gray-500 block">Name</span><span className="font-medium">{formData.name}</span></div>
                <div><span className="text-gray-500 block">Email</span><span className="font-medium">{formData.email}</span></div>
                <div><span className="text-gray-500 block">Roll Number</span><span className="font-medium">{formData.rollNumber || '-'}</span></div>
                <div><span className="text-gray-500 block">Branch</span><span className="font-medium">{formData.branch || '-'}</span></div>
                <div><span className="text-gray-500 block">Semester</span><span className="font-medium">{formData.semester || '-'}</span></div>
              </div>
            </div>
          </Card>

          <div className="mt-6">
            {formData.photos ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 flex flex-col items-center justify-center text-green-700">
                <FaCheckCircle className="text-4xl mb-3" />
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

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupCoordinatorPage;
