import React, { useState, useEffect } from "react";
import { BackendService } from "../../Utils/Backend";
import {
  DELETE_COURSE_MATERIAL,
  DELETE_LESSION,
  GET_ALL_LESSIONS,
  GET_COURSE_BY_ID,
  GET_COURSE_PRICE,
  GET_COURSE_MATERIALS_BY_COURSE,
  GET_FEEDBACK_BY_COURSE,
  UPDATE_LESSON_STATUS,
  UPDATE_COURSE_PRICES,
} from "../../constants/ApiConstants";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { ROUTES } from "../../constants/RouteConstants";
import Pagination from "../Pagination";
import ConformationModal from "../modal/ConformationModal";
import AddModal from "../modal/AddModal";
import { Star } from "lucide-react";
import { Icons } from "../icons";

const TABS = ["Lessons", "Feedback", "Materials"];

const CourseDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const page = params.get("page");
  const tab = params.get("activetab");
  const [course, setCourse] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeToggleId, setActiveToggleId] = useState(null);
  const [editing, setEditing] = useState<any>();
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [activeTab, setActiveTab] = useState(tab || "Lessons");
  const [tabData, setTabData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [coursePrices, setCoursePrices] = useState<any>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false)
  

  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // fetch main course details
  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_COURSE_BY_ID}/${id}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCourse(response);
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

  const fetchCoursePriceDetails = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_COURSE_PRICE}/${id}/price`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCoursePrices(response.prices);
            if (
              response?.prices?.WEB == null &&
              response?.prices?.ANDROID == null &&
              response?.prices?.IOS == null
            ) {
              setIsCreateMode(true);
            } else {
              setIsCreateMode(false);
            }
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

  // fetch data for active tab
  const fetchTabData = async (tab: string) => {
    try {
      let url = "";
      if (tab === "Lessons")
        url = `${GET_ALL_LESSIONS}?course_id=${id}&page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`; // replace with actual API
      if (tab === "Feedback")
        url = `${GET_FEEDBACK_BY_COURSE}?course_id=${id}&limit=${itemsPerPage}&page=${currentPage}`;
      if (tab === "Materials")
        url = `${GET_COURSE_MATERIALS_BY_COURSE}?page=${currentPage}&limit=${itemsPerPage}&course_id=${id}`;

      if (!url) return;

      await BackendService.Get(
        { url, accessToken: admintoken },
        {
          success: (res) => setTabData(res),
          failure: async (res) => toast.error(res?.response?.data?.message),
        }
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error fetching tab data");
    }
  };
  const handleDelete = async (tab: string) => {
    try {
      let url = "";
      if (tab === "Lessons") url = `${DELETE_LESSION}/${deleteId}`;
      if (tab === "Feedback")
        url = `${GET_FEEDBACK_BY_COURSE}?course_id=${id}&limit=${itemsPerPage}&page=${currentPage}`;
      if (tab === "Materials") url = `${DELETE_COURSE_MATERIAL}/${deleteId}`;

      if (!url) return;
      const response = await BackendService.Delete(
        {
          url: url,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success(data?.message || "Deleted Successfully.");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchTabData(activeTab);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to delete."
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

  const handleChange = (e, platform) => {
    setCoursePrices({ ...coursePrices, [platform]: e.target.value });
  };

  const handleEdit = (data) => {
    setEditing(data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchCourseDetails();
    fetchCoursePriceDetails();
  }, []);

  useEffect(() => {
    if (id) fetchTabData(activeTab);
  }, [activeTab, id, currentPage, itemsPerPage, searchQuery]);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmitClose = () => {
    setIsModalOpen(false);
    if (!editing) {
      fetchTabData(activeTab);
    } else {
      setCurrentPage(1);
      fetchTabData(activeTab);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchInput); // update after delay
      setCurrentPage(1); // reset to page 1
    }, 500); // debounce delay (in ms)

    return () => clearTimeout(delay); // cleanup on each keypress
  }, [searchInput]);

  if (loading)
    return (
      <p className="p-6 w-full flex items-center justify-cnter">
        <Icons.loading />
      </p>
    );

  const handleToggleActive = async (id) => {
    setActiveToggleId(id);
    try {
      const response = BackendService.Patch(
        {
          url: `${UPDATE_LESSON_STATUS}/${id}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (response) => {
            toast.success(response?.message || "Successfully updated course");
            setActiveToggleId(null);
            fetchTabData(activeTab);
          },
          failure: () => {
            toast.error("Failed to update");
            setActiveToggleId(null);
            fetchTabData(activeTab);
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      setActiveToggleId(null);
    }
  };

  const handleSubmit = async () => {
    if (
      coursePrices.WEB === "" ||
      coursePrices.ANDROID === "" ||
      coursePrices.IOS === "" ||
      coursePrices.WEB == null ||
      coursePrices.ANDROID == null ||
      coursePrices.IOS == null
    ) {
      toast.error("Please enter prices for all platforms.");
      return;
    }
  
    if (Number(coursePrices.WEB) <= 0 || Number(coursePrices.ANDROID) <= 0 || Number(coursePrices.IOS) <= 0) {
      toast.error("All prices must be greater than 0.");
      return;
    }
    const { WEB, ANDROID, IOS } = coursePrices;
    const isValid =
      WEB.toString().length <= 6 &&
      ANDROID.toString().length <= 6 &&
      IOS.toString().length <= 6;

    if (!isValid) {
      toast.error("Price values must not exceed 6 digits.");
      return;
    }

    setPriceLoading(true);
    try {
      await BackendService.Patch(
        {
          url: `${UPDATE_COURSE_PRICES}/${id}/price`,
          data: {
            WEB: Number(WEB),
            ANDROID: Number(ANDROID),
            IOS: Number(IOS),
          },
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Prices updated successfully!");
            setIsEditing(false);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to update prices."
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course Details</h1>
        <button
          onClick={() => navigate(`${ROUTES.COURSES}?page=${page}`)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back
        </button>
      </div>
      {/* Course Summary */}
      {course && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex">
          <div className="flex items-start gap-6 w-3/4">
            <img
              src={course.image}
              alt={course.name}
              className="w-48 h-32 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
              <p className="text-gray-700 mb-1">Level: {course.level}</p>
              <p className="text-gray-700 mb-1">
                Mentor: {course.mentor.first_name} {course.mentor.last_name}
              </p>
              <p className="text-gray-600 mb-1">{course.mentor.bio}</p>
              <p className="text-gray-600">
                ⭐ {course.avgRating} / 5 ({course.totalReviews} reviews)
              </p>
            </div>
          </div>
          {coursePrices && (
            <div className="w-1/4 border border-gray-300 p-4 rounded-lg shadow-sm">
              <div className="space-y-3">
                {/* Web Price */}
                <div className="flex items-center justify-between">
                  <label className="font-medium">Web Price:</label>
                  <input
                    type="number"
                    value={coursePrices.WEB || ""}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setCoursePrices({ ...coursePrices, WEB: e.target.value })
                    }
                    className={`border px-2 py-1 rounded-md w-24 ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Android Price */}
                <div className="flex items-center justify-between">
                  <label className="font-medium">App Price (Android):</label>
                  <input
                    type="number"
                    value={coursePrices.ANDROID || ""}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setCoursePrices({
                        ...coursePrices,
                        ANDROID: e.target.value,
                      })
                    }
                    className={`border px-2 py-1 rounded-md w-24 ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* IOS Price */}
                <div className="flex items-center justify-between">
                  <label className="font-medium">IOS Price:</label>
                  <input
                    type="number"
                    value={coursePrices.IOS || ""}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setCoursePrices({ ...coursePrices, IOS: e.target.value })
                    }
                    className={`border px-2 py-1 rounded-md w-24 ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600"
                  >
                    {isCreateMode ? "Create" : "Update"}
                  </button>
                )}

                {isEditing && (
                  <>
                    <button
                      onClick={handleSubmit}
                      disabled={priceLoading}
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    >
                      {priceLoading
                        ? isCreateMode
                          ? "Creating..."
                          : "Updating..."
                        : isCreateMode
                        ? "Create"
                        : "Update"}
                    </button>

                    <button
                      onClick={() => {
                        setIsEditing(false);
                      }}
                      className="w-full bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
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
      {activeTab === "Lessons" && !loading && (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Lessons</h1>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
            />
            <button
              onClick={() => {
                setEditing(null);
                setIsModalOpen(true);
              }}
              className="bg-gray-900 text-white px-4 py-2 rounded"
            >
              + Create Lesson
            </button>
          </div>
          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">Thumbnail</th>
                  <th className="px-4 py-3">Lesson Name</th>
                  <th className="px-4 py-3">No of Videos</th>
                  {/* <th className="px-4 py-3">Lock Status</th> */}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabData?.lessons?.map((lesson) => (
                  <tr
                    key={lesson._id}
                    // onClick={() => handleViewDetails(course)}
                    className="hover:bg-gray-50 cursor-pointer border-t"
                  >
                    <td className="px-4 py-3">
                      <img src={lesson?.thumbnail} className="h-10 w-14" />
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      <button
                        onClick={() =>
                          navigate(
                            `${ROUTES.LESSION_DETAILS}?course_id=${id}&lesson_id=${lesson?._id}&activetab=${activeTab}`
                          )
                        }
                        className="block w-full truncate whitespace-nowrap overflow-hidden text-left"
                      >
                        {lesson?.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">{lesson?.videos}</td>
                    {/* <td className="px-4 py-3 border-b">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lesson?.is_locked}
                          onChange={() => handleToggleActive(lesson?._id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 flex items-center rounded-full transition duration-300 ease-in-out ${
                            lesson?.is_locked ? "bg-green-500" : "bg-red-400"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                              lesson?.is_locked
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          />
                        </div>
                      </label>
                    </td> */}
                    <td className="px-4 py-3 text-right space-x-2 flex gap-2 justify-end">
                      <button
                        className="h-9 w-9 rounded-lg border-[1px] flex justify-center items-center cursor-pointer"
                        onClick={() =>
                          navigate(
                            `${ROUTES.LESSION_DETAILS}?course_id=${id}&lesson_id=${lesson?._id}&activetab=${activeTab}`
                          )
                        }
                      >
                        <RemoveRedEyeOutlinedIcon
                          style={{ fontSize: "16px" }}
                        />
                      </button>
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-md px-5 flex items-center gap-1"
                      >
                        <CreateRoundedIcon /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(lesson?._id);
                          setIsDeleteModal(true);
                        }}
                        className="px-5 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                      >
                        <DeleteRoundedIcon /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {tabData?.lessons?.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No Lessons available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {tabData?.lessons?.length >= 1 && (
              <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
                <Pagination
                  id={"type2"}
                  currentPage={currentPage}
                  totalPages={tabData?.pagination?.totalPages}
                  onPageChange={handlePageChange}
                  displayRange={3}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "Feedback" && !loading && (
        <div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow">
            <div>
              <h2 className="text-lg font-semibold">Average Rating</h2>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < tabData?.stats?.avgRating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({tabData?.stats?.avgRating} / 5)
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Total Reviews:{" "}
                <span className="font-semibold">
                  {tabData?.stats?.totalReviews}
                </span>
              </p>
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4 mt-4">
            {tabData?.feedbacks?.map((fb, idx) => (
              <div
                key={idx}
                className="flex gap-4 border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={fb?.user?.profile}
                  alt={fb?.user?.first_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {fb?.user?.first_name} {fb?.user?.last_name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {new Date(fb?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)]?.map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < fb?.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mt-2 text-sm">{fb?.review}</p>
                </div>
              </div>
            ))}
            {tabData?.feedbacks?.length === 0 && (
              <div className="text-center">
                <p className="px-4 py-6 text-center text-gray-500">
                  No Feedbacks available.
                </p>
              </div>
            )}
          </div>
          {tabData?.feedbacks?.length >= 1 && (
            <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
              <Pagination
                id={"type2"}
                currentPage={currentPage}
                totalPages={tabData?.pagination?.totalPages}
                onPageChange={handlePageChange}
                displayRange={3}
              />
            </div>
          )}
        </div>
      )}
      {activeTab === "Materials" && !loading && (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Course Materials</h1>
          </div>
          <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6">
            <button
              onClick={() => {
                setEditing(null);
                setIsModalOpen(true);
              }}
              className="bg-gray-900 text-white px-4 py-2 rounded"
            >
              + Create Material
            </button>
          </div>
          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">Material Name</th>
                  <th className="px-4 py-3">Material Type</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabData?.courseMaterials?.map((course) => (
                  <tr
                    key={course._id}
                    // onClick={() => handleViewDetails(course)}
                    className="hover:bg-gray-50 cursor-pointer border-t"
                  >
                    <td className="px-4 py-3">{course?.resource_name}</td>
                    <td className="px-4 py-3">{course?.resourse_type}</td>
                    <td className="px-4 py-3 text-right space-x-2 flex gap-2 justify-end">
                      {/* <button
                        className="h-9 w-9 rounded-lg border-[1px] flex justify-center items-center cursor-pointer"
                      >
                        <RemoveRedEyeOutlinedIcon
                          style={{ fontSize: "16px" }}
                        />
                      </button> */}
                      <button
                        onClick={() => {
                          setDeleteId(course?._id);
                          setIsDeleteModal(true);
                        }}
                        className="px-5 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                      >
                        <DeleteRoundedIcon /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {tabData?.courseMaterials?.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No Course Materials available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {tabData?.courseMaterials?.length >= 1 && (
              <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
                <Pagination
                  id={"type2"}
                  currentPage={currentPage}
                  totalPages={tabData?.totalPages}
                  onPageChange={handlePageChange}
                  displayRange={3}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modals */}
      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={() => handleDelete(activeTab)}
          content={
            activeTab === "Lessons" ? "Delete Lesson" : "Delete Materials"
          }
          paragraphcontent={`Are you sure you want to delete ${
            activeTab === "Lessons" ? "Lesson" : "Course Material"
          }? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}
      {isModalOpen && (
        <AddModal
          onClose={handleClose}
          editing={editing}
          type={activeTab === "Lessons" ? "Lesson" : "course material"}
          onSubmit={handleSubmitClose}
        />
      )}
    </div>
  );
};

export default CourseDetails;
