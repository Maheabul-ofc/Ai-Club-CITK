import React, { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaCheck, FaTimes, FaUser, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getFinalQueue, finalReview } from '../../services/approvals.js';

const AsstChiefDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(''); // 'APPROVED' or 'REJECTED'
  const [remarks, setRemarks] = useState('');

  const { data: queue = [], isLoading: isQueueLoading } = useQuery({
    queryKey: ['finalQueue'],
    queryFn: getFinalQueue,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }) => finalReview(id, data),
    onSuccess: () => {
      toast.success(`Application ${actionType.toLowerCase()} successfully`);
      queryClient.invalidateQueries(['finalQueue']);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process application');
    }
  });

  const handleActionClick = (app, action) => {
    setSelectedApp(app);
    setActionType(action);
    setRemarks('');
  };

  const closeModal = () => {
    setSelectedApp(null);
    setActionType('');
    setRemarks('');
  };

  const submitReview = () => {
    reviewMutation.mutate({
      id: selectedApp.id,
      data: { status: actionType, remarks }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Assistant Chief Convenor Dashboard</h1>
        <p className="text-gray-500">Final review of coordinator applications and attendance tracking.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">Final Approval Queue</h2>
        {isQueueLoading ? (
          <LoadingSpinner />
        ) : queue.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-gray-500">
              No applications pending final review.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queue.map(app => (
              <Card key={app.id}>
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-full mr-3 text-purple-600">
                      <FaUser />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{app.name}</h3>
                      <p className="text-sm text-gray-500">{app.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2 mb-4 text-gray-600">
                    <p className="flex items-center text-purple-700 font-medium bg-purple-50 p-2 rounded">
                      <FaBuilding className="mr-2" /> {app.Department?.name || 'Department'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p><span className="font-medium text-gray-800">Roll No:</span> {app.rollNumber}</p>
                      <p><span className="font-medium text-gray-800">Branch:</span> {app.branch}</p>
                    </div>
                  </div>

                  {app.deptRemarks && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm">
                      <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider block mb-1">Dept Convenor Remarks</span>
                      <p className="italic text-gray-700">"{app.deptRemarks}"</p>
                    </div>
                  )}

                  <div className="flex space-x-3 mt-auto">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleActionClick(app, 'APPROVED')}
                    >
                      <FaCheck className="mr-2" /> Approve
                    </Button>
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                      onClick={() => handleActionClick(app, 'REJECTED')}
                    >
                      <FaTimes className="mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-semibold text-slate-700">Attendance Records</h2>
        <Card>
          <div className="p-8 text-center border-2 border-dashed border-gray-200 m-4 rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-4">View and manage all events and their associated attendance logs.</p>
            <Link to="/dashboard/events">
              <Button>View Full Attendance Logs</Button>
            </Link>
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={!!selectedApp} 
        onClose={closeModal}
        title={actionType === 'APPROVED' ? 'Final Approval' : 'Final Rejection'}
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-600">
            You are about to <strong className={actionType === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>{actionType.toLowerCase()}</strong> the application for <strong>{selectedApp?.name}</strong>.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add final review notes here..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={closeModal} disabled={reviewMutation.isPending}>
              Cancel
            </Button>
            <Button 
              className={actionType === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={submitReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AsstChiefDashboard;
