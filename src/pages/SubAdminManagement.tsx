import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import AdminModal from "../components/modal/Addadmin";
import { toast } from "react-toastify";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import {
  RESEND_INVITATION,
  GET_ALL_ADMINS,
  UPDATE_ADMIN,
  CREATE_ADMIN,
} from "../constants/ApiConstants";
import { Icons } from "../components/icons";
import ConformationModal from "../components/modal/ConformationModal";
import Pagination from "../components/Pagination";

const AdminManagement: React.FC = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [admins, setAdmins] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resendId, setResendId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };
  const [activetab, setActiveTab] = useState("ALL");
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const fetchData = async (currentPage, itemsPerPage) => {
    setLoading(true);
    try {
      let url = `${GET_ALL_ADMINS}?page=${currentPage}&limit=${itemsPerPage}`;
      if (activetab !== "ALL") {
        url += `&roles=${activetab}`;
      }
      await BackendService.Get(
        {
          url,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setAdmins(response);
            setTotalPages(calculateTotalPages(response?.count));
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
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, activetab]);

  const handleResendNotification = async (id: string) => {
    setResendId(id);
    try {
      const response = await BackendService.Post(
        {
          url: RESEND_INVITATION,
          data: { _id: id },
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Invitation sent successfully!");
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to resend invitation."
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setResendId(null);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await BackendService.Post(
        {
          url: UPDATE_ADMIN,
          data: { _id: deleteId, is_deleted: true },
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Admin deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to delete the admin."
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setDeleteId(null);
    }
  };

  const handleAdmin = async () => {
    try {
      const response = await BackendService.Post(
        {
          url: UPDATE_ADMIN,
          data: { _id: deleteId, is_deleted: true },
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Admin deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to delete the admin."
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setDeleteId(null);
    }
  };

  const handleAdminClose = () => {
    setModalOpen(false);
  };

  const handleSubmitClose = () => {
    setModalOpen(false);
    if (!editAdmin) {
      setCurrentPage(1);
      fetchData(1, itemsPerPage);
    } else {
      fetchData(currentPage, itemsPerPage);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col mb-4">
          <h2 className="text-xl font-bold">Role Management</h2>
          <div className="flex justify-between items-center mt-4">
            <div className="relative">
              <select
                value={activetab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none border-2 border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 cursor-pointer transition-all duration-200"
              >
                <option value="ALL">All</option>
                <option value="MENTOR">Mentor</option>
                <option value="OPERATIONS">Operator</option>
              </select>

              {/* Dropdown Arrow Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                ▼
              </div>
            </div>
            <button
              onClick={() => {
                setEditAdmin(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gray-900 text-white font-medium px-4 py-2 rounded"
            >
              <AddIcon fontSize="small" />
              Add Admin
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Icons.loading />
          </div>
        ) : admins?.admins?.length >= 1 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 border">First Name</th>
                  <th className="px-4 py-2 border">Last Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins?.admins?.map((admin) => (
                  <tr key={admin._id}>
                    <td className="px-4 py-2 border truncate max-w-[100px]">
                      {admin.first_name}
                    </td>
                    <td className="px-4 py-2 border truncate max-w-[100px]">
                      {admin.last_name}
                    </td>
                    <td className="px-4 py-2 border truncate max-w-[250px]">
                      {admin?.email}
                    </td>
                    <td className="px-4 py-2 border">
                      {admin.roles?.join(", ")}
                    </td>
                    <td className="px-2 py-2 border text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="w-[160px] py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1 justify-center"
                          onClick={() => handleResendNotification(admin?._id)}
                        >
                          {resendId === admin?._id ? (
                            <Icons.loading />
                          ) : (
                            <>
                              <ReplayRoundedIcon fontSize="small" />
                              Resend Invitation
                            </>
                          )}
                        </button>
                        <button
                          className="py-1 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center gap-1"
                          onClick={() => {
                            setEditAdmin(admin);
                            setModalOpen(true);
                          }}
                        >
                          <CreateRoundedIcon fontSize="small" /> Edit
                        </button>
                        <button
                          className="py-1 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                          onClick={() => {
                            setDeleteId(admin?._id);
                            setIsDeleteModal(true);
                          }}
                        >
                          <DeleteRoundedIcon fontSize="small" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <p>No admins Found</p>
          </div>
        )}
      </div>
      {admins?.admins?.length >= 1 && (
        <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
          <Pagination
            id={"type2"}
            currentPage={currentPage}
            totalPages={admins?.pagination?.totalPages}
            onPageChange={handlePageChange}
            displayRange={3}
          />
        </div>
      )}

      {modalOpen && (
        <AdminModal
          onClose={handleAdminClose}
          adminData={editAdmin}
          onSubmit={handleSubmitClose}
        />
      )}
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Admin"
          paragraphcontent={`Are you sure you want to delete Admin? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default AdminManagement;
