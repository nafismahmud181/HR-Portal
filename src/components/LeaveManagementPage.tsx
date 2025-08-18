import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Search,
} from "lucide-react";
import SideNavbar from "./SideNavbar";
import { useAuth } from "../contexts/AuthContext";
import {
  leaveService,
  type LeaveRequest,
  type LeaveBalance,
} from "../services/leaveService";
import { employeeService, type Employee } from "../services/employeeService";
import CreateLeaveRequestModal from "./CreateLeaveRequestModal";
import LeaveRequestDetailsModal from "./LeaveRequestDetailsModal";
import LeaveBalanceCard from "./LeaveBalanceCard";
import LeaveCalendar from "./LeaveCalendar";

type TabId = "overview" | "requests" | "balances" | "calendar";

interface CreateLeaveFormData {
  employeeId: string;
  leaveType: LeaveRequest["leaveType"];
  startDate: string;
  endDate: string;
  reason: string;
}

const LeaveManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "All Statuses",
    leaveType: "All Types",
    department: "",
    dateRange: { start: "", end: "" },
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [requests, balances, employeeList] = await Promise.all([
        leaveService.getLeaveRequests(),
        currentUser
          ? leaveService.getLeaveBalances(currentUser.uid)
          : Promise.resolve([]),
        employeeService.getEmployees(),
      ]);

      setLeaveRequests(requests);
      setLeaveBalances(balances);
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRequest = async (requestData: CreateLeaveFormData) => {
    try {
      const employee = employees.find((e) => e.id === requestData.employeeId);
      if (!employee) {
        throw new Error("Selected employee not found");
      }

      const totalDays = leaveService.calculateLeaveDays(
        requestData.startDate,
        requestData.endDate
      );

      const newLeaveRequest: Omit<
        LeaveRequest,
        "id" | "createdAt" | "updatedAt"
      > = {
        employeeId: requestData.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeEmail: employee.email,
        leaveType: requestData.leaveType,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        totalDays,
        reason: requestData.reason,
        status: "Pending",
        managerId: currentUser?.uid,
      };

      await leaveService.createLeaveRequest(newLeaveRequest);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error("Error creating leave request:", error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      if (currentUser) {
        await leaveService.approveLeaveRequest(requestId, currentUser.uid);
        loadData();
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      if (currentUser) {
        await leaveService.rejectLeaveRequest(
          requestId,
          currentUser.uid,
          reason
        );
        loadData();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredRequests = leaveRequests.filter((request) => {
    if (
      filters.searchTerm &&
      !request.employeeName
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.status !== "All Statuses" &&
      request.status !== filters.status
    ) {
      return false;
    }
    if (
      filters.leaveType !== "All Types" &&
      request.leaveType !== filters.leaveType
    ) {
      return false;
    }
    return true;
  });

  const pendingRequests = leaveRequests.filter(
    (req) => req.status === "Pending"
  );
  const approvedRequests = leaveRequests.filter(
    (req) => req.status === "Approved"
  );
  const rejectedRequests = leaveRequests.filter(
    (req) => req.status === "Rejected"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar currentPage="leave" />

      <div className="flex-1 ml-20 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-left text-3xl font-bold text-gray-900">
                Leave Management
              </h1>
              <p className="text-gray-600">
                Manage employee leave requests and balances
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Leave Request</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 ">
              {(
                [
                  {
                    id: "overview",
                    label: "Overview",
                    icon: <Calendar className="w-5 h-5" />,
                  },
                  {
                    id: "requests",
                    label: "Leave Requests",
                    icon: <Clock className="w-5 h-5" />,
                  },
                  {
                    id: "balances",
                    label: "Leave Balances",
                    icon: <Calendar className="w-5 h-5" />,
                  },
                  {
                    id: "calendar",
                    label: "Calendar View",
                    icon: <Calendar className="w-5 h-5" />,
                  },
                ] as { id: TabId; label: string; icon: React.ReactNode }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-4 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-gray-500 hover:bg-blue-300 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Pending Requests
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {pendingRequests.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Approved
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {approvedRequests.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Rejected
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {rejectedRequests.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Employees
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {employees.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Requests */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Leave Requests
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <colgroup>
                      <col className="w-[30%]" />
                      <col className="w-[12%]" />
                      <col className="w-[28%]" />
                      <col className="w-[15%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.slice(0, 5).map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.employeeName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.employeeEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {request.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-900">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </button>
                            {request.status === "Pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveRequest(request.id!)
                                  }
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectRequest(request.id!, "")
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        value={filters.searchTerm}
                        onChange={(e) =>
                          setFilters({ ...filters, searchTerm: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Cancelled</option>
                  </select>

                  <select
                    value={filters.leaveType}
                    onChange={(e) =>
                      setFilters({ ...filters, leaveType: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>All Types</option>
                    <option>Annual</option>
                    <option>Sick</option>
                    <option>Personal</option>
                    <option>Maternity</option>
                    <option>Paternity</option>
                    <option>Bereavement</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Requests Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    All Leave Requests
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <colgroup>
                      <col className="w-[30%]" />
                      <col className="w-[12%]" />
                      <col className="w-[28%]" />
                      <col className="w-[10%]" />
                      <col className="w-[12%]" />
                      <col className="w-[8%]" />
                    </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.employeeName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.employeeEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {request.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.totalDays} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </button>
                            {request.status === "Pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveRequest(request.id!)
                                  }
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectRequest(request.id!, "")
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "balances" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaveBalances.map((balance) => (
                  <LeaveBalanceCard key={balance.id} balance={balance} />
                ))}
                {leaveBalances.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No leave balances found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <LeaveCalendar leaveRequests={leaveRequests} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateLeaveRequestModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRequest}
          employees={employees}
        />
      )}

      {selectedRequest && (
        <LeaveRequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => {
            handleApproveRequest(selectedRequest.id!);
            setSelectedRequest(null);
          }}
          onReject={(reason) => {
            handleRejectRequest(selectedRequest.id!, reason);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default LeaveManagementPage;
