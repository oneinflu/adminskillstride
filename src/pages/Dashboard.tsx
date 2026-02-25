import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Briefcase, Users, Building, CreditCard, BookOpen } from "lucide-react";
import CountUp from "react-countup";
import { toast } from "react-toastify";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GET_CUSTOM_CREDITS,
  GET_STATS,
  UPDATE_CUSTOM_CREDIT,
} from "../constants/ApiConstants";
import { ROUTES } from "../constants/RouteConstants";

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const userData = useSelector((state: any) => state.AuthReducer.userData);
  const [creditsData, setCreditsData] = useState<any>([]);
  const [isEditingCredits, setIsEditingCredits] = useState(false);

  const handleSaveCredits = async () => {
    if (creditsData?.credits % 100 !== 0) {
      toast.error(
        "Credits should be in multiples of 100 (e.g., 100, 200, 500, 1000)"
      );
      return;
    }
    try {
      await BackendService.Patch(
        {
          url: `${UPDATE_CUSTOM_CREDIT}/${creditsData?.id}`,
          data: {
            credits: creditsData?.credits,
            price: creditsData?.price,
            currency: creditsData?.currency,
            platform_pricing: {
              android: creditsData?.platform_pricing?.android,
              ios: creditsData?.platform_pricing?.ios,
              web: creditsData?.platform_pricing?.web,
            },
          },
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Credits updated successfully!");
            setIsEditingCredits(false);
            fetchCreditData();
          },
          failure: (response) => {
            toast.error(response?.response?.data?.message);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_STATS}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setAnalytics(response);
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

  const fetchCreditData = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_CUSTOM_CREDITS}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCreditsData(response?.data);
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
    fetchData();
    fetchCreditData();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {/* Jobs Posted */}
          <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-blue-50" onClick={() => navigate(ROUTES.JOBS)}>
            <div className="flex items-center justify-between">
              <div className="text-gray-700 text-sm font-medium">
                Jobs Posted
              </div>
              <Briefcase className="text-blue-500 w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              <CountUp
                end={analytics?.jobs_posted}
                duration={1.5}
                separator=","
              />
            </div>
          </button>

          {/* Users Registered */}
          <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-green-50" onClick={() => navigate(ROUTES.USERS)}>
            <div className="flex items-center justify-between">
              <div className="text-gray-700 text-sm font-medium">
                Users Registered
              </div>
              <Users className="text-green-500 w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              <CountUp
                end={analytics?.users_registered}
                duration={1.5}
                separator=","
              />
            </div>
          </button>

          {/* Companies Listed */}
          <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-purple-50" onClick={() => navigate(ROUTES.COMPANIES)}>
            <div className="flex items-center justify-between">
              <div className="text-gray-700 text-sm font-medium">
                Companies Listed
              </div>
              <Building className="text-purple-500 w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              <CountUp
                end={analytics?.companies_listed}
                duration={1.5}
                separator=","
              />
            </div>
          </button>

          {/* Subscriptions */}
          {userData?.roles?.includes("SUPER_ADMIN") && (
            <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-yellow-50" onClick={() => navigate(ROUTES.SUBSCRIPTIONS)}>
              <div className="flex items-center justify-between">
                <div className="text-gray-700 text-sm font-medium">
                  Subscriptions
                </div>
                <CreditCard className="text-yellow-500 w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                <CountUp
                  end={analytics?.subscriptions}
                  duration={1.5}
                  separator=","
                />
              </div>
            </button>
          )}

          {/* Courses Available */}
          {(userData?.roles?.includes("SUPER_ADMIN") ||
            userData?.roles?.includes("MENTOR")) && (
            <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-pink-50" onClick={() => navigate(ROUTES.COURSES)}>
              <div className="flex items-center justify-between">
                <div className="text-gray-700 text-sm font-medium">
                  Courses Available
                </div>
                <BookOpen className="text-pink-500 w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                <CountUp
                  end={analytics?.courses_available}
                  duration={1.5}
                  separator=","
                />
              </div>
            </button>
          )}
          {(userData?.roles?.includes("SUPER_ADMIN") ||
            userData?.roles?.includes("OPERATIONS")) && (
            <>
              {/* Total Applications */}
              <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-orange-50" onClick={() => navigate(ROUTES.APPLICATIONS)}>
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm font-medium">
                    Total Applications
                  </div>
                  <Briefcase className="text-orange-500 w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  <CountUp
                    end={analytics?.total_applications}
                    duration={1.5}
                    separator=","
                  />
                </div>
              </button>
              {/* Jobs Applied */}
              <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-teal-50"  onClick={() => navigate(ROUTES.APPLICATIONS)}>
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm font-medium">
                    Jobs Applied
                  </div>
                  <Users className="text-teal-500 w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  <CountUp
                    end={analytics?.jobs_applied_count}
                    duration={1.5}
                    separator=","
                  />
                </div>
              </button>
              {/* Shortlisted */}
              <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-indigo-50" onClick={() => navigate(ROUTES.APPLICATIONS)}>
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm font-medium">
                    Shortlisted
                  </div>
                  <Users className="text-indigo-500 w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  <CountUp
                    end={analytics?.jobs_shortlisted_count}
                    duration={1.5}
                    separator=","
                  />
                </div>
              </button>
              {/* Rejected */}
              <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-red-50"  onClick={() => navigate(ROUTES.APPLICATIONS)}>
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm font-medium">
                    Rejected
                  </div>
                  <Users className="text-red-500 w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  <CountUp
                    end={analytics?.jobs_rejected_count}
                    duration={1.5}
                    separator=","
                  />
                </div>
              </button>
              {/* Revoked */}
              <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-yellow-100" onClick={() => navigate(ROUTES.APPLICATIONS)}>
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm font-medium">
                    Revoked
                  </div>
                  <Users className="text-yellow-600 w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  <CountUp
                    end={analytics?.jobs_revoked_count}
                    duration={1.5}
                    separator=","
                  />
                </div>
              </button>
              {/* Placed */}
              <button className="p-5 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col gap-4 bg-green-100" onClick={() => navigate(ROUTES.APPLICATIONS)}>
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm font-medium">
                    Placed
                  </div>
                  <Briefcase className="text-green-600 w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  <CountUp
                    end={analytics?.jobs_placed_count}
                    duration={1.5}
                    separator=","
                  />
                </div>
              </button>
            </>
          )}
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Jobs Posted (Monthly)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.jobs_posted_monthly}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Growth
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.user_growth_monthly}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {userData?.roles?.[0] === "SUPER_ADMIN" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Credits & Platform Pricing
            </h2>

            {!isEditingCredits ? (
              <button
                onClick={() => setIsEditingCredits(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg shadow-sm"
              >
                Update
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCredits}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-lg shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingCredits(false);
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 transition text-gray-800 rounded-lg shadow-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          {!isEditingCredits ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Total Credits</p>
                <p className="text-3xl font-semibold">{creditsData?.credits}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Currency</p>
                <p className="text-3xl font-semibold">
                  {creditsData?.currency}
                </p>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 mb-2">Platform Pricing</p>
                <ul className="space-y-1">
                  <li>
                    Android:{" "}
                    <span className="font-medium">
                      {creditsData?.platform_pricing?.android}
                    </span>
                  </li>
                  <li>
                    iOS:{" "}
                    <span className="font-medium">
                      {creditsData?.platform_pricing?.ios}
                    </span>
                  </li>
                  <li>
                    Web:{" "}
                    <span className="font-medium">
                      {creditsData?.platform_pricing?.web}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-600">Credits</label>
                <input
                  type="number"
                  value={creditsData.credits}
                  onChange={(e) =>
                    setCreditsData({
                      ...creditsData,
                      credits: Number(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Currency</label>
                <select
                  value={creditsData.currency}
                  onChange={(e) =>
                    setCreditsData({ ...creditsData, currency: e.target.value })
                  }
                  className="mt-2 w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Currency</option>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Android Price</label>
                <input
                  type="number"
                  value={creditsData.platform_pricing.android}
                  onChange={(e) =>
                    setCreditsData({
                      ...creditsData,
                      platform_pricing: {
                        ...creditsData.platform_pricing,
                        android: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2 w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">iOS Price</label>
                <input
                  type="number"
                  value={creditsData.platform_pricing.ios}
                  onChange={(e) =>
                    setCreditsData({
                      ...creditsData,
                      platform_pricing: {
                        ...creditsData.platform_pricing,
                        ios: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2 w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Web Price</label>
                <input
                  type="number"
                  value={creditsData.platform_pricing.web}
                  onChange={(e) =>
                    setCreditsData({
                      ...creditsData,
                      platform_pricing: {
                        ...creditsData.platform_pricing,
                        web: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2 w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
