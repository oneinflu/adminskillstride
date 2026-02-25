import React, { useState } from "react";
import { BackendService } from "../../Utils/Backend";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { UPDATE_SPIN_WHEEL_ITEM } from "../../constants/ApiConstants";

interface CreditsModalProps {
  onClose: () => void;
  editing?: any;
}

const SpinWheelModal: React.FC<CreditsModalProps> = ({ onClose, editing }) => {
  const [formData, setFormData] = useState({
    type: editing?.type || "",
    message: editing?.message || "",
    credits: editing?.credits || "",
  });
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!editing?._id;
    try {
      const payload = {
        _id: editing?._id,
        index: editing?.index,
        type:formData.type,
        message:formData.message,
        credits:formData.credits
      };

      if (isEdit) {
        await BackendService.Post(
          {
            url: `${UPDATE_SPIN_WHEEL_ITEM}`,
            data: payload,
            accessToken: admintoken,
          },
          {
            success: () => {
              toast.success(`Spin Wheel updated successfully!`);
              onClose();
            },
            failure: (res) => {
              toast.error(
                res?.response?.data?.message ||
                  `Failed to update the Credit.`
              );
            },
          }
        );
      } else {
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {editing?.id ? "Edit" : "Add"} Spin Wheel Item
        </h2>
        <div className="flex flex-col gap-2 mt-3">
          <label className="text-sm font-medium ">Select Type</label>
          <select
            value={formData.type}
            name="type"
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border"
          >
            <option value="">Select Type</option>
            <option value="COINS">Coins</option>
            <option value="BETTER_LUCK_NEXT_TIME">Better luck next time</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Message</label>
          <input
            name="message"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter Message"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Credits</label>
          <input
            type="number"
            name="credits"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={formData.credits}
            onChange={handleChange}
            placeholder="Enter amount"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-gray-900 text-white rounded"
            onClick={handleSubmit}
          >
            {editing?._id ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelModal;
