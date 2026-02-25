import React, { useEffect, useState } from "react";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../components/icons";
import {
  GET_PAYMENTS,
  GET_SUBSCRIPTIONS_PLANS,
  GET_ALL_EXPORTS,
  DELETE_EXPORT_FILE,
} from "../constants/ApiConstants";
import Pagination from "../components/Pagination";
import ExportFilterModal from "../components/modal/ExportDataModal";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

const PaymentsPage = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [payments, setPayments] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any>([]);
  const [openModal, setOpenModal] = useState(false);
  const [exportCurrentPage, setExportCurrentPage] = useState(1);
    const [downloadData, setDownloadData] = useState<any>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const itemsPerPage = 10;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchInput]);

  const handleDownload = async (item) => {
    try {
      // Step 1: Trigger file download
      const link = document.createElement("a");
      link.href = item.file_url;
      link.download = item.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await handleFileDelete(item?._id);

      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  const fetchDownloadData = async (exportCurrentPage, itemsPerPage) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(exportCurrentPage),
      limit: String(itemsPerPage),
    });
    params.append("type", "SUBSCRIPTIONS");
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_EXPORTS}?${params.toString()}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setDownloadData(response);
            setLoading(false);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "something went wrong. please try again"
      );
      setLoading(false);
    }
  };
  const handleFileDelete = async (id) => {
    try {
      const response = BackendService.Patch(
        {
          url: `${DELETE_EXPORT_FILE}/${id}/delete`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: () => {
            fetchDownloadData(exportCurrentPage, itemsPerPage);
          },
          failure: () => {},
        }
      );
    } catch (error) {
      toast.error("Something went wrong while deleting. Please try again!");
    }
  };

  const fetchPaymentsData = async (
    currentPage,
    itemsPerPage,
    searchQuery,
    statusFilter,
    selectedPlanId
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (statusFilter) {
        params.append("status", statusFilter);
      }
      if (selectedPlanId?.length > 1) {
        params.append("subscription_id", selectedPlanId);
      }

      const response = await BackendService.Get(
        {
          url: `${GET_PAYMENTS}?${params.toString()}`,
          accessToken: admintoken,
        },
        {
          success: (res) => {
            setPayments(res || []);
            setLoading(false);
          },
          failure: (err) => {
            toast.error(err?.response?.data?.message || "Failed to fetch data");
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchPaymentsData(
      currentPage,
      itemsPerPage,
      searchQuery,
      statusFilter,
      selectedPlanId
    );
  }, [selectedPlanId, , statusFilter, searchQuery]);

  useEffect(() => {
    fetchPaymentsData(
      currentPage,
      itemsPerPage,
      searchQuery,
      statusFilter,
      selectedPlanId
    );
  }, [currentPage, itemsPerPage, searchQuery, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_SUBSCRIPTIONS_PLANS}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setPlans(response || []);
            setLoading(false);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
            setLoading(false);
          },
        }
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDownloadData(exportCurrentPage, itemsPerPage)
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payments & Subscriptions</h1>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by Name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
        />

        <select
          value={selectedPlanId}
          onChange={(e) => {
            setSelectedPlanId(e.target.value);
            setCurrentPage(1); // reset pagination when filter changes
          }}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Plans</option>
          {plans.map((plan: any) => (
            <option key={plan._id} value={plan._id}>
              {plan.type} - {plan.currency} {plan.price}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-48"
        >
          <option value="">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="CREATED">Created</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>
      <div className="flex justify-end my-3">
      <button
            onClick={() => setOpenModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition"
          >
            Export Data
          </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">User Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Currency</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <div className="flex items-center justify-center">
                    <Icons.loading className="w-6 h-6 animate-spin text-gray-500" />
                  </div>
                </td>
              </tr>
            ) : payments?.data?.length > 0 ? (
              payments?.data?.map((pay) => (
                <tr key={pay._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{pay?.user_name}</td>
                  <td className="px-4 py-2">{pay?.user_email}</td>
                  <td className="px-4 py-2">{pay?.currency}</td>
                  <td className="px-4 py-2">{pay.amount}</td>
                  <td className="px-4 py-2">
                    {new Date(pay?.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        pay.status === "SUCCESS"
                          ? "bg-green-100 text-green-600"
                          : pay.status === "CREATED"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {payments?.data?.length >= 1 && (
        <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
          <Pagination
            id={"type2"}
            currentPage={currentPage}
            totalPages={payments?.pagination?.totalPages}
            onPageChange={handlePageChange}
            displayRange={3}
          />
        </div>
      )}
            {downloadData && (
        <div className="mt-6">
          {downloadData?.data?.length >= 1 && (
            <div className="flex items-center justify-between my-3">
              <h2 className="text-2xl font-bold text-gray-800">
                Exported File Data
              </h2>
              <button
                onClick={() => fetchDownloadData(currentPage, itemsPerPage)}
                className="bg-gray-900 p-2 rounded-xl text-white"
              >
                {" "}
                <ReplayOutlinedIcon />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {downloadData?.data?.map((item) => (
              <div
                key={item._id}
                className="border rounded-xl p-4 shadow-sm bg-white flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {" "}
                    Status : {item.status}
                  </p>

                  {/* File Name */}
                  <p className="text-sm text-gray-700 font-medium mt-1">
                    File Name: {item.file_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    Total Records: {item.total_records}
                  </p>

                  <p className="text-sm text-gray-600">
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(item)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  disabled={item.status === "PENDING"}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {downloadData?.data?.length >= 1 && (
        <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
          <Pagination
            id={"type2"}
            currentPage={exportCurrentPage}
            totalPages={downloadData?.pagination?.totalPages}
            onPageChange={handlePageChange}
            displayRange={3}
          />
        </div>
      )}
      {openModal && (
        <ExportFilterModal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false), fetchDownloadData(exportCurrentPage, itemsPerPage);
          }}
          dataType="SUBSCRIPTIONS"
        />
      )}
    </div>
  );
};

export default PaymentsPage;
