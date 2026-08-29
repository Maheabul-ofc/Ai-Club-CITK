import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsService } from '../../services/departments.js';
import { usersService } from '../../services/users.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const DepartmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  
  const [memberForm, setMemberForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [editMemberForm, setEditMemberForm] = useState({ id: '', name: '', email: '', password: '', role: 'MEMBER' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const isSuperOrAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentsService.getDepartmentById(id)
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['department_users', id],
    queryFn: () => usersService.getUsers({ departmentId: id })
  });

  const department = deptData?.data;
  const users = usersData?.data || [];

  const addMemberMutation = useMutation({
    mutationFn: (data) => usersService.addTeamMember({ ...data, departmentId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['department_users', id]);
      setIsMemberModalOpen(false);
      setMemberForm({ name: '', email: '', password: '', role: 'MEMBER' });
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to add member');
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: (data) => usersService.updateTeamMember(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['department_users', id]);
      setIsEditMemberModalOpen(false);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update member');
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (userId) => usersService.deleteTeamMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['department_users', id]);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete member');
    }
  });

  const updateDeptMutation = useMutation({
    mutationFn: (data) => departmentsService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['department', id]);
      queryClient.invalidateQueries(['departments']);
      setIsEditModalOpen(false);
    }
  });

  const deleteDeptMutation = useMutation({
    mutationFn: () => departmentsService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      navigate(user?.role === 'SUPER_ADMIN' ? '/dashboard/super-admin' : '/dashboard/admin');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete department. Please remove active members first.');
    }
  });

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    addMemberMutation.mutate(memberForm);
  };

  const handleEditMemberSubmit = (e) => {
    e.preventDefault();
    updateMemberMutation.mutate(editMemberForm);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateDeptMutation.mutate(editForm);
  };

  const handleDeleteDept = () => {
    if (users.length > 0) {
      alert('Cannot delete this department because it still has active members. Please remove or reassign them first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${department.name}? This action cannot be undone.`)) {
      deleteDeptMutation.mutate();
    }
  };

  const openEditMemberModal = (member) => {
    setEditMemberForm({
      id: member.id,
      name: member.name,
      email: member.email,
      password: '', // Don't show existing password
      role: member.role
    });
    setIsEditMemberModalOpen(true);
  };

  const handleDeleteMember = (userId, name) => {
    if (window.confirm(`Are you sure you want to delete member ${name}? This will permanently remove them from the system.`)) {
      deleteMemberMutation.mutate(userId);
    }
  };

  const userColumns = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Role', render: (u) => <span className="px-2 py-1 bg-brand-100 text-brand-800 rounded text-xs font-semibold">{u.role.replace(/_/g, ' ')}</span> },
    { label: 'Branch', key: 'branch', render: (u) => u.branch || 'N/A' },
    ...(isSuperOrAdmin ? [{
      label: 'Actions',
      render: (u) => (
        <div className="flex space-x-3">
          <button onClick={() => openEditMemberModal(u)} className="text-blue-600 hover:text-blue-800" title="Edit Member">
            <FaEdit size={16} />
          </button>
          <button onClick={() => handleDeleteMember(u.id, u.name)} className="text-red-600 hover:text-red-800" title="Delete Member">
            <FaTrash size={16} />
          </button>
        </div>
      )
    }] : [])
  ];

  if (deptLoading) return <div className="p-6">Loading department...</div>;
  if (!department) return <div className="p-6">Department not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="px-2">
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
        </div>
        
        {isSuperOrAdmin && (
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={() => {
              setEditForm({ name: department.name, description: department.description || '' });
              setIsEditModalOpen(true);
            }}>
              <FaEdit className="mr-2" /> Edit
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteDept} isLoading={deleteDeptMutation.isPending}>
              <FaTrash className="mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-gray-600">{department.description || 'No description provided.'}</p>

      {/* Leadership & Members */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Department Members</h2>
          {isSuperOrAdmin && (
            <Button onClick={() => setIsMemberModalOpen(true)}>
              <FaPlus className="mr-2" /> Assign / Add Member
            </Button>
          )}
        </div>
        
        <Card padding={false}>
          {usersLoading ? (
            <p className="p-6">Loading members...</p>
          ) : (
            <Table columns={userColumns} data={users} emptyMessage="No members assigned to this department yet." />
          )}
        </Card>
      </div>

      {/* Edit Department Modal */}
      {isSuperOrAdmin && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${department.name}`}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input 
              label="Department Name" 
              value={editForm.name} 
              onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
              required 
            />
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Description</label>
              <textarea 
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                rows="3"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={updateDeptMutation.isPending}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {isSuperOrAdmin && (
        <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title={`Assign Member to ${department.name}`}>
          <form onSubmit={handleMemberSubmit} className="space-y-4">
            <Input 
              label="Name" 
              value={memberForm.name} 
              onChange={(e) => setMemberForm({...memberForm, name: e.target.value})} 
              required 
            />
            <Input 
              label="Email" 
              type="email" 
              value={memberForm.email} 
              onChange={(e) => setMemberForm({...memberForm, email: e.target.value})} 
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              value={memberForm.password} 
              onChange={(e) => setMemberForm({...memberForm, password: e.target.value})} 
              required 
            />
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Role</label>
              <select 
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={memberForm.role}
                onChange={(e) => setMemberForm({...memberForm, role: e.target.value})}
              >
                <option value="MEMBER">Member</option>
                <option value="COORDINATOR">Coordinator</option>
                <option value="DEPT_ASST_CONVENOR">Department Assistant Convenor</option>
                <option value="DEPT_CONVENOR">Department Convenor</option>
                <option value="ASST_CHIEF_CONVENOR">Assistant Chief Convenor</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setIsMemberModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={addMemberMutation.isPending}>Assign Member</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Member Modal */}
      {isSuperOrAdmin && (
        <Modal isOpen={isEditMemberModalOpen} onClose={() => setIsEditMemberModalOpen(false)} title="Edit Member">
          <form onSubmit={handleEditMemberSubmit} className="space-y-4">
            <Input 
              label="Name" 
              value={editMemberForm.name} 
              onChange={(e) => setEditMemberForm({...editMemberForm, name: e.target.value})} 
              required 
            />
            <Input 
              label="Email" 
              type="email" 
              value={editMemberForm.email} 
              onChange={(e) => setEditMemberForm({...editMemberForm, email: e.target.value})} 
              required 
            />
            <Input 
              label="New Password (leave blank to keep current)" 
              type="password" 
              value={editMemberForm.password} 
              onChange={(e) => setEditMemberForm({...editMemberForm, password: e.target.value})} 
            />
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Role</label>
              <select 
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={editMemberForm.role}
                onChange={(e) => setEditMemberForm({...editMemberForm, role: e.target.value})}
              >
                <option value="MEMBER">Member</option>
                <option value="COORDINATOR">Coordinator</option>
                <option value="DEPT_ASST_CONVENOR">Department Assistant Convenor</option>
                <option value="DEPT_CONVENOR">Department Convenor</option>
                <option value="ASST_CHIEF_CONVENOR">Assistant Chief Convenor</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setIsEditMemberModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={updateMemberMutation.isPending}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DepartmentDetailsPage;
