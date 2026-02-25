import { useState, useEffect } from "react";
import Pagination from "../components/Pagination";
import { BackendService } from "../Utils/Backend";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  GET_ALL_APPLICATIONS,
  GET_ALL_JOB_CATEGORIES,
  GET_ALL_COMPANIES,
  DELETE_EXPORT_FILE,
  GET_ALL_EXPORTS,
} from "../constants/ApiConstants";
import ApplicationsModal from "../components/modal/ApplicationsModal";
import Select from "react-select";
import ExportFilterModal from "../components/modal/ExportDataModal";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

const Applications = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [exportCurrentPage, setExportCurrentPage] = useState(1);
  const [downloadData, setDownloadData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState<any>([]);
  const [applications, setApplications] = useState<any>([]);
  const [editing, setEditing] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [experience, setExperience] = useState("");
  const [jobType, setjobType] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedApplications, setSelectedApplications] = useState<any[]>([]);

  const handleCheckbox = (app) => {
    setSelectedApplications((prev) => {
      const exists = prev.some((p) => p._id === app._id);
      return exists ? prev.filter((p) => p._id !== app._id) : [...prev, app];
    });
  };

  useEffect(() => {
    fetchDownloadData(exportCurrentPage, itemsPerPage);
  }, []);

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

  const fetchDownloadData = async (exportCurrentPage, itemsPerPage) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(exportCurrentPage),
      limit: String(itemsPerPage),
    });
    params.append("type", "APPLICATIONS");
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

    fetchCompanies();
  }, [admintoken, searchText]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (data) => {
    setEditing(data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput);
      if (searchInput.trim() !== "") {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);

  const fetchData = async (
    currentPage,
    itemsPerPage,
    searchQuery,
    status,
    sort,
    selectedCategory,
    selectedCompany,
    workMode,
    experience,
    jobType
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (selectedCompany) params.append("companyId", selectedCompany);
      if (workMode) params.append("work_modes", workMode);
      if (experience) params.append("experience_levels", experience);
      if (jobType) params.append("job_types", jobType);

      await BackendService.Get(
        {
          url: `${GET_ALL_APPLICATIONS}?${params.toString()}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setApplications(response);
            setLoading(false);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error("something went wrong. please try again");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(
      currentPage,
      itemsPerPage,
      searchQuery,
      status,
      sort,
      selectedCategory,
      selectedCompany,
      workMode,
      experience,
      jobType
    );
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    status,
    sort,
    selectedCategory,
    selectedCompany,
    workMode,
    experience,
    jobType,
  ]);

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

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        {/* Filters */}
        <div className="gap-4 mb-6 grid grid-cols-4 items-center">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Search</label>
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Application Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">All</option>
              <option value="APPLIED">Applied</option>
              <option value="REVOKED">Revoked</option>
              <option value="REJECTED">Rejected</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="PLACED">Placed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Working Model</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All</option>
              <option value="REMOTE">Remote</option>
              <option value="ON-SITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setjobType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All</option>
              <option value="FULL-TIME">Full-time</option>
              <option value="PART-TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FRESHER">Fresher</option>
              <option value="MID_SENIOR">Mid Senior</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Job Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Category</option>
              {categories?.jobCategories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Sort By</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">All</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
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
            onChange={(option) => setSelectedCompany(option?.value)}
            value={
              selectedCompany
                ? {
                    value: selectedCompany,
                    label:
                      filteredCompanies.find((c) => c._id === selectedCompany)
                        ?.company_name || "Selected",
                  }
                : null
            }
            placeholder="Search and select a company..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-4 items-center justify-end">
          <div className="flex gap-4">
            <button
              onClick={() => setOpenModal(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-md transition"
            >
              Export Data
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setSelectedCategory(""),
                  setCurrentPage(1),
                  setSelectedCompany(""),
                  setStatus(""),
                  setSort("newest"),
                  setSearchInput("");
              }}
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedApplications(
                          applications?.applications || []
                        );
                      else setSelectedApplications([]);
                    }}
                    checked={
                      selectedApplications.length ===
                        applications?.applications?.length &&
                      selectedApplications.length > 0
                    }
                  />
                </th>
                <th className="px-4 py-3 text-center">Applicant Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Job Title</th>
                <th className="px-4 py-3 text-center">Company Name</th>
                <th className="px-4 py-3 text-center">Applied On</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications?.applications?.map((application) => (
                <tr key={application._id} className="hover:bg-gray-50 border-t">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedApplications.some(
                        (a) => a._id === application._id
                      )}
                      onChange={() => handleCheckbox(application)}
                    />
                  </td>
                  <td className="px-4 py-3 max-w-[110px] break-words">
                    {application?.name}
                  </td>
                  <td className="px-4 py-3 max-w-[110px] break-words">
                    {application?.email}
                  </td>
                  <td className="px-4 py-3 max-w-[110px] break-words">
                    {application?.mobile}
                  </td>
                  <td className="px-4 py-3 max-w-[110px] break-words">
                    {application?.jobTitle}
                  </td>
                  <td className="px-4 py-3 max-w-[110px] break-words">
                    {application?.companyName}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(application?.appliedOn).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        application?.status === "APPLIED"
                          ? "bg-blue-100 text-blue-700"
                          : application?.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {application?.status}
                    </span>
                  </td>
                  <td>
                    <div className="px-4 py-3 text-right flex gap-2 justify-end items-center">
                      <a
                        href={application?.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm text-center"
                      >
                        View Resume
                      </a>
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm text-center"
                        onClick={() => handleEdit(application)}
                      >
                        Update Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {applications?.applications?.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No Applications available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {applications?.applications?.length >= 1 && (
            <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
              <Pagination
                id={"type2"}
                currentPage={currentPage}
                totalPages={applications?.pagination?.totalPages}
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
      </div>

      {isModalOpen && (
        <ApplicationsModal
          onClose={() => {
            setIsModalOpen(false);
            fetchData(
              currentPage,
              itemsPerPage,
              searchQuery,
              status,
              sort,
              selectedCategory,
              selectedCompany,
              workMode,
              experience,
              jobType
            );
          }}
          editing={editing}
        />
      )}
      {openModal && (
        <ExportFilterModal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false),
              fetchDownloadData(exportCurrentPage, itemsPerPage);
          }}
          dataType="APPLICATIONS"
        />
      )}
    </div>
  );
};

export default Applications;
