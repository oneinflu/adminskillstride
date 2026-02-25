import React, { useState, useEffect } from "react";
import SubscriptionModal from "../components/modal/SubscriptionModal";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import { BackendService } from "../Utils/Backend";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { GET_SUBSCRIPTIONS_PLANS } from "../constants/ApiConstants";
import { Icons } from "../components/icons";

const Subscriptions: React.FC = () => {
  const [plans, setPlans] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [editingData, setEditingData] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(false);

  const fetchData = async (currentPage: number, itemsPerPage: number) => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_SUBSCRIPTIONS_PLANS}?page=${currentPage}&limit=${itemsPerPage}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setPlans(response || []); // ✅ use response.data
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
          "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Subscription Plans
          </h1>
        </div>

        <div className="overflow-x-auto rounded">
          <table className="min-w-full bg-white border border-gray-200 shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-600 border-b">
                  Type
                </th>
                <th className="px-6 py-3 font-semibold text-gray-600 border-b">
                  Price
                </th>
                <th className="px-6 py-3 font-semibold text-gray-600 border-b">
                  Status
                </th>
                <th className="px-6 py-3 font-semibold text-gray-600 border-b">
                  Features
                </th>
                <th className="px-6 py-3 font-semibold text-gray-600 border-b text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan: any) => (
                <tr key={plan._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">
                    {plan?.type} {/* MONTHLY / YEARLY */}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Web</span>
                          <span>
                            {plan.currency} {plan?.web_price}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Android</span>
                          <span>
                            {plan.currency} {plan?.android_price}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">iOS</span>
                          <span>
                            {plan.currency} {plan?.ios_price}
                          </span>
                        </div>
                      </div>

                      {plan.discount_price && (
                        <div className="text-xs text-green-600 mt-3 border-t pt-2">
                          <strong>Discount:</strong> {plan.currency}{" "}
                          {plan.discount_price} (same for all)
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 border-b">{plan.status}</td>
                  <td className="px-6 py-4 border-b">
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {plan.features?.map((feature: string, i: number) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                    {plan.has_free_trail && (
                      <p className="mt-2 text-xs text-blue-600">
                        Free Trial: {plan.free_trail_count}{" "}
                        {plan.free_trail_type?.toLowerCase()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 border-b text-right">
                    <div className="inline-flex space-x-2">
                      <button
                        className="py-1 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-1"
                        onClick={() => {
                          setEditingData(plan), setShowModal(true);
                        }}
                      >
                        <CreateRoundedIcon fontSize="small" /> Edit
                      </button>
                      {/* <button className="py-1 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1">
                        <DeleteRoundedIcon fontSize="small" /> Delete
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && plans.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    No plans available.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    <Icons.loading />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <SubscriptionModal
          onClose={() => {
            setShowModal(false), fetchData(currentPage, itemsPerPage);
          }}
          initialData={editingData}
        />
      )}
    </div>
  );
};

export default Subscriptions;
