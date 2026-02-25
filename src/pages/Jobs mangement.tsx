import React, { useState, useEffect } from "react";
import JobModal from "../components/modal/JobModal";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  GET_ALL_JOBS,
  GET_ALL_CITIES,
  GET_ALL_JOB_CATEGORIES,
  DELETE_JOB,
  UPDATE_JOB_STATUS,
  GET_ALL_COMPANIES,
} from "../constants/ApiConstants";
import Select from "react-select";
import Pagination from "../components/Pagination";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ConformationModal from "../components/modal/ConformationModal";
import { Icons } from "../components/icons";
import { ROUTES } from "../constants/RouteConstants";
import { useNavigate } from "react-router-dom";

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any>([]);
  const [locations, setLocations] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [editJobData, setEditJobData] = useState<any>([]);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeToggleId, setActiveToggleId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );

  const [filters, setFilters] = useState({
    job_category_id: "",
    job_types: "",
    city_id: "",
    work_modes: "",
    experience_levels: "",
    sort_by: "MOST_RELEVANT",
    search: "",
    company_id: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch jobs
  const fetchData = async (currentPage, itemsPerPage, filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.job_category_id && {
          job_category_id: filters.job_category_id,
        }),
        ...(filters.job_types && { job_types: filters.job_types }),
        ...(filters.city_id && { city_id: filters.city_id }),
        ...(filters.work_modes && { work_modes: filters.work_modes }),
        ...(filters.experience_levels && {
          experience_levels: filters.experience_levels,
        }),
        ...(filters.sort_by && { sort_by: filters.sort_by }),
        ...(filters.search && { search: filters.search }),
        ...(filters.company_id && { company_id: filters.company_id }),
        ...(filters.status && { status: filters.status }),
      }).toString();

      await BackendService.Get(
        {
          url: `${GET_ALL_JOBS}?${queryParams}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setJobs(response);
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

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_COMPANIES}?page=1&limit=30&search=${searchText}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setFilteredCompanies(response?.companies || []);
            setLoadingCompanies(false);
          },
          failure: () => {
            toast.error("Failed to load companies");
            setLoadingCompanies(false);
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong while loading companies");
      setLoadingCompanies(false);
    }
  };

  // 🔹 Fetch Locations
  const fetchLocations = async (query = "") => {
    try {
      const queryParams = query ? `?search=${query}` : "";
      await BackendService.Get(
        {
          url: `${GET_ALL_CITIES}${queryParams}?page=1&limit=50`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setLocations(response || []);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to load locations");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await BackendService.Delete(
        {
          url: `${DELETE_JOB}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Job deleted successfully!");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchData(currentPage, itemsPerPage, filters);
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

  const fetchCategories = async (query = "") => {
    try {
      const queryParams = query ? `?search=${query}` : "";
      await BackendService.Get(
        {
          url: `${GET_ALL_JOB_CATEGORIES}${queryParams}?page=1&limit=50`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCategories(response || []);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleToggleActive = async (id) => {
    setActiveToggleId(id);
    try {
      const response = BackendService.Patch(
        {
          url: `${UPDATE_JOB_STATUS}/${id}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (response) => {
            toast.success(
              response?.message || "Successfully updated job status"
            );
            setActiveToggleId(null);
            fetchData(currentPage, itemsPerPage, filters);
          },
          failure: () => {
            toast.error("Failed to update");
            setActiveToggleId(null);
            fetchData(currentPage, itemsPerPage, filters);
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      setActiveToggleId(null);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput, // only update search field
      }));
      setCurrentPage(1); // reset to page 1
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [currentPage, itemsPerPage]);
  useEffect(() => {
    setCurrentPage(1);
    fetchData(currentPage, itemsPerPage, filters);
  }, [filters]);

  useEffect(() => {
    fetchLocations();
    fetchCategories();
    fetchCompanies();
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Job Management</h1>
          <button
            onClick={() => {
              setEditJobData(null), setShowModal(true);
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition"
          >
            + Add Job
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {/* 🔹 Category dropdown */}
          <select
            value={filters.job_category_id}
            onChange={(e) =>
              setFilters({ ...filters, job_category_id: e.target.value })
            }
            className="border rounded px-3 py-2"
          >
            <option value="">Category</option>
            {categories?.jobCategories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* 🔹 Job Type */}
          <select
            value={filters.job_types}
            onChange={(e) =>
              setFilters({ ...filters, job_types: e.target.value })
            }
            className="border rounded px-3 py-2"
          >
            <option value="">Job Type</option>
            <option value="FULL-TIME">Full-time</option>
            <option value="PART-TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="FREELANCE">Freelance</option>
          </select>

          {/* 🔹 Location dropdown with search */}
          <select
            value={filters.city_id}
            onChange={(e) =>
              setFilters({ ...filters, city_id: e.target.value })
            }
            className="border rounded px-3 py-2"
          >
            <option value="">Location</option>
            {locations?.cities?.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* 🔹 Work model */}
          <select
            value={filters.work_modes}
            onChange={(e) =>
              setFilters({ ...filters, work_modes: e.target.value })
            }
            className="border rounded px-3 py-2"
          >
            <option value="">Working Model</option>
            <option value="REMOTE">Remote</option>
            <option value="ON-SITE">Onsite</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          {/* 🔹 Experience */}
          <select
            value={filters.experience_levels}
            onChange={(e) =>
              setFilters({ ...filters, experience_levels: e.target.value })
            }
            className="border rounded px-3 py-2"
          >
            <option value="">Experience Level</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FRESHER">Fresher</option>
            <option value="MID_SENIOR">Mid Senior</option>
          </select>

          {/* 🔹 Sort */}
          <select
            value={filters.sort_by}
            onChange={(e) =>
              setFilters({ ...filters, sort_by: e.target.value })
            }
            className="border rounded px-3 py-2"
          >
            <option value="MOST_RECENT">Most Recent</option>
            <option value="PAST_WEEK">Past Week</option>
            <option value="PAST_MONTH">Past Month</option>
            <option value="MOST_RELEVANT">Most Relevant</option>
          </select>

          {/* 🔹 Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">In Active</option>
          </select>

          {/* 🔹 Search bar */}
          <input
            type="text"
            placeholder="Search job title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label>Company</label>
          <Select
            isLoading={loadingCompanies}
            options={filteredCompanies.map((c) => ({
              value: c._id,
              label: c.company_name,
            }))}
            onInputChange={(val) => setSearchText(val)}
            onChange={(e) => setFilters({ ...filters, company_id: e.value })}
            value={
              filters.company_id
                ? {
                    value: filters.company_id,
                    label:
                      filteredCompanies.find(
                        (c) => c._id === filters.company_id
                      )?.company_name || "Selected",
                  }
                : null
            }
            placeholder="Search and select a company..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-4 items-center justify-end">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setCurrentPage(1),
              setSearchInput(''),
                setFilters({
                  job_category_id: "",
                  job_types: "",
                  city_id: "",
                  work_modes: "",
                  experience_levels: "",
                  sort_by: "MOST_RELEVANT",
                  search: "",
                  company_id: "",
                  status: "",
                });
            }}
          >
            Clear filters
          </button>
        </div>

        {/* Job Table */}
        <div className="overflow-x-auto rounded">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Icons.loading />
            </div>
          ) : jobs?.jobs?.length > 0 ? (
            <table className="w-full table-fixed bg-white border border-gray-200 shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 w-[100px]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 w-[100px]">
                    Job Type
                  </th>
                  <th className="px-4 py-3 text-gray-600 w-[100px] text-center">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 w-[100px]">
                    Location
                  </th>
                  <th className="px-2 py-3 text-center text-gray-600 w-[60px] break-words">
                    Experience
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 w-[80px]">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 w-[80px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-gray-600 w-[200px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs?.jobs?.map((job) => (
                  <tr key={job?._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 max-w-[110px] break-words">
                      {job?.title}
                    </td>
                    <td className="px-4 py-2 break-words">{job?.type}</td>
                    <td className="px-4 py-2 break-words">
                      {job?.company?.company_name}
                    </td>
                    <td className="px-4 py-2 break-words">{job?.city?.name}</td>
                    <td className="px-4 py-2 break-words">
                      {job?.experience_level?.min}-{job.experience_level?.max}
                    </td>
                    <td className="px-2 py-2 break-words">{job?.work_mode}</td>
                    <td className="px-2 py-3 w-[80px]">
                      <label className="">
                        <input
                          type="checkbox"
                          checked={job?.status === "ACTIVE"}
                          onChange={() => handleToggleActive(job?._id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 flex items-center rounded-full transition duration-300 ease-in-out ${
                            job?.status === "ACTIVE"
                              ? "bg-green-500"
                              : "bg-red-400"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                              job?.status === "ACTIVE"
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          />
                        </div>
                      </label>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        <button
                          className="h-9 w-9 rounded-lg border-[1px] flex justify-center items-center cursor-pointer"
                          onClick={() =>
                            navigate(
                              `${ROUTES.JOB_APPLICATIONS}?id=${job?._id}`
                            )
                          }
                        >
                          <RemoveRedEyeOutlinedIcon
                            style={{ fontSize: "16px" }}
                          />
                        </button>
                        <button
                          className="bg-yellow-500 px-3 py-1 rounded text-white text-sm hover:bg-yellow-600 flex items-center gap-1"
                          onClick={() => {
                            setEditJobData(job), setShowModal(true);
                          }}
                        >
                          <CreateRoundedIcon /> Edit
                        </button>
                        <button
                          className="bg-red-500 px-3 py-1 rounded text-white text-sm hover:bg-red-600 flex items-center gap-1"
                          onClick={() => {
                            setDeleteId(job?._id);
                            setIsDeleteModal(true);
                          }}
                        >
                          <DeleteRoundedIcon /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-gray-500">No jobs found</div>
          )}
        </div>

        {jobs?.jobs?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={jobs?.pagination?.totalPages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>
      {showModal && (
        <JobModal
          onClose={() => {
            setEditJobData(null), setShowModal(false);
          }}
          editingData={editJobData}
          onSubmit={() => {
            setShowModal(false);
            if (!editJobData) {
              setCurrentPage(1);
              fetchData(currentPage, itemsPerPage, filters);
            } else {
              setEditJobData(null),
                fetchData(currentPage, itemsPerPage, filters);
            }
          }}
        />
      )}
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Job"
          paragraphcontent={`Are you sure you want to delete Job? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default Jobs;
