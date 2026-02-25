import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BackendService } from "../../Utils/Backend";
import { SEATS_API } from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../icons";
import { useLocation } from "react-router-dom";
import { GET_ALL_ORGANIZATIONS } from "../../constants/ApiConstants";
import Select from "react-select";
interface StudentModalProps {
  onClose: () => void;
  onSubmit: () => void;
  number: String;
}

const AddStudentModal: React.FC<StudentModalProps> = ({
  onClose,
  number,
  onSubmit,
}) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [searchText, setSearchText] = useState("");
  const [filteredOrganizations, setFilteredOrganizations] = useState<any[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] =
    useState<boolean>(false);
  const id = params.get("id");
  const [image, setImage] = useState<any>(null);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    companyId: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoadingOrganizations(true);
      try {
        await BackendService.Get(
          {
            url: `${GET_ALL_ORGANIZATIONS}?page=1&limit=30&search=${searchText}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              setFilteredOrganizations(response?.data || []);
              setLoadingOrganizations(false);
            },
            failure: () => {
              toast.error("Failed to load companies");
              setLoadingOrganizations(false);
            },
          }
        );
      } catch (error) {
        toast.error("Something went wrong while loading companies");
        setLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, [admintoken, searchText]);

  const handleSubmit = async () => {
    if (!form.companyId) {
      toast.error("Please select the Organization");
      return;
    }
    setLoading(true);

    try {
      await BackendService.Post(
        {
          url: `${SEATS_API}/${form.companyId}/assign-students`,
          data: {
            mobile_number: number,
          },
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
          <h2 className="text-lg font-semibold">Allocate the Student</h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Select
              isLoading={loadingOrganizations}
              options={filteredOrganizations.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              onInputChange={(val) => setSearchText(val)}
              onChange={(option) =>
                setForm((prev) => ({ ...prev, companyId: option?.value || "" }))
              }
              value={
                form.companyId
                  ? {
                      value: form.companyId,
                      label:
                        filteredOrganizations.find(
                          (c) => c._id === form.companyId
                        )?.name || "Selected",
                    }
                  : null
              }
              placeholder="Search and select a Organization..."
            />
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

export default AddStudentModal;
