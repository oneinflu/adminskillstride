import React, { useState, useEffect } from "react";
import CategoryModal from "../components/modal/AddModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import { toast } from "react-toastify";
import ConformationModal from "../components/modal/ConformationModal";
import { useSelector } from "react-redux";
import {
  GET_ALL_JOB_CATEGORIES,
  DELETE_JOB_CATEGORY,
} from "../constants/ApiConstants";
import { Icons } from "../components/icons";
import Pagination from "../components/Pagination";

const JobCategories: React.FC = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [categories, setCategories] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };
  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSubmitClose = () => {
    setShowModal(false);
    if (!editingCategory) {
      setCurrentPage(1);
      fetchData(1, itemsPerPage);
    } else {
      fetchData(currentPage, itemsPerPage);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await BackendService.Delete(
        {
          url: `${DELETE_JOB_CATEGORY}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Job deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to delete the job."
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
          url: `${GET_ALL_JOB_CATEGORIES}?page=${currentPage}&limit=${itemsPerPage}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCategories(response);
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

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg pb-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Job Categories</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition outline-none"
          >
            + Add Category
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
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 border-b w-8/12">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 border-b w-3/12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories?.jobCategories?.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 border-b font-medium text-gray-800 max-w-[600px] truncate">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 border-b text-right w-3/12">
                      <div className="inline-flex space-x-2">
                        <button
                          className="py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-md px-9 flex items-center gap-1"
                          onClick={() => handleEdit(cat)}
                        >
                          <CreateRoundedIcon /> Edit
                        </button>
                        <button
                          className="px-9 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                          onClick={() => {
                            setDeleteId(cat?._id);
                            setIsDeleteModal(true);
                          }}
                        >
                          <DeleteRoundedIcon /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories?.jobCategories?.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center px-6 py-4 text-gray-500"
                    >
                      No Job categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {categories?.jobCategories?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={categories?.pagination?.totalPages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>

      {showModal && (
        <CategoryModal
          onClose={handleClose}
          editing={editingCategory}
          type="job category"
          onSubmit={handleSubmitClose}
        />
      )}
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Job Category"
          paragraphcontent={`Are you sure you want to delete Job Category? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default JobCategories;
