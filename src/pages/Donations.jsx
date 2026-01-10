import { useEffect, useState } from "react";
import { Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Donations() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
  }, [search, page, pageSize]);

  const fetchSummary = async () => {
    try {
      const res = await API.get("donations/summary/", {
        params: {
          search,
          page,
          page_size: pageSize,
        },
      });

      setRows(res.data.results || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Donation summary error:", err);
    }
  };

  const numericPageSize = pageSize === "all" ? total : Number(pageSize);
  const totalPages = Math.ceil(total / numericPageSize);

  return (
    <div className="px-4 py-2.5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
        <h1 className="text-lg uppercase font-bold text-[#09203d]">Donations</h1>
        {/* Search & Page Size */}
        <div className="flex items-center gap-1">
          <div className="relative w-85 flex items-center">
            <Search
              size={17}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8291a7]"
            />
            <input
              className="w-full rounded pr-3 py-1 pl-7 border"
              placeholder="Search event..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <select
            className="pl-[0.15rem] pr-1 py-1 rounded"
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(e.target.value === "all" ? "all" : Number(e.target.value));
            }}
          >
            <option value={5}>05</option>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>


      {/* Table */}
      <div className="table-wrapper">
        <table className="w-full">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Donation Name</th>
              <th>Date</th>
              <th>No. of Donations</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No events found
                </td>
              </tr>
            ) : (
              rows.map((d, idx) => (
                <tr key={d.id}>
                  {/* SL No */}
                  <td>
                    {(page - 1) * numericPageSize + idx + 1}
                  </td>
                  <td>{d.name}</td>
                  <td>{d.date}</td>
                  <td>{d.count}</td>
                  <td>₹{d.amount}</td>
                  <td>
                    <span
                      className={` text-white ${
                        d.count === 0
                        ? "bg-[#7c8aa2]"
                        : d.status === "Upcoming"
                        ? "bg-[#f18f2c]"
                        : "bg-[#00ad93]"
                      }`}
                    >
                      {d.count > 0 ? d.status : "No Donations"}
                    </span>
                  </td>
                  <td>
                    <button
                      disabled={d.count === 0}
                      onClick={() => d.count > 0 && navigate(`/donations/${d.id}`)}
                      className={`block ${
                        d.count > 0
                          ? "hover:text-[#316ed6]"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <Eye size={18}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize !== "all" && total > 0 && (
        <div className="flex gap-2 mt-1.5 items-center justify-between">
          <span className="text-[0.85rem] text-[#687e9e]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="table-nav rounded"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="table-nav rounded"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
