import React, { useState, useEffect } from "react";
import AddModal from "../components/modal/AddModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import { DELETE_CITY, GET_ALL_CITIES } from "../constants/ApiConstants";
import { toast } from "react-toastify";
import ConformationModal from "../components/modal/ConformationModal";
import { Icons } from "../components/icons";
import Pagination from "../components/Pagination";

const Cities: React.FC = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [cities, setCities] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await BackendService.Delete(
        {
          url: `${DELETE_CITY}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("City deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to delete the city."
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
          url: `${GET_ALL_CITIES}?page=${currentPage}&limit=${itemsPerPage}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCities(response);
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

  const handleCityClose = () => {
    setShowModal(false);
  };

  const handleSubmitClose = () => {
    setShowModal(false);
    if (!editingCity) {
      setCurrentPage(1);
      fetchData(1, itemsPerPage);
    } else {
      fetchData(currentPage, itemsPerPage);
    }
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg pb-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Cities</h1>
          <button
            onClick={() => {
              setEditingCity(null);
              setShowModal(true);
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition outline-none"
          >
            + Add City
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
                {cities?.cities?.length > 0 ? (
                  cities?.cities?.map((city, index) => (
                    <tr key={city.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 border-b font-medium text-gray-800 w-8/12">
                        {city.name}
                      </td>
                      <td className="px-6 py-4 border-b text-right w-3/12">
                        <div className="inline-flex space-x-2">
                          <button
                            className="py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-md px-9 flex items-center gap-1"
                            onClick={() => handleEdit(city)}
                          >
                            <CreateRoundedIcon /> Edit
                          </button>
                          <button
                            className="px-9 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                            onClick={() => {
                              setDeleteId(city?._id);
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
                      colSpan={3}
                      className="text-center px-6 py-4 text-gray-500"
                    >
                      No cities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {cities?.cities?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={cities?.pagination?.totalPages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>

      {showModal && (
        <AddModal
          onClose={handleCityClose}
          editing={editingCity}
          type="city"
          onSubmit={handleSubmitClose}
        />
      )}
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete City"
          paragraphcontent={`Are you sure you want to delete City? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default Cities;
