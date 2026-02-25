import React, { useState } from "react";
import { BackendService } from "../../Utils/Backend";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { UPDATE_CREDIT, CREATE_CREDIT } from "../../constants/ApiConstants";

interface CreditsModalProps {
  onClose: () => void;
  editing?: any;
}

const CreditsModal: React.FC<CreditsModalProps> = ({ onClose, editing }) => {
  const [formData, setFormData] = useState({
    credits: editing?.no_of_credits || 0,
    amount: editing?.cost || 0,
    currency: editing?.currency || "",
  });
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.credits || formData.credits <= 0) {
      toast.error("Credits is required and must be greater than 0.");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error("Amount is required and must be greater than 0.");
      return;
    }

    if (!formData.currency || formData.currency.trim() === "") {
      toast.error("Currency is required.");
      return;
    }
    setLoading(true);

    const isEdit = !!editing?.id;
    try {
      const payload = {
        no_of_credits: formData?.credits,
        cost: formData?.amount,
        currency: formData?.currency
      };

      if (isEdit) {
        await BackendService.Patch(
          {
            url: `${UPDATE_CREDIT}/${editing?.id}`,
            data: payload,
            accessToken: admintoken,
          },
          {
            success: () => {
              toast.success(`Credit updated successfully!`);
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
        await BackendService.Post(
          {
            url: CREATE_CREDIT,
            accessToken: admintoken,
            data: payload,
          },
          {
            success: () => {
              toast.success(`Credit created successfully!`);
              onClose();
            },
            failure: (res) => {
              toast.error(
                res?.response?.data?.message ||
                  `Failed to create the Credit.`
              );
            },
          }
        );
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
          {editing?.id ? "Edit" : "Add"} Credit Pack
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Credits</label>
          <input
            type="number"
            name="credits"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={formData.credits}
            onChange={handleChange}
            placeholder="Enter number of credits"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={formData.currency}
            onChange={handleChange}
          >
            <option value="">Select Currency</option>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={formData.amount}
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
            {editing?.id ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsModal;
