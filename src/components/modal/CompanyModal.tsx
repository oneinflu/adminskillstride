import React, { useState, useEffect } from "react";
import { BackendService } from "../../Utils/Backend";
import { ADD_COMPANY, EDIT_COMPANY } from "../../constants/ApiConstants";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import countryTelephoneData from "country-telephone-data";
import Select from "react-select";
import { X } from "lucide-react";
import { imageUpload } from "../ImageUpload";
import { Icons } from "../icons";

interface Props {
  onClose: () => void;
  editing?: any;
  onSubmit: () => void;
}

const CompanyModal: React.FC<Props> = ({ editing, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<any>(editing?.image || null);
  const [countryCode, setCountryCode] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [person, setPerson] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{
    countryCode?: string;
    mobileNumber?: string;
  }>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      toast("File size must be less than 20MB");
      e.target.value = "";
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const companyTypeOptions = [
    { value: "PVT", label: "Private (PVT)" },
    { value: "CONTRACT", label: "Contract" },
  ];

  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const countryOptions = countryTelephoneData.allCountries.map((country) => ({
    value: country.dialCode,
    label: `${country.name}`,
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing?._id) {
      setName(editing?.company_name);
      setPerson(editing?.authorized_person);
      setCountryCode(editing?.country_code);
      setMobileNumber(editing?.phone_number);
      setCompanyType(editing?.type);
      setCompanyEmail(editing?.email);
      setAddress(editing?.address);
    }
  }, [editing]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name?.trim()) {
      toast.error("Company name is required.");
      return;
    }
    if (name.trim().length < 3) {
      toast.error("Company name must be at least 3 characters long.");
      return;
    }
    if (name.trim().length >= 50) {
      toast.error("Company name cannot exceed 50 characters.");
      return;
    }
    if (!countryCode) {
      toast.error("Country code is required.");
      return;
    }
    if (!mobileNumber?.trim()) {
      toast.error("Phone number is required.");
      return;
    }
    if (!/^\d+$/.test(mobileNumber)) {
      toast.error("Phone number must contain only digits.");
      return;
    }
    if (!companyType) {
      toast.error("Company type is required.");
      return;
    }
    if (!companyEmail?.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!person?.trim()) {
      toast.error("Authorized person name is required.");
      return;
    }
    if (!address?.trim()) {
      toast.error("Address is required.");
      return;
    }

    // --- If validation passes, continue ---
    setLoading(true);
    const isEdit = editing?._id;

    let imageUrl: string | null = null;
    if (image) {
      if (typeof image === "string") {
        // already uploaded (editing, unchanged)
        imageUrl = image;
      } else {
        // it's a File object → upload it
        imageUrl = await imageUpload(image, "Thumbnail", admintoken);
        if (!imageUrl) {
          setLoading(false);
          return; // stop if upload failed
        }
      }
    }

    try {
      let payload: any = {};

      if (isEdit) {
        // Only send these 3 fields while editing
        payload = {
          company_name: name,
          authorized_person: person,
          type: companyType,
          address: address,
          image: imageUrl,
        };
      } else {
        // Send all fields while creating
        payload = {
          company_name: name,
          country_code: countryCode,
          phone_number: mobileNumber,
          type: companyType,
          email: companyEmail,
          authorized_person: person,
          address: address,
          image: imageUrl,
        };
      }

      if (isEdit) {
        await BackendService.Patch(
          {
            url: `${EDIT_COMPANY}/${editing?._id}`,
            data: payload,
            accessToken: admintoken,
          },
          {
            success: () => {
              toast.success(`Company updated successfully!`);
              onSubmit();
            },
            failure: (res) => {
              toast.error(
                res?.response?.data?.message || `Failed to update the Company.`
              );
            },
          }
        );
      } else {
        await BackendService.Post(
          {
            url: ADD_COMPANY,
            accessToken: admintoken,
            data: payload,
          },
          {
            success: () => {
              toast.success(`Company created successfully!`);
              onSubmit();
            },
            failure: (res) => {
              toast.error(
                res?.response?.data?.message || `Failed to create the Company.`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-[70%] max-w-3xl shadow-xl">
        <div className="flex items-center justify-between relative mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editing?._id ? "Edit Company" : "Add Company"}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Company Name + Authorized Person */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Authorized Person
              </label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Authorized Person"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Contact Number + Email (only if not editing) */}
          {!editing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <div className="flex gap-2">
                  <Select
                    name="countryCode"
                    options={countryOptions.map((option) => ({
                      ...option,
                      label: `+${option.value}`,
                    }))}
                    value={
                      countryCode
                        ? {
                            label: countryCode,
                            value: countryCode.replace("+", ""),
                          }
                        : { label: "Select", value: "" }
                    }
                    onChange={(option) => setCountryCode(`+${option.value}`)}
                    isDisabled={loading}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderWidth: "2px",
                        borderRadius: "8px",
                        padding: "2px",
                        width: "112px",
                        backgroundColor: "transparent",
                      }),
                    }}
                  />
                  <input
                    type="text"
                    name="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    disabled={loading}
                    placeholder="Enter number"
                    className="flex-1 border-2 rounded-lg px-3 py-2 border-[#DBD8D8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Row 3: Company Type + Address */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Type
              </label>
              <Select
                options={companyTypeOptions}
                value={
                  companyTypeOptions.find((opt) => opt.value === companyType) ||
                  null
                }
                onChange={(opt) => setCompanyType(opt?.value || "")}
                placeholder="Select company type"
                isDisabled={loading}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderWidth: "2px",
                    borderRadius: "8px",
                    padding: "2px",
                    backgroundColor: "transparent",
                  }),
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 4: Image Upload Centered */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              Upload Image:
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
                    drag and drop ( optional )
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 20MB</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
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
              className={`flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"
              }`}
            >
              {loading ? <Icons.loading /> : <>{editing ? "Save" : "Add"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyModal;
