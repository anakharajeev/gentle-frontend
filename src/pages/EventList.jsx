import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Calendar, Edit, Trash2, MapPin } from "lucide-react";
import empty from "../assets/empty.png";
import API from "../services/api";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [deleteEventId, setDeleteEventId] = useState(null);
  const [editEvent, setEditEvent] = useState(null);

  const [toast, setToast] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 8;

  const role = localStorage.getItem("user_role");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    image: null,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, query]);

  const fetchEvents = async () => {
    try {
      const res = await API.get("events/");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];
      setEvents(data);
    } catch (err) {
      console.error("FETCH EVENTS FAILED:", err);

      if (err.response?.status === 401) {
        showToast("Session expired. Please login again.");
        navigate("/login");
      }
    }
  };

  const applyFilters = () => {
    let data = [...events];

    if (query.trim() !== "") {
      data = data.filter((e) =>
        e.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFiltered(data);
    setPage(1);
  };

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totalPages = Math.ceil(filtered.length / perPage);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const validateForm = () => {
    return (
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.date.trim() !== "" &&
      formData.location.trim() !== ""
    );
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return showToast("All fields must be filled!");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });

      const res = await API.post("events/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEvents((prev) => [res.data, ...prev]);
      setShowAddModal(false);

      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        image: null,
      });

      showToast("Event created successfully!");
    } catch (err) {
      showToast("Failed to create event");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return showToast("All fields must be filled!");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });

      const res = await API.put(`events/${editEvent.id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEvents((prev) =>
        prev.map((e) => (e.id === editEvent.id ? res.data : e))
      );

      setEditEvent(null);
      showToast("Event updated successfully!");
    } catch (err) {
      showToast("Failed to update event");
    }
  };

  const openEdit = (event) => {
    setEditEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      image: null,
    });
  };

  const handleDelete = async () => {
    try {
      await API.delete(`events/${deleteEventId}/`);
      setEvents((prev) => prev.filter((e) => e.id !== deleteEventId));
      setDeleteEventId(null);
      showToast("Event deleted successfully!");
    } catch (err) {
      showToast("Delete failed");
    }
  };

  const isPastEvent = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eDate = new Date(eventDate);
    eDate.setHours(0, 0, 0, 0);

    return eDate < today;
  };

  return (
    <>
      <div className="px-4 py-2.5 animate-fadeInScale">
        {toast && (
          <div className="fixed top-5 z-[100] right-5 bg-[#e1f6f3] text-[#00ad93] text-[0.85rem] border border-solid border-[#ccf2ec] px-2 py-1 rounded shadow animate-fadeInScale">
            {toast}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
          <h1 className="text-xl uppercase font-bold text-[#09203d]">Events</h1>
          <div className="flex items-center gap-1">
            <div className="relative w-65 flex items-center">
              <Search
                size={17}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8291a7]"
              />
              <input
                type="text"
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded pr-3 py-1 pl-7 border"
              />
            </div>
            {(role === "admin" || role === "hr") && (
              <button
                onClick={() => {
                  setFormData({ 
                    title: "",
                    description: "",
                    date: "",
                    location: "",
                    image: null,
                  });
                  setShowAddModal(true);
                }}
                className="common-btn success-btn animate-slideUp"
              >
                <Plus size={16} />Add Event
              </button>
            )}
          </div>
        </div>
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <img src={empty} alt="No events" className="w-120 mb-4" />
            <p className="text-center text-[#09203d] text-[1.5rem]">
              No events found.
            </p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <img src={empty} alt="No match" className="w-120 mb-4" />
            <p className="text-center text-[#09203d] text-[1.5rem]">
              No matching events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginated.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded shadow p-3 animate-fadeInScale"
              >
                <div
                  className="relative h-53 w-full rounded mb-2 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover object-top"
                  />
                  {(role === "admin" || role === "hr") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(event);
                      }}
                      className="absolute top-1 right-1 bg-white cursor-pointer rounded-full p-1.5 shadow hover:bg-[#09203d] hover:text-white transition"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>

                <h2 className="text-[1.1rem] mb-0.5 font-bold text-[#09203d] cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>{event.title}</h2>
                <p className="text-[0.8rem] text-gray-500 flex align-middle gap-1.5">
                  <span className="flex align-middle gap-0.5"><Calendar size={16} /> {event.date}</span>
                  <span className="flex align-middle gap-0.5"><MapPin size={16} /> {event.location}</span>
                </p>
                <p className="mt-2 mb-2.5 text-gray-700 line-clamp-2 text-[0.85rem]">
                  {event.description}
                </p>
              
                <div className="flex items-center gap-1">
                  {isPastEvent(event.date) ? (
                    <button
                      disabled
                      className="common-btn disabled-btn btn-md w-full cursor-not-allowed"
                    >
                      Donations Closed
                    </button>
                  ) : (
                    <Link
                      to={`/events/${event.id}?donate=true`}
                      className="common-btn success-btn btn-md w-full animate-slideUp"
                    >
                      Donate
                    </Link>
                  )}
                  {(role === "admin" || role === "hr") && (
                    <button
                      onClick={() => setDeleteEventId(event.id)}
                      className="common-btn delete-btn btn-md animate-slideUp"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`common-btn btn-sm ${
                page === i + 1 ? "primary-btn" : "secondary-btn"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

      </div>

      {deleteEventId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center h-screen z-[100] animate-fadeBackdrop">
          <div className="bg-white py-5 px-4 rounded shadow w-80 animate-popIn">
            <h2 className="text-[1.25rem] font-bold text-[#09203d] text-center mb-2">Confirm Delete</h2>
            <p className="text-gray-600 text-[0.9rem] text-center">Are you sure you want to delete this event?</p>

            <div className="flex justify-center gap-1 mt-4">
              <button
                onClick={() => setDeleteEventId(null)}
                className="common-btn cancel-btn"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="common-btn danger-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center fixed h-screen z-[100] animate-fadeBackdrop">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full animate-popIn">
            <h2 className="text-[1.25rem] font-bold text-[#09203d] mb-3">Add Event</h2>

            <form onSubmit={handleCreate} className="flex flex-col gap-1.5">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="px-2 border rounded"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="px-2 border rounded"
                required
              />
              
              <div className="flex gap-1">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="px-2 border rounded w-full"
                  required
                />

                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="px-2 border rounded w-full"
                  required
                />
              </div>

              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="px-2 py-0.5 border rounded"
              />

              <div className="flex justify-end gap-1 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditEvent(null);  
                  }}
                  className="common-btn cancel-btn"
                >
                  Cancel
                </button>

                <button type="submit" className="common-btn success-btn">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editEvent && (
        <div className="inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center fixed h-screen z-[100] animate-fadeBackdrop">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full animate-popIn">
            <h2 className="text-[1.25rem] font-bold text-[#09203d] mb-3">Edit Event</h2>

            <form onSubmit={handleEdit} className="flex flex-col gap-1.5">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="px-2 border rounded"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                rows={3}
                onChange={handleChange}
                className="px-2 border rounded"
                required
              />

              <div className="flex gap-1">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="px-2 border rounded w-full"
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="px-2 border rounded w-full"
                  required
                />
              </div>

              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="px-2 py-0.5 border rounded"
              />

              <div className="flex justify-end gap-1 mt-3">
                <button
                  type="button"
                  onClick={() => setEditEvent(null)}
                  className="common-btn cancel-btn"
                >
                  Cancel
                </button>

                <button type="submit" className="common-btn success-btn">
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
