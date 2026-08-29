import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUsers, FaUserShield, FaBuilding, FaPlus, FaTrash } from 'react-icons/fa';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import { usersService } from '../../services/users.js';
import { departmentsService } from '../../services/departments.js';

import { useNavigate } from 'react-router';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Form states
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });

  // Queries
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getUsers()
  });

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getDepartments()
  });

  const users = usersData?.data || [];
  const admins = users.filter(u => u.role === 'ADMIN');
  const members = users.filter(u => u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN');
  const departments = deptData?.data || [];

  // Mutations
  const createAdminMutation = useMutation({
    mutationFn: usersService.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsAdminModalOpen(false);
      setAdminForm({ name: '', email: '', password: '' });
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: usersService.deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
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

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    createAdminMutation.mutate(adminForm);
  };

  const handleDeptSubmit = (e) => {
    e.preventDefault();
    createDeptMutation.mutate(deptForm);
  };

  const adminColumns = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { 
      label: 'Actions', 
      render: (admin) => (
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this admin?')) {
              deleteAdminMutation.mutate(admin.id);
            }
          }}
          disabled={deleteAdminMutation.isPending}
        >
          <FaTrash />
        </Button>
      ) 
    },
  ];

  const memberColumns = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Role', render: (user) => <span className="px-2 py-1 bg-brand-100 text-brand-800 rounded text-xs font-semibold">{user.role}</span> },
    { label: 'Branch', key: 'branch', render: (user) => user.branch || 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <FaUserShield size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-bold">{admins.length}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-brand-100 rounded-lg text-brand-600">
            <FaUsers size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Other Members</p>
            <p className="text-2xl font-bold">{members.length}</p>
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

      {/* Admin Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Management</h2>
          <Button onClick={() => setIsAdminModalOpen(true)}>
            <FaPlus className="mr-2" /> Create New Admin
          </Button>
        </div>
        <Card padding={false}>
          {usersLoading ? (
            <p className="p-6">Loading admins...</p>
          ) : (
            <Table columns={adminColumns} data={admins} emptyMessage="No admin accounts found." />
          )}
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
        <h2 className="text-xl font-semibold">All Members</h2>
        <Card padding={false}>
          {usersLoading ? (
            <p className="p-6">Loading users...</p>
          ) : (
            <Table columns={memberColumns} data={members} />
          )}
        </Card>
      </div>

      {/* Admin Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Create New Admin">
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <Input 
            label="Name" 
            value={adminForm.name} 
            onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            value={adminForm.email} 
            onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={adminForm.password} 
            onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} 
            required 
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsAdminModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createAdminMutation.isPending}>Create Admin</Button>
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

export default SuperAdminDashboard;
