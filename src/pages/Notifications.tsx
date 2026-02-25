import React, { useState, useEffect } from "react";
import NotificationModal from "../components/modal/NotificationModal";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { toast } from "react-toastify";
import {
  GET_ALL_NOTIFICATIONS,
  RESEND_NOTIFICATION,
} from "../constants/ApiConstants";
import Pagination from "../components/Pagination";
import { Icons } from "../components/icons";

const getTypeColor = (type: string) => {
  switch (type) {
    case "ANNOUNCEMENT":
      return "#10b981";
    case "GENERAL":
      return "#a855f7";
    case "COURSE_UPDATE":
      return "#f59e0b";
    case "REDIRECT_TO_CONVERSATION":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const Notifications: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<any>([]);
  const [resendId, setResendId] = useState(null);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(false);

  const fetchData = async (currentPage, itemsPerPage) => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ALL_NOTIFICATIONS}?page=${currentPage}&limit=${itemsPerPage}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setNotifications(response);
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleResendNotification = async (id: string) => {
    setResendId(id);
    try {
      const response = await BackendService.Post(
        {
          url: `${RESEND_NOTIFICATION}/${id}`,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success("Notification resent successfully!");
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to resent Notification."
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setResendId(null);
    }
  };
  const handleClose = () => {
    setShowModal(false);
  };

  const handleSubmitClose = () => {
    setShowModal(false);
    setCurrentPage(1);
    fetchData(currentPage, itemsPerPage);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white px-5 py-2 rounded-md hover:bg-gray-800"
        >
          + Create Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notifications?.data?.map((n) => (
          <div
            key={n.id}
            className="p-4 bg-white rounded-xl shadow border-l-4"
            style={{ borderColor: getTypeColor(n.type) }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 truncate max-w-[350px]">
                  {n.title}
                </h3>
                <p className="text-gray-700 mt-1 truncate max-w-[350px]">
                  {n.description}
                </p>
                <span
                  className="inline-block mt-2 text-xs font-medium uppercase px-2 py-1 rounded bg-opacity-10"
                  style={{
                    backgroundColor: getTypeColor(n.type),
                    color: "#ffffff",
                  }}
                >
                  {n.type}
                </span>
              </div>
              {n.image && (
                <img
                  src={n?.image}
                  alt="notification"
                  className="w-20 h-20 object-cover rounded border ml-4"
                />
              )}
            </div>
            <div className="flex justify-end items-end">
              <button
                className="w-[160px] p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1 justify-center"
                onClick={() => handleResendNotification(n?._id)}
              >
                {resendId === n?._id ? (
                  <Icons.loading />
                ) : (
                  <>
                    <ReplayRoundedIcon fontSize="small" />
                    Resend Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {notifications?.data?.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          No notifications created yet.
        </p>
      )}
      {notifications?.data?.length >= 1 && (
        <div className="flex flex-col items-center justify-center gap-3 py-4 mb-5">
          <Pagination
            id={"type2"}
            currentPage={currentPage}
            totalPages={notifications?.pagination?.pages}
            onPageChange={handlePageChange}
            displayRange={3}
          />
        </div>
      )}

      {showModal && <NotificationModal onClose={handleClose} onSubmit={handleSubmitClose}/>}
    </div>
  );
};

export default Notifications;
