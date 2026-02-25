import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BackendService } from "../../Utils/Backend";
import { INTIATE_EXPORT } from "../../constants/ApiConstants";
import { useSelector } from "react-redux";

const ExportFilterModal = ({ isOpen, onClose, dataType }) => {
  const [loading, setLoading] = useState(false);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [formData, setFormData] = useState({
    from_date: "",
    to_date: "",
    type: dataType,
  });

  if (!isOpen) return null;

  const handleExport = async () => {
      try {
        const response = BackendService.Post(
          {
            url: `${INTIATE_EXPORT}`,
            data: {
                from_date: formData.from_date,
                to_date : formData.to_date,
                type: formData.type
            },
            accessToken: admintoken,
          },
          {
            success: () => {
                toast.success("Export request created successfully!");
                setLoading(false);
                onClose(); 
            },
            failure: () => {
                toast.error("Failed to create export request!");
                setLoading(false);
            },
          }
        );
      } catch (error) {
        toast.error(
          "Something went wrong while deleting Advertisement. Please try again!"
        );
      }
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-lg">
        
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Export Data
        </h2>

        <div className="space-y-4">
          {/* From Date */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              value={formData.from_date}
              onChange={(e) =>
                setFormData({ ...formData, from_date: e.target.value })
              }
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              To Date
            </label>
            <input
              type="date"
              value={formData.to_date}
              onChange={(e) =>
                setFormData({ ...formData, to_date: e.target.value })
              }
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-gray-900 text-white px-4 py-2 rounded-md transition"
          >
            {loading ? "Processing..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportFilterModal;
