import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LeaveRequest } from '../services/leaveService';

interface LeaveCalendarProps {
  leaveRequests: LeaveRequest[];
  currentMonth?: Date;
}

const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ 
  leaveRequests, 
  currentMonth = new Date() 
}) => {
  const [currentDate, setCurrentDate] = useState(currentMonth);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getLeaveRequestsForDate = (date: Date) => {
    return leaveRequests.filter(request => {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const currentDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return currentDateOnly >= startDate && currentDateOnly <= endDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Leave Calendar</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: startingDay }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2" />
        ))}

        {/* Calendar Days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const currentDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayLeaveRequests = getLeaveRequestsForDate(currentDateObj);
          const isToday = currentDateObj.toDateString() === new Date().toDateString();

          return (
            <div
              key={day}
              className={`p-2 min-h-[80px] border border-gray-200 hover:bg-gray-50 transition-colors ${
                isToday ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                {day}
              </div>
              
              {/* Leave Request Indicators */}
              <div className="space-y-1">
                {dayLeaveRequests.slice(0, 2).map((request, reqIndex) => (
                  <div
                    key={reqIndex}
                    className={`text-xs p-1 rounded truncate ${getStatusColor(request.status)} text-white`}
                    title={`${request.employeeName} - ${request.leaveType}`}
                  >
                    {request.employeeName.split(' ')[0]}
                  </div>
                ))}
                {dayLeaveRequests.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayLeaveRequests.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Rejected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;
