import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUsers, FaBuilding, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import { usersService } from '../../services/users.js';
import { departmentsService } from '../../services/departments.js';

import { useNavigate } from 'react-router';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });

  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [editMemberForm, setEditMemberForm] = useState({ id: '', name: '', email: '', password: '', role: 'MEMBER', departmentId: '' });

  // Queries
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getUsers()
  });

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getDepartments()
  });

  const users = (usersData?.data || []).filter(u => u.role !== 'SUPER_ADMIN');
  const departments = deptData?.data || [];

  // Mutations
  const addTeamMemberMutation = useMutation({
    mutationFn: usersService.addTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsTeamModalOpen(false);
      setTeamForm({ name: '', email: '', password: '', role: 'MEMBER' });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: (data) => usersService.updateTeamMember(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsEditMemberModalOpen(false);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update member');
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (userId) => usersService.deleteTeamMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete member');
    }
  });

  const createDeptMutation = useMutation({
    mutationFn: departmentsService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', description: '' });
    }
  });

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    addTeamMemberMutation.mutate(teamForm);
  };

  const handleEditMemberSubmit = (e) => {
    e.preventDefault();
    updateMemberMutation.mutate(editMemberForm);
  };

  const handleDeptSubmit = (e) => {
    e.preventDefault();
    createDeptMutation.mutate(deptForm);
  };

  const openEditMemberModal = (member) => {
    setEditMemberForm({
      id: member.id,
      name: member.name,
      email: member.email,
      password: '', // Don't show existing password
      role: member.role,
      departmentId: member.departmentId || ''
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
    { label: 'Role', render: (user) => <span className="px-2 py-1 bg-brand-100 text-brand-800 rounded text-xs font-semibold">{user.role}</span> },
    { label: 'Branch', key: 'branch', render: (user) => user.branch || 'N/A' },
    {
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
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-brand-100 rounded-lg text-brand-600">
            <FaUsers size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <FaBuilding size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Departments</p>
            <p className="text-2xl font-bold">{departments.length}</p>
          </div>
        </Card>
      </div>

      {/* Department Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Department Management</h2>
          <Button onClick={() => setIsDeptModalOpen(true)}>
            <FaPlus className="mr-2" /> Add Department
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map(dept => (
            <Card key={dept.id} className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between" onClick={() => navigate(`/dashboard/departments/${dept.id}`)}>
              <div>
                <h3 className="font-bold text-lg text-brand-700">{dept.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{dept.description || 'No description'}</p>
                <div className="mt-4 flex items-center text-xs font-semibold text-gray-400">
                  <FaUsers className="mr-1" /> {dept._count?.members || 0} Members
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <span className="text-brand-600 text-sm font-medium hover:underline">Manage Dept &rarr;</span>
              </div>
            </Card>
          ))}
          {departments.length === 0 && !deptLoading && (
            <p className="text-gray-500 text-sm col-span-3">No departments found.</p>
          )}
        </div>
      </div>

      {/* Team Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Team Management</h2>
          <Button onClick={() => setIsTeamModalOpen(true)}>
            <FaPlus className="mr-2" /> Add Team Member
          </Button>
        </div>
        <Card padding={false}>
          {usersLoading ? (
            <p className="p-6">Loading users...</p>
          ) : (
            <Table columns={userColumns} data={users} />
          )}
        </Card>
      </div>

      {/* Team Member Modal */}
      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <Input 
            label="Name" 
            value={teamForm.name} 
            onChange={(e) => setTeamForm({...teamForm, name: e.target.value})} 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            value={teamForm.email} 
            onChange={(e) => setTeamForm({...teamForm, email: e.target.value})} 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={teamForm.password} 
            onChange={(e) => setTeamForm({...teamForm, password: e.target.value})} 
            required 
          />
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Role</label>
            <select 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={teamForm.role}
              onChange={(e) => {
                const newRole = e.target.value;
                setTeamForm({...teamForm, role: newRole, departmentId: (newRole === 'DEPT_CONVENOR' || newRole === 'DEPT_ASST_CONVENOR' || newRole === 'COORDINATOR') ? teamForm.departmentId : ''});
              }}
            >
              <option value="MEMBER">Member</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="DEPT_ASST_CONVENOR">Department Assistant Convenor</option>
              <option value="DEPT_CONVENOR">Department Convenor</option>
              <option value="ASST_CHIEF_CONVENOR">Assistant Chief Convenor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          {(teamForm.role === 'DEPT_CONVENOR' || teamForm.role === 'DEPT_ASST_CONVENOR' || teamForm.role === 'COORDINATOR') && (
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Select Department</label>
              {departments.length === 0 ? (
                <p className="text-sm text-red-500">No departments available. Please create one first.</p>
              ) : (
                <select 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={teamForm.departmentId || ''}
                  onChange={(e) => setTeamForm({...teamForm, departmentId: e.target.value})}
                  required
                >
                  <option value="" disabled>-- Select a Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsTeamModalOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              isLoading={addTeamMemberMutation.isPending}
              disabled={(teamForm.role === 'DEPT_CONVENOR' || teamForm.role === 'DEPT_ASST_CONVENOR' || teamForm.role === 'COORDINATOR') && departments.length === 0}
            >
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
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
              onChange={(e) => {
                const newRole = e.target.value;
                setEditMemberForm({...editMemberForm, role: newRole, departmentId: (newRole === 'DEPT_CONVENOR' || newRole === 'DEPT_ASST_CONVENOR' || newRole === 'COORDINATOR') ? editMemberForm.departmentId : ''});
              }}
            >
              <option value="MEMBER">Member</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="DEPT_ASST_CONVENOR">Department Assistant Convenor</option>
              <option value="DEPT_CONVENOR">Department Convenor</option>
              <option value="ASST_CHIEF_CONVENOR">Assistant Chief Convenor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {(editMemberForm.role === 'DEPT_CONVENOR' || editMemberForm.role === 'DEPT_ASST_CONVENOR' || editMemberForm.role === 'COORDINATOR') && (
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Select Department</label>
              {departments.length === 0 ? (
                <p className="text-sm text-red-500">No departments available.</p>
              ) : (
                <select 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editMemberForm.departmentId || ''}
                  onChange={(e) => setEditMemberForm({...editMemberForm, departmentId: e.target.value})}
                  required
                >
                  <option value="" disabled>-- Select a Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsEditMemberModalOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              isLoading={updateMemberMutation.isPending}
              disabled={(editMemberForm.role === 'DEPT_CONVENOR' || editMemberForm.role === 'DEPT_ASST_CONVENOR' || editMemberForm.role === 'COORDINATOR') && departments.length === 0}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Department Modal */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title="Create Department">
        <form onSubmit={handleDeptSubmit} className="space-y-4">
          <Input 
            label="Department Name" 
            value={deptForm.name} 
            onChange={(e) => setDeptForm({...deptForm, name: e.target.value})} 
            required 
          />
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Description</label>
            <textarea 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows="3"
              value={deptForm.description}
              onChange={(e) => setDeptForm({...deptForm, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createDeptMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
