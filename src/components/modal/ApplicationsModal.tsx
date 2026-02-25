import React, { useState, useEffect } from "react";
import { BackendService } from "../../Utils/Backend";
import { UPDATE_JOB_APPLIED_STATUS } from "../../constants/ApiConstants";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

interface Props {
  onClose: () => void;
  editing?: any;
}

enum APPLICATION_STATUS {
  APPLIED = "APPLIED",
  REVOKED = "REVOKED",
  REJECTED = "REJECTED",
  PLACED = "PLACED",
  SHORTLISTED = "SHORTLISTED",
}

const ApplicationsModal: React.FC<Props> = ({ editing, onClose }) => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<APPLICATION_STATUS>(
    editing?.status || APPLICATION_STATUS.APPLIED
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await BackendService.Patch(
        {
          url: UPDATE_JOB_APPLIED_STATUS,
          data: { applicationId: editing?._id, status },
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Job status updated successfully!");
            onClose();
          },
          failure: (res) => {
            toast.error(
              res?.response?.data?.message ||
                "Failed to update job status."
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Job Status</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Select Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as APPLICATION_STATUS)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(APPLICATION_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationsModal;
