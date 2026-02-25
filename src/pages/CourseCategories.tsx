import React, { useState, useEffect } from "react";
import CategoryModal from "../components/modal/AddModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import {
  GET_ALL_COURSE_CATEGORIES,
  DELETE_COURSE_CATEGORY,
} from "../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../components/icons";
import ConformationModal from "../components/modal/ConformationModal";
import Pagination from "../components/Pagination";

const Categories: React.FC = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [categories, setCategories] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput); // update after delay
      setCurrentPage(1); // reset to page 1
    }, 500); // debounce delay (in ms)

    return () => clearTimeout(delay); // cleanup on each keypress
  }, [searchInput]);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const fetchData = async (currentPage, itemsPerPage, searchQuery) => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_COURSE_CATEGORIES}?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
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
    fetchData(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleDelete = async () => {
    try {
      const response = await BackendService.Delete(
        {
          url: `${DELETE_COURSE_CATEGORY}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Course Category deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage, searchQuery);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to delete the Course Category."
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

  const handleClose = () => {
    setShowModal(false);
    fetchData(currentPage, itemsPerPage, searchQuery);
  };

  const handleSubmitClose = () => {
    setShowModal(false);
    if (!editingCategory) {
      setCurrentPage(1);
      fetchData(1, itemsPerPage, searchQuery);
    } else {
      fetchData(currentPage, itemsPerPage, searchQuery);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Course Categories
          </h1>
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
          />
        </div>

        <div className="overflow-x-auto rounded">
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
              {categories?.courseCategories?.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 border-b font-medium text-gray-800 w-8/12 truncate max-w-[500px]">
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
              {categories?.courseCategories?.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
              {categories?.courseCategories?.length === 0 && loading && (
                <div className="h-[200px] flex items-center justify-center">
                  <Icons.loading />
                </div>
              )}
            </tbody>
          </table>
        </div>
        {categories?.courseCategories?.length >= 1 && (
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
          onSubmit={handleSubmitClose}
          type="course category"
        />
      )}
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Category"
          paragraphcontent={`Are you sure you want to delete Category? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default Categories;
