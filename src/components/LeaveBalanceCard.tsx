import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import type { LeaveBalance } from '../services/leaveService';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balance }) => {
  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case 'Annual': return 'bg-blue-100 text-blue-800';
      case 'Sick': return 'bg-red-100 text-red-800';
      case 'Personal': return 'bg-purple-100 text-purple-800';
      case 'Maternity': return 'bg-pink-100 text-pink-800';
      case 'Paternity': return 'bg-indigo-100 text-indigo-800';
      case 'Bereavement': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeIcon = (leaveType: string) => {
    switch (leaveType) {
      case 'Annual': return <Calendar className="w-5 h-5" />;
      case 'Sick': return <Clock className="w-5 h-5" />;
      case 'Personal': return <CheckCircle className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const usagePercentage = (balance.usedDays / balance.totalDays) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getLeaveTypeColor(balance.leaveType)}`}>
            {getLeaveTypeIcon(balance.leaveType)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{balance.leaveType} Leave</h3>
            <p className="text-sm text-gray-500">{balance.year}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total Days</span>
          <span className="text-lg font-bold text-gray-900">{balance.totalDays}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Used Days</span>
          <span className="text-lg font-bold text-red-600">{balance.usedDays}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Remaining</span>
          <span className="text-lg font-bold text-green-600">{balance.remainingDays}</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Usage</span>
            <span>{Math.round(usagePercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage > 80 ? 'bg-red-500' : 
                usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Employee: <span className="font-medium text-gray-900">{balance.employeeName}</span>
        </p>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
