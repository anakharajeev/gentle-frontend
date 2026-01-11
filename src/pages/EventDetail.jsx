import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import API from "../services/api";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [donations, setDonations] = useState([]);
  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [toast, setToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const role = localStorage.getItem("user_role");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    image: null,
  });

  useEffect(() => {
    fetchEvent();
    fetchDonations();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await API.get(`events/${id}/`);
      const eventData = {
        ...res.data,
        total_donations: Number(res.data.total_donations || 0),
      };
      setEvent(eventData);
      setFormData({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        image: null,
      });
    } catch (err) {
      console.error(err);
      setEvent(null);
      setErrorMsg("Unable to load event");
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await API.get(`events/${id}/donations/`, {
        params: { page: 1, page_size: 100 } 
      });
      setDonations(res.data.results); 
    } catch (err) {
      console.error(err);
      setDonations([]);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const presets = [500, 1000, 1500];

  const onSelectPreset = (p) => {
    setPreset(p);
    setAmount(String(p));
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`events/${id}/`);
      showToast("Event deleted successfully");
      setDeleteModalOpen(false);
      setTimeout(() => navigate("/"), 1000);
    } catch {
      showToast("Delete failed");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("date", formData.date);
    fd.append("location", formData.location);
    if (formData.image) fd.append("image", formData.image);

    try {
      await API.put(`events/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Event updated successfully");
      setEditModalOpen(false);
      fetchEvent();
    } catch {
      showToast("Update failed");
    }
  };

const handleDonationSubmit = async () => {
  if (isEventEnded) return showToast("This event has already ended");

  const amountNumber = Number(amount);
  if (!amount || amountNumber <= 0) return showToast("Enter a valid amount");

  try {
  
    await API.post(`events/${id}/donations/`, {
      amount: amountNumber,
    });

    setPaymentModalOpen(false);
    setAmount("");
    setPreset(null);

    setSuccessModalOpen(true);

    fetchEvent();
    fetchDonations();

  } catch (err) {
    console.error(err);
    showToast(
      err.response?.data?.detail || "Donation failed"
    );
  }
};


  if (!event) return <p>Loading...</p>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0);

  const isEventEnded = eventDate < today;

  const totalDonations = Array.isArray(donations)
  ? donations.reduce((s, d) => s + Number(d.amount || 0), 0)
  : 0;

  return (
    <>
      <div className="p-4 animate-fadeInScale">
        {toast && (
          <div className="fixed top-5 z-[100] right-5 bg-[#e1f6f3] text-[#00ad93] text-[0.85rem] border border-solid border-[#ccf2ec] px-2 py-1 rounded shadow animate-fadeInScale">
            {toast}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white p-4 rounded shadow">
            

            {event.image && (
              <img src={event.image} alt={event.title} className="w-full h-100 object-cover object-top rounded mb-2.5" />
            )}
            <h1 className="text-[1.25rem] uppercase font-bold text-[#09203d] mb-1">{event.title}</h1>
            <p className="text-[0.85rem] text-gray-500 flex align-middle gap-1.5">
              <span className="flex align-middle gap-0.5"><Calendar size={16} />{event.date}</span>
              <span className="flex align-middle gap-0.5"><MapPin size={16} />{event.location}</span>
            </p>
            <p className="mt-2.5 text-gray-700 text-[0.95rem]">{event.description}</p>

            {(role === "admin" || role === "hr") && (
              <div className="flex gap-1 mt-3">

                <button
                  className="common-btn danger-btn animate-slideUp"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete
                </button>
                <button
                  className="common-btn success-btn animate-slideUp"
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit
                </button>

              </div>
            )}

            <hr className="my-3 border-t-[#ebebeb]" />

            <h3 className="text-[1.25rem] font-semibold text-[#09203d] mb-1">Donations</h3>

            {event.total_donations > 0 ? (
                <p className="text-gray-600 text-[0.95rem] mb-2">
                  Total Donations Received: <span className="text-[#00ad93] text-[1.2rem] font-semibold italic">₹{event.total_donations}</span>
                </p>
              ) : (
                <p className="text-gray-600 text-[0.95rem] mb-2">No donations yet.</p>
              )}
          </div>

          <aside className="bg-white p-4 h-fit rounded shadow">
            <h3 className="text-[1.25rem] uppercase font-bold text-[#09203d] mb-2">Donate Now</h3>
            <p className="text-gray-700 text-[0.95rem]">Support this event</p>

            <div className="mt-3">
              <span className="text-[0.95rem] bg-gray-100 px-3 py-1 rounded inline-block">
                Total donations received: <span className="pl-1 font-semibold">₹{totalDonations}</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => onSelectPreset(p)}
                  className={`px-1.5 py-1 text-[0.95rem] rounded border text-[#08203d] border-solid border-[#eaeef8] hover:bg-[#09203d] hover:text-white cursor-pointer ${
                    preset === p ? "bg-[#09203d] text-white" : "bg-gray-50"
                  }`}
                >
                  ₹{p}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-[0.85rem] mb-1">Or enter custom amount</label>
              <input
                className="px-2 border rounded"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setPreset(null);
                }}
              />
            </div>

            <button
              className={`mt-4 w-full px-2 h-[2rem] text-[1rem] rounded ${
                isEventEnded
                  ? "common-btn disabled-btn btn-md cursor-not-allowed"
                  : "common-btn success-btn btn-md"
              }`}
              disabled={isEventEnded}
              onClick={() => !isEventEnded && setPaymentModalOpen(true)}
            >
              {isEventEnded ? "Donations Closed" : "Donate Now"}
            </button>

          </aside>
        </div>
      </div>
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center h-screen z-[100] animate-fadeBackdrop">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full animate-popIn">
            <h2 className="text-[1.25rem] font-bold text-[#09203d] mb-3">Edit Event</h2>

            <form onSubmit={handleEdit} className="flex flex-col gap-1.5">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-2 border rounded"
                required
              />

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-2 border rounded"
                rows={3}
                required
              />

              <div className="flex gap-1">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="px-2 border rounded w-full"
                  required
                />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="px-2 border rounded w-full"
                  required
                />
              </div>
           
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="px-2 py-0.5 border rounded"
              />

              <div className="flex justify-end gap-1 mt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="common-btn cancel-btn"
                >
                  Cancel
                </button>

                <button type="submit" className="common-btn success-btn">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center h-screen z-[100] animate-fadeBackdrop">
          <div className="bg-white py-5 px-4 rounded shadow w-80 animate-popIn">
            <h2 className="text-[1.25rem] font-bold text-[#09203d] text-center mb-2">Confirm Delete</h2>
            <p className="text-gray-600 text-[0.9rem] text-center">Are you sure you want to delete this event?</p>

            <div className="flex justify-center gap-1 mt-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="common-btn cancel-btn"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="common-btn danger-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center h-screen z-[100] animate-fadeBackdrop">
          <div className="bg-white py-5 px-4 rounded shadow w-70 animate-popIn">
            <h3 className="text-[1.25rem] font-bold text-[#09203d] text-center mb-3">Confirm Donation</h3>

            <div className="flex justify-center gap-1 mb-4">
              <span className="text-gray-700 text-[0.95rem]">Amount:</span>
              <span className="text-[#00ad93] text-[1rem] font-semibold italic">₹{amount}</span>
            </div>

            <div className="flex justify-center gap-1 mt-4">
              <button
                className="common-btn cancel-btn"
                onClick={() => setPaymentModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className={`px-2 common-btn rounded ${
                  isEventEnded
                    ? "disabled-btn cursor-not-allowed"
                    : "success-btn"
                }`}
                disabled={isEventEnded}
                onClick={handleDonationSubmit}
              >
                Proceed
              </button>

            </div>
          </div>
        </div>
      )}

      {successModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center h-screen z-[100] animate-fadeBackdrop">
          <div className="bg-white py-5 px-4 rounded shadow w-70 animate-popIn">
            <h2 className="text-[1.25rem] font-bold text-[#09203d] text-center mb-3">Donation Successful 🎉</h2>
            <p className="text-gray-700 text-center text-[0.9rem] mb-4">Thank you for your support!</p>
            <button
              className="mx-auto px-2 common-btn cancel-btn"
              onClick={() => setSuccessModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
