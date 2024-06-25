import { useState, useEffect } from "react";
import "./Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventName, setNewEventName] = useState("");
  const [donations, setDonations] = useState([]);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        "https://templefundbackend.onrender.com/events"
      );
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchDonations = async (eventId) => {
    try {
      const response = await fetch(
        `https://templefundbackend.onrender.com/donations/${eventId}`
      );
      const data = await response.json();
      setDonations(data);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEventName !== "") {
      try {
        const response = await fetch(
          "https://templefundbackend.onrender.com/events",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newEventName }),
          }
        );
        const newEvent = await response.json();
        setEvents([...events, newEvent]);
        setNewEventName("");
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await fetch(`https://templefundbackend.onrender.com/events/${eventId}`, {
        method: "DELETE",
      });
      setEvents(events.filter((event) => event._id !== eventId));
      setDonations(
        donations.filter((donation) => donation.eventId !== eventId)
      );
      if (selectedEvent === eventId) {
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (editingEvent) {
      try {
        const response = await fetch(
          `https://templefundbackend.onrender.com/events/${editingEvent._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: editingEvent.name }),
          }
        );
        const updatedEvent = await response.json();
        setEvents(
          events.map((event) =>
            event._id === editingEvent._id ? updatedEvent : event
          )
        );
        setEditingEvent(null);
      } catch (error) {
        console.error("Error updating event:", error);
      }
    }
  };

  const handleAddDonation = async (e) => {
    e.preventDefault();
    const amount = parseInt(e.target.amount.value);
    const fullName = e.target.fullName.value;
    if (amount > 0 && fullName.trim() !== "" && selectedEvent) {
      try {
        const response = await fetch(
          "https://templefundbackend.onrender.com/donations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventId: selectedEvent,
              amount,
              fullName: fullName.trim(),
            }),
          }
        );
        const newDonation = await response.json();
        setDonations([...donations, newDonation]);
        e.target.reset();
      } catch (error) {
        console.error("Error adding donation:", error);
      }
    }
  };

  const handleEditDonation = (donation) => {
    setEditingDonation({ ...donation });
  };

  const handleUpdateDonation = async (e) => {
    e.preventDefault();
    if (editingDonation) {
      try {
        const response = await fetch(
          `https://templefundbackend.onrender.com/donations/${editingDonation._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: editingDonation.amount,
              fullName: editingDonation.fullName,
            }),
          }
        );
        const updatedDonation = await response.json();
        setDonations(
          donations.map((d) =>
            d._id === editingDonation._id ? updatedDonation : d
          )
        );
        setEditingDonation(null);
      } catch (error) {
        console.error("Error updating donation:", error);
      }
    }
  };

  const handleDeleteDonation = async (donationId) => {
    try {
      await fetch(
        `https://templefundbackend.onrender.com/donations/${donationId}`,
        {
          method: "DELETE",
        }
      );
      setDonations(donations.filter((d) => d._id !== donationId));
    } catch (error) {
      console.error("Error deleting donation:", error);
    }
  };

  const getEventDonations = (eventId) => {
    fetchDonations(eventId);
  };

  const selectedEventDetails = events.find(
    (event) => event._id === selectedEvent
  );

  const csvData = donations.map((donation) => ({
    amount: donation.amount,
    fullName: donation.fullName,
  }));

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <h2 className="sidebar-title">Events</h2>
        <div className="add-event-container">
          <input
            type="text"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            placeholder="New event name"
            className="add-event-input"
          />
          <button
            type="submit"
            onClick={handleAddEvent}
            className="add-event-button"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Event
          </button>
        </div>
        <ul className="event-list">
          {events.map((event) => (
            <li key={event._id} className="event-item">
              {editingEvent?._id === event._id ? (
                <form onSubmit={handleUpdateEvent}>
                  <input
                    type="text"
                    value={editingEvent?.name}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, name: e.target.value })
                    }
                    className="edit-event-input"
                  />
                  <button type="submit" className="update-event-button">
                    Update
                  </button>
                </form>
              ) : (
                <>
                  <span
                    onClick={() => {
                      setSelectedEvent(event._id);
                      getEventDonations(event._id);
                    }}
                  >
                    {event.name}
                  </span>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="delete-event-button"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="dashboard-content">
        {selectedEvent && selectedEventDetails && (
          <>
            <form onSubmit={handleAddDonation} className="donation-form">
              <h2 className="event-details-title">
                Event: {selectedEventDetails.name}
              </h2>
              <CSVLink
                data={csvData}
                className="export-button"
                filename="donations.csv"
              >
                Export to Excel
              </CSVLink>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                required
                className="form-input"
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                required
                className="form-input"
              />

              <button type="submit" className="donation-submit-button">
                Add Donation
              </button>
            </form>
            <table className="donations-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation._id} className="donation-row">
                    <td className="donor-name">
                      {editingDonation?._id === donation._id ? (
                        <input
                          type="text"
                          value={editingDonation.fullName}
                          onChange={(e) =>
                            setEditingDonation({
                              ...editingDonation,
                              fullName: e.target.value,
                            })
                          }
                          className="form-input"
                        />
                      ) : (
                        donation.fullName
                      )}
                    </td>
                    <td className="donation-amount">
                      {editingDonation?._id === donation._id ? (
                        <input
                          type="number"
                          value={editingDonation.amount}
                          onChange={(e) =>
                            setEditingDonation({
                              ...editingDonation,
                              amount: e.target.value,
                            })
                          }
                          className="form-input"
                        />
                      ) : (
                        donation.amount
                      )}
                    </td>
                    <td className="donation-actions">
                      {editingDonation?._id === donation._id ? (
                        <button
                          onClick={handleUpdateDonation}
                          className="update-donation-button"
                        >
                          Save
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditDonation(donation)}
                            className="edit-donation-button"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteDonation(donation._id)}
                            className="delete-donation-button"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
