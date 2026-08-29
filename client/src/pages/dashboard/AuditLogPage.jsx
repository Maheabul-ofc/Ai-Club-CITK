import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Card from '../../components/common/Card.jsx';
import Table from '../../components/common/Table.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { analyticsService } from '../../services/analytics.js';

const AuditLogPage = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');

  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auditLogs', page, actionFilter, targetTypeFilter],
    queryFn: () => analyticsService.getAuditLogs({ 
      page, 
      limit, 
      action: actionFilter || undefined, 
      targetType: targetTypeFilter || undefined 
    }),
    keepPreviousData: true,
  });

  const columns = [
    {
      label: 'Timestamp',
      key: 'createdAt',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy HH:mm:ss')
    },
    {
      label: 'Actor',
      key: 'actor',
      render: (row) => row.actor?.name || 'System'
    },
    {
      label: 'Action',
      key: 'action',
      render: (row) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {row.action}
        </span>
      )
    },
    {
      label: 'Target Type',
      key: 'targetType'
    },
    {
      label: 'Target ID',
      key: 'targetId',
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.targetId}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Track system activities and administrative actions</p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              label="Filter by Action"
              placeholder="e.g. CREATE, UPDATE, DELETE"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Type
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="User">User</option>
              <option value="Department">Department</option>
              <option value="Event">Event</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center py-8">Failed to load audit logs.</div>
        ) : (
          <>
            <Table
              data={data?.data?.logs || []}
              columns={columns}
              emptyMessage="No audit logs found matching the filters."
            />
            
            {data?.data?.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Page {page} of {data.data.totalPages}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(data.data.totalPages, p + 1))}
                    disabled={page === data.data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AuditLogPage;
