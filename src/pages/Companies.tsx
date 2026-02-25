import React, { useState, useEffect } from "react";
import CategoryModal from "../components/modal/AddModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { toast } from "react-toastify";
import { BackendService } from "../Utils/Backend";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import {
  DELETE_JOB_CATEGORY,
  GET_ALL_COMPANIES,
  RESEND_INVITATION_FOR_COMPANY,
  UPDATE_COMPANY,
} from "../constants/ApiConstants";
import { useSelector } from "react-redux";
import ConformationModal from "../components/modal/ConformationModal";
import Pagination from "../components/Pagination";
import { Icons } from "../components/icons";
import CompanyModal from "../components/modal/CompanyModal";

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<any>();
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [resendId, setResendId] = useState(null);

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowModal(true);
  };
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async () => {
    try {
      const response = await BackendService.Post(
        {
          url: `${UPDATE_COMPANY}`,
          data: {
            _id: deleteId,
            is_deleted: true,
          },
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Company deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to delete the Company."
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

  const fetchData = async (currentPage, itemsPerPage) => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_COMPANIES}?page=${currentPage}&limit=${itemsPerPage}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCompanies(response);
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
  }, [currentPage, itemsPerPage]);

  const handleToggleBlock = async (company) => {
    const newStatus = company.status === "block" ? "active" : "block";

    try {
      const response = await BackendService.Post(
        {
          url: `/api/company-status/${company._id}`, // <-- Update with actual endpoint
          data: { status: newStatus },
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success(
              `Company ${
                newStatus === "block" ? "blocked" : "unblocked"
              } successfully!`
            );
            fetchData(currentPage, itemsPerPage);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to update status."
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    }
  };

  const handleResendNotification = async (id: string) => {
    setResendId(id);
    try {
      const response = await BackendService.Post(
        {
          url: RESEND_INVITATION_FOR_COMPANY,
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

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
          <button
            onClick={() => {
              setEditingCompany(null);
              setShowModal(true);
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition outline-none"
          >
            + Add Company
          </button>
        </div>

        <div className="overflow-x-auto rounded">
          <table className="min-w-full bg-white border border-gray-200 shadow-sm table-fixed">
            <thead className="bg-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold text-left w-2/12">
                  Company Name
                </th>
                <th className="px-4 py-3 font-semibold text-left w-2/12">
                  Authorized Person
                </th>
                <th className="px-4 py-3 font-semibold text-left w-2/12">
                  Phone Number
                </th>
                <th className="px-4 py-3 font-semibold text-left w-1/12">
                  Type
                </th>
                <th className="px-4 py-3 font-semibold text-left w-1/12">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-center w-4/12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {companies?.companies?.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 border-b w-2/12 truncate max-w-[120px]">
                    {comp?.company_name}
                  </td>
                  <td className="px-4 py-3 border-b w-2/12">
                    {comp?.authorized_person}
                  </td>
                  <td className="px-4 py-3 border-b w-2/12">
                    {comp?.country_code} {comp?.phone_number}
                  </td>
                  <td className="px-4 py-3 border-b w-1/12">{comp?.type}</td>
                  <td className="px-4 py-3 border-b capitalize w-1/12">
                    {comp?.status}
                  </td>
                  <td className="px-4 py-3 border-b w-4/12">
                    <div className="flex  gap-2 justify-center">
                      <button
                        className="w-[160px] py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1 justify-center"
                        onClick={() => handleResendNotification(comp?._id)}
                      >
                        {resendId === comp?._id ? (
                          <Icons.loading />
                        ) : (
                          <>
                            <ReplayRoundedIcon fontSize="small" />
                            Resend Invitation
                          </>
                        )}
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => handleEdit(comp)}
                      >
                        <CreateRoundedIcon fontSize="small" /> Edit
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => {
                          setDeleteId(comp?._id);
                          setIsDeleteModal(true);
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies?.companies?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center px-4 py-4 text-gray-500"
                  >
                    No companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {companies?.companies?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>

      {showModal && (
        <CompanyModal
          onClose={() => {
            setShowModal(false);
          }}
          editing={editingCompany}
          onSubmit={() => {
            setShowModal(false);
            if (!editingCompany) {
              setCurrentPage(1)
              fetchData(currentPage, itemsPerPage);
            } else {
              setEditingCompany(null);
              fetchData(currentPage, itemsPerPage);
            }
          }}
        />
      )}

      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Company"
          paragraphcontent={`Are you sure you want to delete Company? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default Companies;
