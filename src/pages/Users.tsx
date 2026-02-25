import React, { useState, useEffect } from "react";
import UserModal from "../components/modal/UserModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  DELETE_USER,
  GET_ALL_USERS,
  GET_ALL_EXPORTS,
  DELETE_EXPORT_FILE,
} from "../constants/ApiConstants";
import Pagination from "../components/Pagination";
import ConformationModal from "../components/modal/ConformationModal";
import AddStudentModal from "../components/modal/AddStudent";
import ExportFilterModal from "../components/modal/ExportDataModal";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

const Users: React.FC = () => {
  const [users, setUsers] = useState<any>([]);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [exportCurrentPage, setExportCurrentPage] = useState(1);
  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [downloadData, setDownloadData] = useState<any>([]);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [number, setNumber] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) {
      console.warn("Date string is empty or undefined:", dateString);
      return "Not Available";
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Invalid date";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = String(date.getFullYear()).slice(-2);
    return `${day}, ${month} ${year}`;
  };

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

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput); // update after delay
      setCurrentPage(1); // reset to page 1
    }, 500); // debounce delay (in ms)

    return () => clearTimeout(delay); // cleanup on each keypress
  }, [searchInput]);

  const fetchData = async (currentPage, itemsPerPage, searchQuery) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
    });

    if (searchQuery) {
      params.append("search", searchQuery);
    }
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_USERS}?${params.toString()}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setUsers(response);
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

  const fetchDownloadData = async (exportCurrentPage, itemsPerPage) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(exportCurrentPage),
      limit: String(itemsPerPage),
    });
    params.append("type", "USERS");
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
  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchDownloadData(exportCurrentPage, itemsPerPage);
  }, []);
  const handleDelete = async () => {
    setIsDeleteModal(false);
    try {
      const response = BackendService.Post(
        {
          url: `${DELETE_USER}`,
          data: {
            user_id: deleteId,
          },
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Succesfully Deleted Advertisement!");
            fetchData(currentPage, itemsPerPage, searchQuery);
          },
          failure: () => {
            toast.error("Failed to Delete Advertisement!");
          },
        }
      );
    } catch (error) {
      toast.error(
        "Something went wrong while deleting Advertisement. Please try again!"
      );
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          User Management
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
          />
          <button
            onClick={() => setOpenModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition"
          >
            Export Data
          </button>
        </div>
        <div className="rounded-lg border border-gray-200">
          <table className=" w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-600">
                  Photo
                </th>
                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-600">
                  Phone
                </th>
                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-600">
                  Credits
                </th>
                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-600">
                  Registered At
                </th>
                <th className="px-2 py-3 text-right text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users?.users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  {/* Photo */}
                  <td className="px-2 py-3">
                    {user.profile ? (
                      <img
                        src={user.profile}
                        alt={
                          `${user.first_name || ""} ${user.last_name || ""}` ||
                          "-"
                        }
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className=" h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold border">
                        {user.first_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-2 py-4 text-sm text-gray-800 truncate overflow-hidden whitespace-nowrap">
                    {`${user.first_name || ""} ${user.last_name || ""}`}
                  </td>

                  {/* Email */}
                  <td className="px-2 py-4 text-sm text-gray-800 truncate overflow-hidden whitespace-nowrap">
                    {user.email || "-"}
                  </td>

                  {/* Phone */}
                  <td className="px-2 py-4 text-sm text-gray-700 truncate overflow-hidden whitespace-nowrap">
                    {user.country_code && user.mobile_number
                      ? `${user.country_code} ${user.mobile_number}`
                      : "-"}
                  </td>

                  {/* Credits */}
                  <td className="px-2 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.credits > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.credits > 0
                        ? `Credits: ${user.credits}`
                        : "No Credits"}
                    </span>
                  </td>

                  {/* Registered Date */}
                  <td className="px-2 py-4 text-sm text-gray-800 truncate overflow-hidden whitespace-nowrap">
                    {formatDate(user?.createdAt) || "-"}
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        className="py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-md px-3 flex items-center gap-1"
                        onClick={() => {
                          if (!user?.mobile_number) {
                            toast.error("Mobile number not available!");
                            return;
                          }
                          setNumber(user?.mobile_number);
                          setStudentModalOpen(true);
                        }}
                      >
                        <CreateRoundedIcon /> Allocate
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(user._id);
                          setIsDeleteModal(true);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users?.users?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center px-4 py-4 text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {users?.users?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={users?.pagination?.totalPages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>
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
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete User"
          paragraphcontent={`Are you sure you want to delete User? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
      {isStudentModalOpen && (
        <AddStudentModal
          onClose={() => setStudentModalOpen(false)}
          number={number}
          onSubmit={() => setStudentModalOpen(false)}
        />
      )}
      {openModal && (
        <ExportFilterModal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false),
              fetchDownloadData(exportCurrentPage, itemsPerPage);
          }}
          dataType="USERS"
        />
      )}
    </div>
  );
};

export default Users;
