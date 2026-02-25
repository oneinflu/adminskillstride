import React, { useState, useEffect } from "react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import { toast } from "react-toastify";
import { GET_ALL_ADS } from "../constants/ApiConstants";
import { useSelector } from "react-redux";
import Pagination from "../components/Pagination";
import { UPDATE_STATUS, DELETE_AD } from "../constants/ApiConstants";
import ConformationModal from "../components/modal/ConformationModal";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/RouteConstants";

interface Ad {
  id: number;
  title: string;
  position: string;
  startDate: string;
  endDate: string;
}

const Ads: React.FC = () => {
  const [ads, setAds] = useState<any>([]);
  const navigate = useNavigate();
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "", "ACTIVE", "IN-ACTIVE"
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeToggleId, setActiveToggleId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput); // update after delay
      setCurrentPage(1); // reset to page 1
    }, 500); // debounce delay (in ms)

    return () => clearTimeout(delay); // cleanup on each keypress
  }, [searchInput]);

  const fetchData = async (
    currentPage,
    itemsPerPage,
    searchQuery,
    statusFilter
  ) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
    });

    if (statusFilter === "ACTIVE" || statusFilter === "IN-ACTIVE") {
      params.append("status", statusFilter);
    }

    if (searchQuery) {
      params.append("search", searchQuery);
    }
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_ADS}?${params.toString()}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setAds(response);
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
    fetchData(currentPage, itemsPerPage, searchQuery, statusFilter);
  }, [currentPage, itemsPerPage, searchQuery, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleToggleActive = async (id, Status) => {
    setActiveToggleId(id);
    try {
      const response = BackendService.Post(
        {
          url: `${UPDATE_STATUS}`,
          data: {
            _id: id,
            status: Status,
          },
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Successfully updated Advertisement.");
            setActiveToggleId(null);
            fetchData(currentPage, itemsPerPage, searchQuery, statusFilter);
          },
          failure: () => {
            toast.error("Failed to update");
            setActiveToggleId(null);
            fetchData(currentPage, itemsPerPage, searchQuery, statusFilter);
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      setActiveToggleId(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleteModal(false);
    try {
      const response = BackendService.Delete(
        {
          url: `${DELETE_AD}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Succesfully Deleted Advertisement!");
            fetchData(currentPage, itemsPerPage, searchQuery, statusFilter);
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Ads Management</h1>
          <button
            onClick={() => {
              navigate(ROUTES.ADD_NEW_ADS);
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition"
          >
            + Add Ad
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
          />

          <div className="relative w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 pr-10 rounded-md text-sm text-gray-700 shadow-sm"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="IN-ACTIVE">Inactive</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded">
          <table className="min-w-full bg-white border border-gray-200 shadow-sm text-sm">
            <thead className="bg-gray-100 text-gray-600 font-semibold">
              <tr>
                <th className="px-4 py-3 border-b text-left w-[80px]">Image</th>
                <th className="px-4 py-3 border-b text-left min-w-[180px]">
                  Title
                </th>
                <th className="px-4 py-3 border-b text-left w-[100px]">
                  Position
                </th>
                <th className="px-4 py-3 border-b text-left w-[100px]">
                  Ad Type
                </th>
                <th className="px-4 py-3 border-b text-left w-[140px]">
                  Start Date
                </th>
                <th className="px-4 py-3 border-b text-left w-[140px]">
                  End Date
                </th>
                <th className="px-4 py-3 border-b text-left w-[100px]">
                  Status
                </th>
                <th className="px-4 py-3 border-b text-left w-[160px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ads?.ads?.length > 0 ? (
                ads.ads.map((ad, index) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border-b">
                      <img
                        src={ad?.type === "WEBSITE" ? ad?.thumbnail : ad.course_id?.image}
                        alt="Ad"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    </td>
                    <td
                      className="px-4 py-3 border-b max-w-[180px] truncate whitespace-nowrap overflow-hidden"
                    >
                      {ad?.type === "WEBSITE" ? ad?.type : ad.course_id?.name}
                    </td>
                    <td className="px-4 py-3 border-b">{ad.slot}</td>
                    <td className="px-4 py-3 border-b">{ad.type}</td>
                    <td className="px-4 py-3 border-b">
                      {formatDate(ad.start_date)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {formatDate(ad.end_date)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ad.status === "ACTIVE"}
                          onChange={() =>
                            handleToggleActive(
                              ad._id,
                              ad.status === "ACTIVE" ? "IN-ACTIVE" : "ACTIVE"
                            )
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 flex items-center rounded-full transition duration-300 ease-in-out ${
                            ad.status === "ACTIVE"
                              ? "bg-green-500"
                              : "bg-red-400"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                              ad.status === "ACTIVE"
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          />
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setDeleteId(ad._id);
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
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No ads available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {ads?.ads?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={ads?.pagination?.pages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Advertisement"
          paragraphcontent={`Are you sure you want to delete Advertisement? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default Ads;
