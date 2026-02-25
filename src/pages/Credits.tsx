import React, { useState, useEffect } from "react";
import CreditsModal from "../components/modal/CreditsModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../components/icons";
import { GET_ALL_CREDITS, DELETE_CREDIT } from "../constants/ApiConstants";
import ConformationModal from "../components/modal/ConformationModal";
import Pagination from "../components/Pagination";

const CreditsTable: React.FC = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [creditsData, setCreditsData] = useState<any>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [editingCredit, setEditingCredit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };


  const handleAdd = () => {
    setEditingCredit(null);
    setModalOpen(true);
  };

  const handleEdit = (credit) => {
    setEditingCredit(credit);
    setModalOpen(true);
  };

  const handleClose = () => {
    setEditingCredit(null);
    setCurrentPage(1);
    setModalOpen(false)
    fetchData(currentPage, itemsPerPage);
  };


  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async () => {
    try {
      const response = await BackendService.Delete(
        {
          url: `${DELETE_CREDIT}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Course deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to delete the Course."
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
          url: `${GET_ALL_CREDITS}?page=${currentPage}&limit=${itemsPerPage}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCreditsData(response);
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
      <div className="p-6 mx-auto bg-white rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Credits Management
          </h2>
          {/* <button
            className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium"
            onClick={handleAdd}
          >
            + Add Credits
          </button> */}
        </div>

        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3 text-left">Credits</th>
                <th className="p-3 text-left">Currency Type</th>
                <th className="p-3 text-left">Amount (₹)</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creditsData?.packages?.map((credit) => (
                <tr key={credit._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{credit?.no_of_credits}</td>
                  <td className="p-3">{credit?.currency}</td>
                  <td className="p-3">₹{credit?.cost}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button
                        className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleEdit(credit)}
                      >
                        <CreateRoundedIcon fontSize="small" /> Edit
                      </button>
                      {/* <button
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          setDeleteId(credit?.id);
                          setIsDeleteModal(true);
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" /> Delete
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {(!creditsData?.packages ||
                creditsData?.packages?.length === 0) &&
                !loading && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">
                      No credit entries found.
                    </td>
                  </tr>
                )}

              {/* Loading state */}
              {creditsData.lenght === 0 && loading && (
                <tr>
                  <td colSpan={3} className="p-6 text-center">
                    <div className="flex items-center justify-center h-[50px]">
                      <Icons.loading />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {modalOpen && (
          <CreditsModal
            onClose={handleClose}
            editing={editingCredit}
          />
        )}
        {isDeleteModal && (
          <ConformationModal
            isOpen={isDeleteModal}
            onClose={() => setIsDeleteModal(false)}
            onSubmit={handleDelete}
            content="Delete Credit"
            paragraphcontent={`Are you sure you want to delete Credit? This action cannot be undone.`}
            buttoncontent="Delete"
          />
        )}
      </div>
      {creditsData?.packages?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={calculateTotalPages(creditsData?.pagination?.total)}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
    </div>
  );
};

export default CreditsTable;
