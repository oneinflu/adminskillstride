import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BackendService } from "../../Utils/Backend";
import { SEATS_API } from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../icons";
import { useLocation } from "react-router-dom";

interface StudentModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const BulkStudentModal: React.FC<StudentModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const [image, setImage] = useState<any>(null);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid Excel file (.xlsx or .xls)");
        return;
      }

      setImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      toast.error("Please upload an Excel file before submitting.");
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append("file", image);

    try {
      await BackendService.Form(
        {
          url: `${SEATS_API}/${id}/assign-students`,
          data: form,
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success("Students Allocated successfully!");
            onSubmit();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                "Failed to Allocate the students."
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Allocate the Students</h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <a
              href="/sample_students.xlsx"
              download
              className="text-blue-600 underline text-sm hover:text-blue-800"
            >
              Download Sample Excel Sheet
            </a>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              Upload Xlsx File:
            </label>
            {!image ? (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 transition"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16V4a4 4 0 014-4h2a4 4 0 014 4v12m-4 0v4m0 0H9m4 0h2"
                    ></path>
                  </svg>
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    Only .xlsx or .xls files
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative w-full h-48 border rounded overflow-hidden group">
                <img
                  src={
                    typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                  }
                  alt="Uploaded"
                  className="object-cover w-full h-full transition-opacity"
                />
                <button
                  type="button"
                  onClick={() => setImage(undefined)}
                  className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            {loading ? <Icons.loading /> : "Allocate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkStudentModal;
