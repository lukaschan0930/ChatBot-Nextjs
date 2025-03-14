import ShadowBtn from "./ShadowBtn";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Divider } from "@mui/material";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showSpread = '...';

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        // Add spread after 1 if needed
        if (start > 2) {
            pages.push(showSpread);
        }

        // Add pages around current page
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add spread before last page if needed
        if (end < totalPages - 1) {
            pages.push(showSpread);
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <>
            <Divider sx={{ bgcolor: "#25252799", my: "20px", width: "100%" }} />
            <div className="flex items-center justify-end gap-2 mt-4 w-full">
                <ShadowBtn
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    mainClassName="rounded-full disabled:opacity-50"
                    className="rounded-full"
                >
                    <ChevronLeft />
                </ShadowBtn>

                {getPageNumbers().map((page, index) => (
                    page === '...' ?
                        <div key={index} className="px-3 py-1 rounded border">
                            {page}
                        </div>
                        :
                        <ShadowBtn
                            key={index}
                            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                            disabled={page === currentPage}
                            mainClassName={`rounded-full ${page !== currentPage && 'bg-transparent'}`}
                            className="rounded-full"
                        >
                            {page}
                        </ShadowBtn>
                ))}

                <ShadowBtn
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    mainClassName="rounded-full disabled:opacity-50"
                    className="rounded-full"
                >
                    <ChevronRight />
                </ShadowBtn>
            </div>
        </>
    );
} 