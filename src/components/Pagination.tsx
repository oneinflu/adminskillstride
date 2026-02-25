import React from "react";
import { Icons } from "./icons";

type PaginationProps = {
  id: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  displayRange?: number;
};

const Pagination: React.FC<PaginationProps> = ({
  id,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages, currentPage + 1);

      pages.push(1);
      if (startPage > 2) pages.push("ellipsis-left");
      for (
        let i = Math.max(2, startPage);
        i <= Math.min(endPage, totalPages - 1);
        i++
      ) {
        pages.push(i);
      }
      if (endPage < totalPages - 1) pages.push("ellipsis-right");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getVisiblePages();

  const handlePageClick = (
    pageNumber: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    onPageChange(pageNumber);
    if (!window.location.pathname.includes("organizer")) {
      scrollToElement();
    }
  };

  const scrollToElement = () => {
    if (window.location.pathname !== "/") {
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      setTimeout(() => {
        const element = document.getElementById("event");
        if (element) {
          const offsetPosition = element.offsetTop - 78;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  return (
    <div className="flex items-center w-[100%] gap-2 md:gap-[12px] justify-center md:justify-start">
      <button
        onClick={() => {
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
            if (!window.location.pathname.includes("organizer")) {
              scrollToElement();
            }
          }
        }}
        disabled={currentPage === 1}
        className={`flex justify-center items-center rounded-[7.62px] w-10 h-10 border-2 border-solid border-[#F3F3F3] bg-[#fff] ${currentPage === 1
          ? "text-[#808080]"
          : "text-black "
          }`}
      >
        <Icons.prev/>
      </button>

      {pages.map((page, index) => {
        if (page === "ellipsis-left" || page === "ellipsis-right") {
          return (
            <span className="text-primary mx-1 border-2 rounded-[7.62px] border-solid border-[#F3F3F3] bg-[#fff] w-10 h-10 flex justify-center items-center" key={index}>
              ...
            </span>
          );
        }

        return (
          <button
            key={index}
            onClick={(e) => handlePageClick(page as number, e)}
            className={`flex justify-center items-center rounded-[7.62px] w-10 h-10 ${currentPage === page
              ? "bg-gray-900 text-white border-2 "
              : " text-[#808080] border-2 border-solid border-[#F3F3F3] bg-[#fff]"
              }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => {
          if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
            if (!window.location.pathname.includes("organizer")) {
              scrollToElement();
            }
          }
        }}
        disabled={currentPage === totalPages}
        className={`flex justify-center items-center rounded-[7.62px] w-10 h-10 border-2 border-solid border-[#F3F3F3] bg-[#fff] ${currentPage === totalPages
          ? "text-[#808080]"
          : "text-black "
          }`}
      >
        <Icons.nextItem />
      </button>
    </div>
  );
};

export default Pagination;

