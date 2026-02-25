import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { BackendService } from "../../Utils/Backend";
import { UPDATE_SPIN_WHEEL_CONFIGURATION } from "../../constants/ApiConstants";

interface EditSpinwheelNumberModalProps {
  onClose: () => void;
  editing?: any;
  onSubmit: () => void;
}

const SpinwheelConfigModal: React.FC<EditSpinwheelNumberModalProps> = ({
  onClose,
  onSubmit,
  editing,
}) => {
  const [value, setValue] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );

  useEffect(() => {
    // Pre-fill with existing number (if available)
    setValue(editing?.max_monthly_credits ?? "");
  }, [editing]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (value === "" || isNaN(Number(value))) {
      toast.error("Please enter a valid number");
      return;
    }

    setLoading(true);

    try {
      const payload = { max_monthly_credits: Number(value) };

      await BackendService.Post(
        {
          url: `${UPDATE_SPIN_WHEEL_CONFIGURATION}`,
          data: payload,
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Spinwheel value updated successfully!");
            onSubmit();
            onClose();
          },
          failure: (res) => {
            toast.error(
              res?.response?.data?.message ||
                "Failed to update the spinwheel."
            );
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Edit Spinwheel Value
        </h2>

        {/* Number Input */}
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value ? Number(e.target.value) : "")}
          placeholder="Enter spinwheel value"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-900"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinwheelConfigModal;
