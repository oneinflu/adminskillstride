import React, { useState, useEffect } from "react";
import OrganizationModal from "../components/modal/OrganizationModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import {
  DELETE_ORGANIZATION,
  GET_ALL_ORGANIZATIONS,
} from "../constants/ApiConstants";
import { toast } from "react-toastify";
import ConformationModal from "../components/modal/ConformationModal";
import { Icons } from "../components/icons";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/RouteConstants";

const Organizations: React.FC = () => {
  const navigate = useNavigate();
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [organizations, setOrganization] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };

  const handleEdit = (org) => {
    setEditingOrganization(org);
    setShowModal(true);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput); // update after delay
      setCurrentPage(1); // reset to page 1
    }, 500); // debounce delay (in ms)

    return () => clearTimeout(delay); // cleanup on each keypress
  }, [searchInput]);
  const handleDelete = async () => {
    try {
      const response = await BackendService.Delete(
        {
          url: `${DELETE_ORGANIZATION}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Organization deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage, searchQuery);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to delete the Organization."
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

  const fetchData = async (currentPage, itemsPerPage, searchQuery) => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_ORGANIZATIONS}?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setOrganization(response);
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
    fetchData(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleCityClose = () => {
    setShowModal(false);
  };

  const handleSubmitClose = () => {
    setShowModal(false);
    if (!editingOrganization) {
      setCurrentPage(1);
      fetchData(1, itemsPerPage, searchQuery);
    } else {
      fetchData(currentPage, itemsPerPage, searchQuery);
    }
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg pb-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Organizations</h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
            />
            <button
              onClick={() => {
                setEditingOrganization(null);
                setShowModal(true);
              }}
              className="bg-gray-900 text-white px-4 py-2 rounded-md transition outline-none"
            >
              + Add Organization
            </button>
          </div>

        <div className="overflow-x-auto rounded">
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Icons.loading />
            </div>
          ) : (
            <table className="min-w-full bg-white border border-gray-200 shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 border-b w-4/12">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 border-b w-4/12">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 border-b w-2/12">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 border-b w-3/12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizations?.data?.length > 0 ? (
                  organizations?.data?.map((org) => (
                    <tr key={org._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 border-b font-medium text-gray-800 w-4/12 truncate">
                        {org.name}
                      </td>
                      <td className="px-6 py-4 border-b font-medium text-gray-800 w-4/12 truncate">
                        {org.email}
                      </td>
                      <td className="px-6 py-4 border-b font-medium text-gray-800 w-2/12">
                      <span
                      className={`px-2 py-1 rounded text-md ${
                        org.status === "ACTIVE"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600" 
                      }`}
                    >
                      {org.status}
                    </span>
                      </td>
                      <td className="px-6 py-4 border-b text-right w-3/12">
                        <div className="inline-flex space-x-2">
                          <button
                            className="h-9 w-9 rounded-lg border-[1px] flex justify-center items-center cursor-pointer"
                            onClick={() =>
                              navigate(
                                `${ROUTES.ORGANIZATION_DETAILS}?id=${org?._id}&page=${currentPage}`
                              )
                            }
                          >
                            <RemoveRedEyeOutlinedIcon
                              style={{ fontSize: "16px" }}
                            />
                          </button>
                          <button
                            className="py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-md px-9 flex items-center gap-1"
                            onClick={() => handleEdit(org)}
                          >
                            <CreateRoundedIcon /> Edit
                          </button>
                          <button
                            className="px-9 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                            onClick={() => {
                              setDeleteId(org?._id);
                              setIsDeleteModal(true);
                            }}
                          >
                            <DeleteRoundedIcon /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-6 py-4 text-gray-500"
                    >
                      No Organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {organizations?.data?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={organizations?.pagination?.totalPages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>

      {showModal && (
        <OrganizationModal
          onClose={handleCityClose}
          editing={editingOrganization}
          onSubmit={handleSubmitClose}
        />
      )}
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Organization"
          paragraphcontent={`Are you sure you want to delete Organization? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default Organizations;
