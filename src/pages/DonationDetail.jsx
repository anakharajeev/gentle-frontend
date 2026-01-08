import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function DonationDetail() {
  const { id } = useParams(); 
  const [donations, setDonations] = useState([]);
  const [eventName, setEventName] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDonations();
  }, [search, page, pageSize]);

  const fetchDonations = async () => {
    try {
        const res = await API.get(`events/${id}/donations/`, {
        params: {
            search,
            page,
            page_size: pageSize,
        },
        });

        if (Array.isArray(res.data)) {
        setDonations(res.data);
        setTotal(res.data.length);
        } else {
        setDonations(res.data.results);
        setTotal(res.data.count);
        }

        if (res.data.results?.length > 0) {
        setEventName(res.data.results[0].event_title);
        } else {
        const eventRes = await API.get(`events/${id}/`);
        setEventName(eventRes.data.title);
        }

    } catch (err) {
        console.error("Error fetching donation details:", err);
    }
  };


  const totalPages = pageSize === "all" ? 1 : Math.ceil(total / parseInt(pageSize));

  return (
    <div className="p-3">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1 gap-2">
        <h1 className="text-[0.85rem] uppercase font-bold text-[#09203d]">{eventName}</h1>
        <div className="flex items-center gap-1">
          <div className="relative w-50 flex items-center">
              <Search
                size={12}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[#8291a7]"
              />
            <input
              type="text"
              placeholder="Search by donor name or email..."
              className="w-full rounded pr-3 py-1 pl-6 border"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>
          <select
            className="pl-[0.15rem] pr-1 py-1 rounded"
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(e.target.value); }}
          >
            <option value="5">05</option>
            <option value="10">10</option>
            <option value="50">50</option>
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
              <th>Donor Name</th>
              <th>Email</th>
              <th>Amount Received</th>
              <th>Donated On</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No donations found.
                </td>
              </tr>
            ) : (
              donations.map((d, idx) => (
                <tr key={d.id}>
                    <td>{(page - 1) * (pageSize === "all" ? total : parseInt(pageSize)) + idx + 1}</td>
                    <td>{d.donor}</td>
                    <td>{d.donor_email}</td>
                    <td>₹{d.amount}</td>
                    <td>{new Date(d.date).toLocaleDateString()}</td>
                </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize !== "all" && donations.length > 0 && (
        <div className="flex gap-2 mt-1.5 items-center justify-between">
          <span className="text-[0.6rem] text-[#687e9e]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="table-nav rounded"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="table-nav rounded"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
