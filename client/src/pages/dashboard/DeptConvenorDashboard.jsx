import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getDeptQueue, deptReview } from '../../services/approvals.js';
import { usersService } from '../../services/users.js';

const DeptConvenorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(''); // 'APPROVED' or 'REJECTED'
  const [remarks, setRemarks] = useState('');

  const { data: queue = [], isLoading: isQueueLoading } = useQuery({
    queryKey: ['deptQueue'],
    queryFn: getDeptQueue,
  });

  const { data: usersResponse, isLoading: isUsersLoading } = useQuery({
    queryKey: ['deptUsers', user?.departmentId],
    queryFn: () => usersService.getUsers({ departmentId: user?.departmentId }),
    enabled: !!user?.departmentId
  });
  
  const roster = usersResponse?.data || [];

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }) => deptReview(id, data),
    onSuccess: () => {
      toast.success(`Application ${actionType.toLowerCase()} successfully`);
      queryClient.invalidateQueries(['deptQueue']);
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
        <h1 className="text-2xl font-bold text-slate-800">
          {user?.role === 'DEPT_ASST_CONVENOR' ? 'Assistant Convenor Dashboard' : 'Department Convenor Dashboard'}
        </h1>
        <p className="text-gray-500">Manage coordinator applications and view department members.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">Pending Applications</h2>
        {isQueueLoading ? (
          <LoadingSpinner />
        ) : queue.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-gray-500">
              No pending applications for your department.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queue.map(app => (
              <Card key={app.id}>
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-3 text-blue-600">
                      <FaUser />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{app.name}</h3>
                      <p className="text-sm text-gray-500">{app.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1 mb-6 flex-grow text-gray-600">
                    <p><span className="font-medium text-gray-800">Roll No:</span> {app.rollNumber}</p>
                    <p><span className="font-medium text-gray-800">Branch:</span> {app.branch}</p>
                    <p><span className="font-medium text-gray-800">Semester:</span> {app.semester}</p>
                  </div>

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
        <h2 className="text-xl font-semibold text-slate-700">Department Roster</h2>
        {isUsersLoading ? (
          <LoadingSpinner />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table 
                columns={[
                  { label: 'Name', key: 'name' },
                  { label: 'Email', key: 'email' },
                  { label: 'Role', key: 'role' },
                  { 
                    label: 'Status', 
                    render: (member) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {member.status || member.approvalStatus}
                      </span>
                    )
                  }
                ]}
                data={roster}
                emptyMessage="No members found in your department."
              />
            </div>
          </Card>
        )}
      </div>

      <Modal 
        isOpen={!!selectedApp} 
        onClose={closeModal}
        title={actionType === 'APPROVED' ? 'Approve Application' : 'Reject Application'}
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-600">
            You are about to <strong className={actionType === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>{actionType.toLowerCase()}</strong> the application for <strong>{selectedApp?.name}</strong>.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any notes here..."
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

export default DeptConvenorDashboard;
