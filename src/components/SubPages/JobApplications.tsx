import React, { useState, useEffect } from "react";
import { BackendService } from "../../Utils/Backend";
import {
  GET_JOB_BY_ID,
  GET_APPLIED_LIST_BY_JOBID,
} from "../../constants/ApiConstants";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/RouteConstants";
import Pagination from "../Pagination";
import ApplicationsModal from "../modal/ApplicationsModal";

const TABS = ["Applications"];

const JobApplications: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [activeTab, setActiveTab] = useState("Applications");
  const [tabData, setTabData] = useState<any>(null);

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_JOB_BY_ID}/${id}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setJob(response?.job);
            setLoading(false);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
            setLoading(false);
          },
        }
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again"
      );
      setLoading(false);
    }
  };

  const fetchTabData = async (tab: string) => {
    try {
      await BackendService.Get(
        {
          url: `${GET_APPLIED_LIST_BY_JOBID}/${id}?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
          accessToken: admintoken,
        },
        {
          success: (res) => setTabData(res),
          failure: async (res) => toast.error(res?.response?.data?.message),
        }
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error fetching tab data");
    }
  };

  const handleEdit = (data) => {
    setEditing(data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  useEffect(() => {
    if (id) fetchTabData(activeTab);
  }, [activeTab, id, currentPage, itemsPerPage, searchQuery]);

  // const handleClose = () => {
  //   setIsModalOpen(false);
  //   setCurrentPage(1);
  //   fetchTabData(activeTab);
  // };

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput); // update after delay
      setCurrentPage(1); // reset to page 1
    }, 500); // debounce delay (in ms)

    return () => clearTimeout(delay); // cleanup on each keypress
  }, [searchInput]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Details</h1>
        <button
          onClick={() => navigate(ROUTES.JOBS)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back
        </button>
      </div>
      {/* Course Summary */}
      {job && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-start gap-6">
            <div>
              {/* Job Title */}
              <h1 className="text-2xl font-bold mb-2">{job?.title}</h1>

              {/* Job Description */}
              <p className="text-gray-700 mb-1">{job?.description}</p>

              {/* Salary */}
              <p className="text-gray-700 mb-1">
                Salary: ₹{job?.salary?.min?.toLocaleString()} - ₹
                {job?.salary?.max?.toLocaleString()}
              </p>

              {/* Job Type & Work Mode */}
              <p className="text-gray-700 mb-1">
                Type: {job?.type} | Mode: {job?.work_mode}
              </p>

              {/* Experience Level */}
              <p className="text-gray-700 mb-1">
                Experience: {job?.experience_level?.min} -{" "}
                {job?.experience_level?.max} years
              </p>

              {/* Job Category */}
              <p className="text-gray-700 mb-1 flex items-center gap-2">
                {job?.job_category?.icon && (
                  <img
                    src={job?.job_category?.icon}
                    alt={job?.job_category?.name}
                    className="w-5 h-5 object-cover"
                  />
                )}
                Job Category: {job?.job_category?.name}
              </p>
              {/* City */}
              <p className="text-gray-700 mb-1">Location: {job?.city?.name}</p>

              {/* Applications */}
              <p className="text-gray-600 mb-1">
                📩 Applications: {job?.applications_count}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setCurrentPage(1), setActiveTab(tab);
            }}
            className={`px-4 py-2 -mb-px font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lessions Data */}
      {activeTab === "Applications" && !loading && (
        <div className="max-w-6xl mx-auto bg-white p-2 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
            />
          </div>
          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">Profile</th>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Applied On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabData?.data?.map((application) => (
                  <tr
                    key={application._id}
                    className="hover:bg-gray-50 border-t"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={application?.applicant?.profile}
                        alt={application?.applicant?.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {application?.applicant?.name}
                    </td>
                    <td className="px-4 py-3 max-w-[150px] truncate">
                      {application?.applicant?.email}
                    </td>
                    <td className="px-4 py-3">
                      {application?.applicant?.mobile_number}
                    </td>
                    <td className="px-4 py-3">{application?.job?.title}</td>
                    <td className="px-4 py-3">
                      {new Date(application?.applied_on).toLocaleDateString(
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
                    <td className="px-4 py-3 text-right flex gap-2 justify-end">
                      <a
                        href={application?.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        View Resume
                      </a>
                      {/* <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                        onClick={() => handleEdit(application)}
                      >
                        Update Status
                      </button> */}
                    </td>
                  </tr>
                ))}

                {tabData?.data?.length === 0 && (
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

            <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
              <Pagination
                id={"type2"}
                currentPage={currentPage}
                totalPages={tabData?.pagination?.totalPages}
                onPageChange={handlePageChange}
                displayRange={3}
              />
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <ApplicationsModal
          onClose={() => {setIsModalOpen(false), fetchTabData(activeTab)}}
          editing={editing}
        />
      )}
    </div>
  );
};

export default JobApplications;
