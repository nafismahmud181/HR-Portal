import React, { useState } from 'react';
import { X, Calendar, User, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { LeaveRequest } from '../services/leaveService';

interface LeaveRequestDetailsModalProps {
  request: LeaveRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

const LeaveRequestDetailsModal: React.FC<LeaveRequestDetailsModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Leave Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="ml-2">{request.status}</span>
            </span>
          </div>

          {/* Employee Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <p className="text-gray-900">{request.employeeName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{request.employeeEmail}</p>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Leave Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Leave Type:</span>
                <p className="text-gray-900">{request.leaveType}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Total Days:</span>
                <p className="text-gray-900">{request.totalDays} days</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Start Date:</span>
                <p className="text-gray-900">{new Date(request.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">End Date:</span>
                <p className="text-gray-900">{new Date(request.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Reason
            </h3>
            <p className="text-gray-900">{request.reason}</p>
          </div>

          {/* Approval Information */}
          {request.status === 'Approved' && request.approvedBy && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2">Approved</h3>
              <p className="text-green-700">
                Approved by: {request.approvedBy}
                {request.approvedAt && (
                  <span className="block text-sm">
                    on {request.approvedAt.toDate().toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Rejection Information */}
          {request.status === 'Rejected' && request.rejectionReason && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-900 mb-2">Rejected</h3>
              <p className="text-red-700">
                Reason: {request.rejectionReason}
                {request.approvedBy && (
                  <span className="block text-sm">
                    by {request.approvedBy}
                  </span>
                )}
                {request.approvedAt && (
                  <span className="block text-sm">
                    on {request.approvedAt.toDate().toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-900 mb-3">Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Please provide a reason for rejection..."
                required
              />
              <div className="flex justify-end space-x-3 mt-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {request.status === 'Pending' && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestDetailsModal;
