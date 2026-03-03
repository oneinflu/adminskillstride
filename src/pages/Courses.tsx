import React, { useState, useEffect } from "react";
import CourseModal from "../components/modal/CourseModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import {
  GET_ALL_COURSES,
  DELETE_COURSE,
  PUBLISH_COURSE,
  UPDATE_COURSE_STATUS,
  UPDATE_COURSE,
} from "../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";
import ConformationModal from "../components/modal/ConformationModal";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/RouteConstants";
import { Icons } from "../components/icons";

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const page = params.get("page");
  const [courses, setCourses] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeToggleId, setActiveToggleId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isPublishModal, setIsPublishModal] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [publishId, setPublishId] = useState(null);
  const [publishAction, setPublishAction] = useState("");
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const itemsPerPage = 6;
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput);
      if (searchInput.trim() !== "") {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);

  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    navigate(`${location.pathname}?page=${newPage}`);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setPublishStatus("");
  };

  const handleSubmitClose = () => {
    setIsModalOpen(false);
    setPublishStatus("");
    if (!editingCourse) {
      fetchData(currentPage, itemsPerPage, searchQuery, publishStatus);
    } else {
      setEditingCourse(null);
      fetchData(currentPage, itemsPerPage, searchQuery, publishStatus);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await BackendService.Delete(
        {
          url: `${DELETE_COURSE}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Course deleted successfully!");
            setIsDeleteModal(false);
            setPublishStatus("");
            fetchData(currentPage, itemsPerPage, searchQuery, publishStatus);
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

  const handlePubLish = async () => {
    try {
      const isUnpublish = publishAction === "UNPUBLISH";
      const url = isUnpublish
        ? `${UPDATE_COURSE}/${publishId}`
        : `${PUBLISH_COURSE}/${publishId}`;
      const data = isUnpublish ? { publish_status: "DRAFT" } : {};

      const response = await BackendService.Patch(
        {
          url,
          data,
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success(
              `Course ${isUnpublish ? "unpublished" : "published"} successfully!`
            );
            setIsPublishModal(false);
            setPublishStatus("");
            fetchData(currentPage, itemsPerPage, searchQuery, publishStatus);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                `Failed to ${isUnpublish ? "unpublish" : "publish"} the Course.`
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setPublishId(null);
      setPublishAction("");
    }
  };

  const fetchData = async (currentPage, itemsPerPage, searchQuery, status) => {
    setLoading(true);
    try {
      // Build query params dynamically
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (status) {
        params.append("publish_status", status);
      }

      await BackendService.Get(
        {
          url: `${GET_ALL_COURSES}?${params.toString()}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCourses(response);
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

  const handleToggleActive = async (id) => {
    setActiveToggleId(id);
    try {
      const response = BackendService.Patch(
        {
          url: `${UPDATE_COURSE_STATUS}/${id}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (response) => {
            toast.success(response?.message || "Successfully updated course");
            setActiveToggleId(null);
            fetchData(currentPage, itemsPerPage, searchQuery, publishStatus);
          },
          failure: () => {
            toast.error("Failed to update");
            setActiveToggleId(null);
            fetchData(currentPage, itemsPerPage, searchQuery, publishStatus);
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      setActiveToggleId(null);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchQuery, publishStatus);
  }, [currentPage, itemsPerPage, searchQuery, publishStatus]);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          {/* Left side: Search + Filter */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Search</label>
              <input
                type="text"
                placeholder="Search by Name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
              />
            </div>

            {/* Course Status */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Course Status</label>
              <select
                value={publishStatus}
                name="level"
                onChange={(e) => {
                  setPublishStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border px-3 py-2 rounded md:w-48"
              >
                <option value="">All</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Right side: Create button */}
          <button
            onClick={() => {
              setEditingCourse(null), setIsModalOpen(true);
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            + Create Course
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                {/* <th className="px-4 py-3">Reviews</th> */}
                <th className="px-4 py-3">Mentor</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Lock Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses?.courses?.map((course) => (
                <tr
                  key={course.id}
                  // onClick={() => handleViewDetails(course)}
                  className="hover:bg-gray-50 cursor-pointer border-t items-center"
                >
                  <td className="px-4 py-3 max-w-[150px] break-words">
                    <button
                      onClick={() =>
                        navigate(
                          `${ROUTES.COURSE_DETAILS}?id=${course?._id}&page=${currentPage}`
                        )
                      }
                      className="text-left max-w-[140px] break-words"
                    >
                      {course?.name}
                    </button>
                  </td>
                  {/* <td className="px-4 py-3">
                    {course?.feedbackStats?.averageRating || 0} ⭐
                  </td> */}
                  <td className="px-4 py-3 max-w-[150px] break-words">
                    {course?.mentor?.first_name} {course?.mentor?.last_name}
                  </td>
                  <td className="px-4 py-3">
                    {course?.level || "Not Available"}
                  </td>
                  <td className="px-4 py-3 max-w-[150px] break-words">
                    {course?.category?.name || "Not Available"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={course?.is_locked}
                        onChange={() => handleToggleActive(course?._id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 flex items-center rounded-full transition duration-300 ease-in-out ${
                          course?.is_locked ? "bg-green-500" : "bg-red-400"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                            course?.is_locked
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </label>
                  </td>
                  <td className="px-4 py-3 ">
                    <div className="text-right space-x-2 flex gap-2 justify-end">
                    <button
                      className="h-9 w-9 rounded-lg border-[1px] flex justify-center items-center cursor-pointer"
                      onClick={() =>
                        navigate(
                          `${ROUTES.COURSE_DETAILS}?id=${course?._id}&page=${currentPage}`
                        )
                      }
                    >
                      <RemoveRedEyeOutlinedIcon style={{ fontSize: "16px" }} />
                    </button>

                    <button
                      className={`w-[160px] p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1 justify-center`}
                      onClick={() => {
                        setPublishId(course?._id);
                        setPublishAction(
                          course?.publish_status === "PUBLISHED"
                            ? "UNPUBLISH"
                            : "PUBLISH"
                        );
                        setIsPublishModal(true);
                      }}
                    >
                      {course?.publish_status === "PUBLISHED"
                        ? "Published"
                        : "Publish Course"}
                    </button>
                    {course?.publish_status === "DRAFT" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(course);
                        }}
                        className="py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-md px-5 flex items-center gap-1"
                      >
                        <CreateRoundedIcon /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDeleteId(course?._id);
                        setIsDeleteModal(true);
                      }}
                      className="px-5 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                    >
                      <DeleteRoundedIcon /> Delete
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses?.courses?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No courses available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {courses?.courses?.length >= 1 && (
            <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
              <Pagination
                id={"type2"}
                currentPage={Number(currentPage)}
                totalPages={courses?.pagination?.totalPages}
                onPageChange={handlePageChange}
                displayRange={3}
              />
            </div>
          )}
        </div>

        {/* Modals */}
        {isModalOpen && (
          <CourseModal
            onClose={handleClose}
            course={editingCourse}
            onSubmit={handleSubmitClose}
          />
        )}

        {isDeleteModal && (
          <ConformationModal
            isOpen={isDeleteModal}
            onClose={() => setIsDeleteModal(false)}
            onSubmit={handleDelete}
            content="Delete Course"
            paragraphcontent={`Are you sure you want to delete Course? This action cannot be undone.`}
            buttoncontent="Delete"
          />
        )}
        {isPublishModal && (
          <ConformationModal
            isOpen={isPublishModal}
            onClose={() => setIsPublishModal(false)}
            onSubmit={handlePubLish}
            content={
              publishAction === "UNPUBLISH"
                ? "Unpublish Course"
                : "Publish Course"
            }
            paragraphcontent={
              publishAction === "UNPUBLISH"
                ? "Are you sure you want to unpublish this course? It will be moved to Draft status."
                : "Are you sure you want to publish Course? The updating the course cannot be done again once published."
            }
            buttoncontent={
              publishAction === "UNPUBLISH" ? "Unpublish" : "Publish"
            }
          />
        )}
      </div>
    </div>
  );
};

export default Courses;
