import React, { useState } from "react";
import { BackendService } from "../../Utils/Backend";
import { UPDATE_SUBSCRIPTION_PLAN } from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { X } from "lucide-react";

interface SubscriptionPayload {
  _id?: string;
  type: "MONTHLY" | "YEARLY";
  price: number;
  discount_price?: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE";
  features: string[];
  has_free_trail: boolean;
  free_trail_count?: number;
  free_trail_type?: string;
  web_price: number;
  android_price: number;
  ios_price: number;
}

interface SubscriptionModalProps {
  onClose: () => void;
  initialData?: SubscriptionPayload;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  onClose,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    _id: initialData?._id,
    type: initialData?.type || "MONTHLY",
    web_price: initialData?.web_price || 0,
    android_price: initialData?.android_price || 0,
    ios_price: initialData?.ios_price || 0,
    price: initialData?.price || 0,
    discount_price: initialData?.discount_price || 0,
    currency: initialData?.currency || "USD",
    status: initialData?.status || "ACTIVE",
    features: initialData?.features || [""],
    has_free_trail: initialData?.has_free_trail || false,
    free_trail_count: initialData?.free_trail_count || 0,
    free_trail_type: initialData?.free_trail_type || "DAYS",
  });

  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const handleSubmit = async () => {
    if (!formData.type) {
      toast.error("Subscription type is required");
      return;
    }

    if (!formData.web_price || !formData.android_price || !formData.ios_price) {
      toast.error("All price fields (Web, Android, iOS) are required");
      return;
    }

    if (
      formData.web_price <= 0 ||
      formData.android_price <= 0 ||
      formData.ios_price <= 0
    ) {
      toast.error("All prices must be greater than 0");
      return;
    }

    const prices = [
      formData.web_price,
      formData.android_price,
      formData.ios_price,
      formData.discount_price,
    ].filter(Boolean);

    const exceedsLimit = prices.some((price) => price.toString().length > 6);

    if (exceedsLimit) {
      toast.error("Price values must not exceed 6 digits");
      return;
    }

    if (
      formData.discount_price &&
      (formData.discount_price > formData.web_price ||
        formData.discount_price > formData.android_price ||
        formData.discount_price > formData.ios_price)
    ) {
      toast.error("Discount cannot be greater than any of the prices");
      return;
    }

    if (!formData.currency) {
      toast.error("Currency is required");
      return;
    }

    if (!formData.status) {
      toast.error("Status is required");
      return;
    }

    if (
      !formData.features ||
      formData.features.length === 0 ||
      formData.features.some((f) => f.trim() === "")
    ) {
      toast.error("At least one valid feature is required");
      return;
    }

    if (formData.has_free_trail) {
      if (!formData.free_trail_count || formData.free_trail_count <= 0) {
        toast.error("Free trial count must be greater than 0");
        return;
      }
      if (!formData.free_trail_type) {
        toast.error("Free trial type is required");
        return;
      }
    }

    setLoading(true);
    const isEdit = !!initialData?._id;

    const payload = isEdit
      ? { _id: initialData._id, ...formData }
      : { ...formData };

    try {
      await BackendService.Post(
        {
          url: isEdit ? UPDATE_SUBSCRIPTION_PLAN : "",
          data: payload,
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success(
              isEdit
                ? "Subscription updated successfully!"
                : "Subscription created successfully!"
            );
            onClose();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                (isEdit
                  ? "Failed to update the subscription."
                  : "Failed to create the subscription.")
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-xl p-6 rounded-lg shadow-lg overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between relative">
          <h2 className="text-xl font-bold mb-4">
            {initialData ? "Edit" : "Add"} Subscription
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        {/* Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="type"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        {/* Price & Discount */}
        {/* Price & Discount */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Web Price
            </label>
            <input
              type="number"
              name="web_price"
              className="w-full px-4 py-2 border border-gray-300 rounded"
              value={formData.web_price}
              onChange={handleChange}
              min={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Android Price
            </label>
            <input
              type="number"
              name="android_price"
              className="w-full px-4 py-2 border border-gray-300 rounded"
              value={formData.android_price}
              onChange={handleChange}
              min={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              iOS Price
            </label>
            <input
              type="number"
              name="ios_price"
              className="w-full px-4 py-2 border border-gray-300 rounded"
              value={formData.ios_price}
              onChange={handleChange}
              min={1}
            />
          </div>
        </div>

        {/* Discount Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Price (applies to all)
          </label>
          <input
            type="number"
            name="discount_price"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={formData.discount_price}
            onChange={handleChange}
            min={0}
          />
        </div>

        {/* Currency & Status */}
        <div className="mb-4 grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              className="w-full px-4 py-2 border border-gray-300 rounded"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="IN_ACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Features
          </label>
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeFeature(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
            onClick={addFeature}
          >
            + Add Feature
          </button>
        </div>

        {/* Free Trial */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            name="has_free_trail"
            checked={formData.has_free_trail}
            onChange={handleChange}
          />
          <label className="text-sm font-medium text-gray-700">
            Has Free Trial
          </label>
        </div>

        {formData.has_free_trail && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trial Count
              </label>
              <input
                type="number"
                name="free_trail_count"
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={formData.free_trail_count}
                onChange={handleChange}
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trial Type
              </label>
              <select
                name="free_trail_type"
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={formData.free_trail_type}
                onChange={handleChange}
              >
                <option value="DAYS">Days</option>
                <option value="WEEKS">Weeks</option>
                <option value="MONTHS">Months</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-gray-900 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            {initialData ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
