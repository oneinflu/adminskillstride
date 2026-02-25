import { Icons } from "../icons";

const UserDetailsModal = ({ isOpen, onClose, content, type }) => {
  if (!isOpen) return null;
  const formatDate = (dateString) => {
    if (!dateString) {
      console.warn("Date string is empty or undefined:", dateString);
      return "Not Available";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Invalid date";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getRandomColor = () => {
    const colors = [
      "#FF5722", // Dark Orange
      "#2196F3", // Blue
      "#FFC107", // Amber/Yellow
      "#4CAF50", // Green
      "#9C27B0", // Purple
      "#FF9800", // Deep Orange
      "#3F51B5", // Indigo
      "#607D8B", // Blue Gray
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-10">
      <div className="bg-white rounded-lg p-8 shadow-xl border-[1px] flex flex-col gap-5 relative max-w-[35vw]">
        <button
          onClick={onClose}
          className="absolute top-2 rounded-full right-2"
        >
          <Icons.close />
        </button>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {content?.image === null ? (
              <div
                className="h-[50px] w-[50px] rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: getRandomColor() }}
              >
                <p>{content?.name[0].toUpperCase()}</p>
              </div>
            ) : (
              <img
                src={content?.image}
                className="h-[50px] w-[50px] rounded-full"
              />
            )}
            <div>
              <h1 className="font-semibold text-base">{content?.name}</h1>
              {type === "Approval" ? (
                <p className="text-gray-700">
                  Joined on {formatDate(content?.requestedOn)}
                </p>
              ) : (
                <p className="text-gray-700">
                  Joined on {formatDate(content?.createdAt)}
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-semibold">Email</p>
            <h1 className="font-semibold text-base">{content?.email}</h1>
          </div>
          <div>
            <p className="text-gray-500 font-semibold">Zipcode</p>
            <h1 className="font-semibold text-base">
              {content?.zipcode || "Not Available"}
            </h1>
          </div>

          {type === "User" && (
            <div>
              <p className="text-gray-500 font-semibold">Phone Number</p>
              <h1 className="font-semibold text-base">
                {content?.phone
                  ? `${content?.country_code} ${content?.phone}`
                  : "Not Available"}
              </h1>
            </div>
          )}
          {type === "User" && (
            <div>
              <p className="text-gray-500 font-semibold">Current Role</p>
              <h1 className="font-semibold text-base">{content?.role}</h1>
            </div>
          )}

          <div>
            <p className="text-gray-500 font-semibold">Address</p>
            <h1 className="font-semibold text-base">
              {content?.address || "Not Available"}
            </h1>
          </div>
          {type === "User"  && (
            <div className="flex justify-between items-end gap-5">
              <div>
                <p className="text-gray-500 font-semibold">Documents</p>
                <div className="flex gap-3 overflow-auto">
                  {content?.proof?.length >= 1 ? (
                    content?.proof?.map((eachItem) => (
                      <img
                        src={eachItem}
                        className="w-[70px] h-[70px] mt-2 rounded-md"
                        key={eachItem}
                      />
                    ))
                  ) : <h1 className="font-semibold text-base">Not Available</h1>}
                </div>
              </div>
            </div>
          )}
          {type === "Approval" && (
            <div className="flex justify-between items-end gap-5">
              <div>
                <p className="text-gray-500 font-semibold">Documents</p>
                <div className="flex gap-3 overflow-auto">
                  {content?.proof?.map((eachItem) => (
                    <img
                      src={eachItem}
                      className="w-[70px] h-[70px] mt-2 rounded-md"
                      key={eachItem}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
