import React, { useState, useEffect } from "react";
import { BackendService } from "../Utils/Backend";
import { toast } from "react-toastify";
import {
  GET_SPIN_WHEEL,
  GET_SPIN_WHEEL_CONFIGURATION,
} from "../constants/ApiConstants";
import { useSelector } from "react-redux";
import SpinWheelModal from "../components/modal/SpinWheelModal";
import AddModal from "../components/modal/AddModal";
import SpinwheelConfigModal from "../components/modal/SpinWheelConfigModal";

const SpinWheel = () => {
  const [items, setItems] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<any>([]);
  const [editSpinWheel, setEditSpinWheel] = useState<any>([]);
  const [spinLoading, setSpinLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [spinWheelConfigData, setSpinWheelConfigData] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_SPIN_WHEEL}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setItems(response);
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

  const fetchSpinWheelConfigurationData = async () => {
    setSpinLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_SPIN_WHEEL_CONFIGURATION}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setSpinWheelConfigData(response?.data);
            setSpinLoading(false);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
            setSpinLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "something went wrong. please try again"
      );
      setSpinLoading(false);
    }
  };
  useEffect(() => {
    fetchData(), fetchSpinWheelConfigurationData();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setEditSpinWheel(null)
  };

  const handleSubmitClose = () => {
    setShowModal(false);
    setEditSpinWheel(null)
    if (!editSpinWheel) {
      fetchSpinWheelConfigurationData();
    } else {
      fetchSpinWheelConfigurationData();
    }
  };

  return (
    <div className="p-6">
      <div className="md:col-span-2 bg-white shadow-md rounded-2xl p-4 w-full ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Spin Wheel Items</h1>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Index</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Credits</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((i) => (
              <tr key={i.id} className="text-center">
                <td className="p-2 border">{i?.index}</td>
                <td className="p-2 border">{i?.type}</td>
                <td className="p-2 border">{i?.credits}</td>
                <td className="p-2 border">{i?.message || "Not Available"}</td>
                <td className="p-2 border flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setEditItem(i), setIsModalOpen(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:col-span-2 bg-white shadow-md rounded-2xl p-4 w-full ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Max monthly Credits Limit</h1>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Max Monthly Limit</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">
                {spinWheelConfigData?.max_monthly_credits || "Not Available"}
              </td>
              <td className="p-2 border flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setEditSpinWheel(spinWheelConfigData), setShowModal(true);
                  }}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <SpinWheelModal
          onClose={() => {
            setIsModalOpen(false), fetchData();
          }}
          editing={editItem}
        />
      )}
      {showModal && (
        <SpinwheelConfigModal
          onClose={handleClose}
          editing={editSpinWheel}
          onSubmit={handleSubmitClose}
        />
      )}
    </div>
  );
};

export default SpinWheel;
