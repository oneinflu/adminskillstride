import React, { useState, useEffect } from "react";
import { BackendService } from "../../Utils/Backend";
import {
  GET_ORGANIZATION_BY_ID,
  GET_ORGANIZATION_SUBSCRIPTION_DETAILS,
  SEATS_API,
  UPDATE_ORGANIZATION_SUBSCRIPTION,
} from "../../constants/ApiConstants";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { ROUTES } from "../../constants/RouteConstants";
import Pagination from "../Pagination";
import ConformationModal from "../modal/ConformationModal";
import { Icons } from "../icons";
import BulkStudentModal from "../modal/BulkStudentsModal";
import DatePicker from "react-datepicker";

const TABS = ["Seats", "Students"];

const OrganizationDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const page = params.get("page");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubEditing, setIsSubEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [organization, setOrganization] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [editing, setEditing] = useState<any>();
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isAllDeleteModal, setIsAllDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [activeTab, setActiveTab] = useState("Seats");
  const [tabData, setTabData] = useState<any>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subscriptionDetails, setSubscriptonDetails] = useState<any>({
    subscription_from: "",
    subscription_to: "",
    price: "",
  });
  const [allocatedSeats, setAllocatedSeats] = useState(
    tabData?.allocated_seats
  );
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [totalSeats, setTotalSeats] = useState(null);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // fetch main course details
  const fetchOrganizationDetails = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ORGANIZATION_BY_ID}/${id}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setOrganization(response?.data);
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

  const fetchOrganizationSubscriptionDetails = async () => {
    setSubLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ORGANIZATION_SUBSCRIPTION_DETAILS}/${id}/subscription`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            console.log(response);
            setSubscriptonDetails(response);
            if (
              response?.subscription_from != null &&
              response?.subscription_to != null &&
              response?.price != null
            ) {
              setIsCreateMode(false);
            } else {
              setIsCreateMode(true);
            }
            setSubLoading(false);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
            setIsCreateMode(true);
            setSubLoading(false);
          },
        }
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again"
      );
      setSubLoading(false);
    }
  };

  // fetch data for active tab
  const fetchTabData = async (tab: string) => {
    try {
      let url = "";

      if (tab === "Students") {
        url = `${SEATS_API}/${id}/students?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`;
      } else if (tab === "Seats") {
        url = `${SEATS_API}/${id}/seats`;
      }

      if (!url) return;

      await BackendService.Get(
        { url, accessToken: admintoken },
        {
          success: (res) => {
            setTabData(res);

            // Initialize Seats values for editing
            if (tab === "Seats") {
              setTotalSeats(res.total_seats);
              setAllocatedSeats(res.allocated_seats);
            }
          },
          failure: (res) => {
            toast.error(res?.response?.data?.message || "Error fetching data");
          },
        }
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error fetching tab data");
    }
  };

  const handleDelete = async (tab: string) => {
    try {
      let url = "";
      if (tab === "Students") url = `${SEATS_API}/${id}/students/${deleteId}`;

      if (!url) return;
      const response = await BackendService.Delete(
        {
          url: url,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success(data?.message || "Removed student Successfully.");
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

  const handleDeleteAll = async (tab: string) => {
    try {
      let url = "";
      if (tab === "Seats") url = `${SEATS_API}/${id}/clear-allocations`;

      if (!url) return;
      console.log("trgieered");
      const response = await BackendService.Delete(
        {
          url: url,
          data: {},
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success(
              data?.message || "Removed all students Successfully."
            );
            setIsAllDeleteModal(false);
            setCurrentPage(1);
            fetchTabData(activeTab);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to delete all students."
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

  const handleSubmit = async () => {
    const { subscription_from, subscription_to, price } =
      subscriptionDetails || {};

    if (!subscription_from) {
      toast.error("Please select a subscription start date.");
      return;
    }

    if (!subscription_to) {
      toast.error("Please select a subscription end date.");
      return;
    }

    if (new Date(subscription_to) <= new Date(subscription_from)) {
      toast.error("End date must be after the start date.");
      return;
    }

    if (!price || isNaN(price) || Number(price) < 0) {
      toast.error("Please enter a valid subscription price.");
      return;
    }

    if (String(price).length > 6) {
      toast.error("Subscription price cannot exceed 6 digits.");
      return;
    }

    setPriceLoading(true);
    try {
      await BackendService.Post(
        {
          url: `${UPDATE_ORGANIZATION_SUBSCRIPTION}/${id}/subscription`,
          data: {
            subscription_from,
            subscription_to,
            price: Number(price),
          },
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Subscription updated successfully!");
            setIsSubEditing(false);
            fetchOrganizationSubscriptionDetails();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to update Subscription."
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

  const handleUpdateSeats = async () => {
    if (!totalSeats || isNaN(totalSeats) || Number(totalSeats) <= 0) {
      toast.error("Please enter a valid number of seats.");
      return;
    }

    if (Number(totalSeats) > 100) {
      toast.error("Total seats cannot exceed 100.");
      return;
    }
    try {
      const response = await BackendService.Post(
        {
          url: `${SEATS_API}/${id}/seats`,
          data: {
            total_seats: totalSeats,
          },
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success(data?.message || "seats updated Successfully.");
            setIsEditing(false);
            fetchTabData(activeTab);
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message || "Failed to update."
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    }
  };

  const handleEdit = (data) => {
    setEditing(data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchOrganizationDetails();
    fetchOrganizationSubscriptionDetails();
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

  const handleDateChange = (
    date: Date | null,
    field: "subscription_from" | "subscription_to"
  ) => {
    if (!date) return;

    const currentDate = new Date();

    if (field === "subscription_from") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selected = new Date(date);
      selected.setHours(0, 0, 0, 0);

      if (selected < today) {
        toast.error("Start date cannot be in the past!");
        return;
      }
    }
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    setSubscriptonDetails({
      ...subscriptionDetails,
      [field]: normalizedDate.toISOString(),
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organization Details</h1>
        <button
          onClick={() => navigate(`${ROUTES.ORGANIZATIONS}?page=${page}`)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back
        </button>
      </div>
      {/* Organization Summary */}
      {organization && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex justify-between items-center">
          <div className="flex items-start gap-6">
            <img
              src={organization?.logo}
              alt={organization?.name}
              className="w-32 h-24 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold mb-2">{organization?.name}</h1>
              <p className="text-gray-700 mb-1">Email: {organization?.email}</p>
              <p className="text-gray-600 mb-1">
                Status: {organization?.status}
              </p>
              {tabData?.allocated_seats >= 1 && (
                <div className="mt-6 flex items-center w-full">
                  <button
                    onClick={() => {
                      // setDeleteId(null);
                      setDeleteId(organization?._id);
                      setIsAllDeleteModal(true);
                    }}
                    className=" w-full px-5 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                  >
                    <DeleteRoundedIcon /> Delete All Students
                  </button>
                </div>
              )}
            </div>
          </div>
          {subscriptionDetails && (
            <div className="w-2/4 border border-gray-300 p-4 rounded-lg shadow-sm">
              <div className="space-y-3">
                {/* Web Price */}
                <div className="flex items-center justify-between">
                  <label className="font-medium">Subscription from:</label>
                  <DatePicker
                    selected={
                      subscriptionDetails?.subscription_from
                        ? new Date(subscriptionDetails?.subscription_from)
                        : null
                    }
                    onChange={(date: Date | null) =>
                      handleDateChange(date, "subscription_from")
                    }
                    dateFormat="dd-MM-yyyy"
                    disabled={!isSubEditing}
                    placeholderText="Select start Date"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Android Price */}
                <div className="flex items-center justify-between">
                  <label className="font-medium">Subscription to:</label>
                  <DatePicker
                    selected={
                      subscriptionDetails?.subscription_to
                        ? new Date(subscriptionDetails?.subscription_to)
                        : null
                    }
                    disabled={!isSubEditing}
                    onChange={(date: Date | null) =>
                      handleDateChange(date, "subscription_to")
                    }
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* IOS Price */}
                <div className="flex items-center justify-between">
                  <label className="font-medium">Price:</label>
                  <input
                    type="number"
                    value={subscriptionDetails.price}
                    readOnly={!isSubEditing}
                    onChange={(e) =>
                      setSubscriptonDetails({
                        ...subscriptionDetails,
                        price: e.target.value,
                      })
                    }
                    className={`border px-2 py-1 rounded-md w-48`}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {!isSubEditing && (
                  <button
                    onClick={() => setIsSubEditing(true)}
                    className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600"
                  >
                    {isCreateMode ? "Create" : "Update"}
                  </button>
                )}

                {isSubEditing && (
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
                        setIsSubEditing(false);
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
      {activeTab === "Students" && !loading && (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold">Student Details</h1>
          <div className="flex justify-between items-center my-6 ">
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Search by Name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
              />
            </div>
            <button
              className="bg-gray-900 text-white px-4 py-2 rounded-md transition outline-none"
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              + Add Students
            </button>
          </div>
          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">Thumbnail</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Mobile Number</th>
                  {/* <th className="px-4 py-3">Lock Status</th> */}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabData?.students?.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 cursor-pointer border-t"
                  >
                    <td className="px-4 py-3">
                      <img src={student?.profile} className="h-10 w-14" />
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-left">
                      {student?.name}
                    </td>
                    <td className="px-4 py-3">{student?.mobile_number}</td>
                    <td className="px-4 py-3 text-right space-x-2 flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setDeleteId(student?.id);
                          setIsDeleteModal(true);
                        }}
                        className="px-5 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1"
                      >
                        <DeleteRoundedIcon /> Remove student
                      </button>
                    </td>
                  </tr>
                ))}
                {tabData?.students?.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No Students available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {tabData?.students?.length >= 1 && (
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

      {activeTab === "Seats" && !loading && (
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Organization Seat Allocation
          </h2>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 w-1/2">
              <p className="text-sm text-gray-500 mb-2">
                Visual seat layout (blue = allocated, gray = available)
              </p>

              <div className="grid grid-cols-10 gap-2 mb-4 overflow-auto h-[20vh]">
                {Array.from({ length: tabData?.total_seats }, (_, index) => {
                  const isAllocated = index < allocatedSeats;
                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                        isAllocated
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-green-200 cursor-pointer"
                      }`}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{
                      width:
                        `${
                          (tabData?.allocated_seats / tabData?.total_seats) *
                          100
                        }%` || 0,
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {tabData?.total_seats
                  ? (
                      (tabData?.allocated_seats / tabData?.total_seats) *
                      100
                    ).toFixed(1)
                  : 0}
                % seats allocated
              </p>
            </div>
            <div className="flex-1 overflow-x-auto w-1/2">
              <table className="min-w-full bg-white shadow border rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3">Total Seats</td>
                    <td className="px-4 py-3">{tabData?.total_seats}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">Allocated Seats</td>
                    <td className="px-4 py-3">{tabData?.allocated_seats}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">Available Seats</td>
                    <td className="px-4 py-3">{tabData?.available_seats}</td>
                  </tr>
                </tbody>
              </table>

              {/* Edit Total Seats */}
              {isEditing && (
                <div className="mt-4 flex items-center gap-2">
                  <label className="text-gray-600 font-medium">
                    {!tabData || !tabData.total_seats ? "Create" : "Update"}{" "}
                    Total Seats:
                  </label>
                  <input
                    type="number"
                    className="border rounded-lg w-24 px-2 py-1"
                    value={totalSeats}
                    min={allocatedSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800"
              >
                {!tabData || !tabData.total_seats ? "Create" : "Update"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdateSeats}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading
                    ? !tabData || !tabData.total_seats
                      ? "Creating..."
                      : "Updating..."
                    : !tabData || !tabData.total_seats
                    ? "Create"
                    : "Update"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
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
          content={"Remove Student"}
          paragraphcontent={`Are you sure you want to remove student? This action cannot be undone.`}
          buttoncontent="Delete"
        />
      )}

      {isAllDeleteModal && (
        <ConformationModal
          isOpen={isAllDeleteModal}
          onClose={() => setIsAllDeleteModal(false)}
          onSubmit={() => handleDeleteAll(activeTab)}
          content={"Remove All Students"}
          paragraphcontent={`Are you sure you want to remove all students? This action cannot be undone.`}
          buttoncontent="Delete All Students"
        />
      )}
      {isModalOpen && (
        <BulkStudentModal onClose={handleClose} onSubmit={handleSubmitClose} />
      )}
    </div>
  );
};

export default OrganizationDetails;
