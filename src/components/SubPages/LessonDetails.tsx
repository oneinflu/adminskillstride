import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BackendService } from "../../Utils/Backend";
import {
  GET_LESSON_VIDEOS,
  DELETE_LESSON_VIDEO,
  UPDATE_LESSON_VIDEO_STATUS
} from "../../constants/ApiConstants";
import { ROUTES } from "../../constants/RouteConstants";
import AddModal from "../modal/AddModal";
import ConformationModal from "../modal/ConformationModal";
import { toast } from "react-toastify";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import Pagination from "../Pagination";
import AddLessonModal from "../modal/LessionModal";

const LessonDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get("lesson_id");
  const courseId = params.get("course_id");
  const activeTab = params.get("activetab");

  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );

  const [lesson, setLesson] = useState<any>(null);
  const [activeToggleId, setActiveToggleId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);

  const formatDurationMinutes = (duration: any) => {
    const seconds = Number(duration);
    if (!Number.isFinite(seconds) || seconds <= 0) return "0.00";
    return (seconds / 60).toFixed(2);
  };

  const fetchLesson = async () => {
    try {
      await BackendService.Get(
        {
          url: `${GET_LESSON_VIDEOS}?lesson_id=${lessonId}&course_id=${courseId}&page=${currentPage}&limit=${itemsPerPage}`,
          accessToken: admintoken,
        },
        {
          success: (res) => setLesson(res),
          failure: (err) => toast.error(err?.response?.data?.message),
        }
      );
    } catch (e) {
      toast.error("Failed to fetch lesson");
    }
  };

    const handleToggleActive = async (id) => {
      setActiveToggleId(id);
      try {
        const response = BackendService.Patch(
          {
            url: `${UPDATE_LESSON_VIDEO_STATUS}/${id}`,
            data: {},
            accessToken: admintoken,
          },
          {
            success: (response) => {
              toast.success(response?.message || "Successfully updated course");
              setActiveToggleId(null);
              fetchLesson();
            },
            failure: () => {
              toast.error("Failed to update");
              setActiveToggleId(null);
              fetchLesson();
            },
          }
        );
      } catch (error) {
        toast.error("Something went wrong. Please try again!");
        setActiveToggleId(null);
      }
    };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await BackendService.Delete(
        {
          url: `${DELETE_LESSON_VIDEO}/${deleteId}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success(data?.message || "Video Deleted Successfully.");
            setIsDeleteModal(false);
            setCurrentPage(1);
            fetchLesson();
          },
          failure: (err) =>
            toast.error(err?.response?.data?.message || "Failed to delete"),
        }
      );
    } catch (e) {
      toast.error("Error deleting video");
    }
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId, currentPage, itemsPerPage]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lesson Videos</h1>
        <button
          onClick={() => navigate(`${ROUTES.COURSE_DETAILS}?id=${courseId}&activetab=${activeTab}`)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>

      {/* Lesson Info */}
      {lesson && (
        <div className="bg-white p-4 shadow rounded mb-6">
          <div className="flex items-center gap-4">
            {lesson?.videos?.lenght >= 1 && (
              <img
                src={lesson?.videos?.[0]?.thumbnail}
                alt={lesson?.videos?.[0]?.name}
                className="w-32 h-20 object-cover rounded"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{lesson?.name}</h2>
              <p className="text-gray-600">
                Total Videos: {lesson?.videos?.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video List */}
      <div className="bg-white p-6 shadow rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Videos</h2>
          <button
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded"
          >
            + Add Video
          </button>
        </div>

        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Video Thumbnail</th>
              <th className="px-4 py-2 text-left">Video Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Duration</th>
              <th className="px-4 py-2 text-left">Lock Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lesson?.videos?.map((video) => (
              <tr key={video._id} className="border-t">
                <td className="px-4 py-2">
                  <img src={video?.thumbnail} className="h-10 w-18" />
                </td>
                <td className="px-4 py-2 truncate max-w-[300px]">
                  {video?.name}
                </td>
                <td className="px-4 py-2 truncate max-w-[300px]">
                  {video?.description}
                </td>
                <td className="px-4 py-2">
                  {formatDurationMinutes(video?.duration)} mins
                </td>
                <td className="px-4 py-3 border-b">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={video?.is_locked}
                      onChange={() => handleToggleActive(video?._id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 flex items-center rounded-full transition duration-300 ease-in-out ${
                        video?.is_locked ? "bg-green-500" : "bg-red-400"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                          video?.is_locked ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </label>
                </td>
                <td className="px-4 py-2 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setEditing(video);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center gap-1"
                  >
                    <CreateRoundedIcon fontSize="small" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(video._id);
                      setIsDeleteModal(true);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-1"
                  >
                    <DeleteRoundedIcon fontSize="small" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {lesson?.videos?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No videos available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {lesson?.videos?.length >= 1 && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
            <Pagination
              id={"type2"}
              currentPage={currentPage}
              totalPages={lesson?.pagination?.totalPages}
              onPageChange={handlePageChange}
              displayRange={3}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <AddLessonModal
          onClose={() => {
            setIsModalOpen(false);
            fetchLesson();
          }}
          videoData={editing}
        />
      )}

      {isDeleteModal && (
        <ConformationModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onSubmit={handleDelete}
          content="Delete Video"
          paragraphcontent="Are you sure you want to delete this video? This action cannot be undone."
          buttoncontent="Delete"
        />
      )}
    </div>
  );
};

export default LessonDetails;
