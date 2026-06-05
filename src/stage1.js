import React, { useEffect, useState } from "react";
import axios from "axios";

const PRIORITY_ORDER = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// Paste your FULL token below
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyNGJxNWEwNTE3QHZ2aXQubmV0IiwiZXhwIjoxNzgwNjQxODE4LCJpYXQiOjE3ODA2NDA5MTgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5MGJjZTJmMC1mY2I5LTQ4ZWYtODUzMC02YjJmMDE4OWQzNGEiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJudXRha2tpIHVtYSBuYW5kaW5pIiwic3ViIjoiOGM2NjVmMGQtZjViOC00MWI2LWJmYTgtNTFlZjVmYzJiNzZmIn0sImVtYWlsIjoiMjRicTVhMDUxN0B2dml0Lm5ldCIsIm5hbWUiOiJudXRha2tpIHVtYSBuYW5kaW5pIiwicm9sbE5vIjoiMjRicTVhMDUxNyIsImFjY2Vzc0NvZGUiOiJRUWRFWXkiLCJjbGllbnRJRCI6IjhjNjY1ZjBkLWY1YjgtNDFiNi1iZmE4LTUxZWY1ZmMyYjc2ZiIsImNsaWVudFNlY3JldCI6IldjSnNEQ2Z4a2haVnFDVUIifQ.YdktQR5QRWIDwbhrlzzSjZkVwTBiBSAGnv_OQdpa59A";

function Track({ topN = 10 }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://4.224.186.213/evaluation-service/notifications",
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data?.notifications) {
          data = response.data.notifications;
        } else if (response.data?.data) {
          data = response.data.data;
        }

        data.sort((a, b) => {
          const priorityA = PRIORITY_ORDER[a.type || a.Type] || 0;
          const priorityB = PRIORITY_ORDER[b.type || b.Type] || 0;

          if (priorityA !== priorityB) {
            return priorityB - priorityA;
          }

          const dateA = new Date(
            a.timestamp || a.Timestamp || a.createdAt || 0
          );

          const dateB = new Date(
            b.timestamp || b.Timestamp || b.createdAt || 0
          );

          return dateB - dateA;
        });

        setNotifications(data.slice(0, topN));
      } catch (err) {
        console.error("API Error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch notifications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [topN]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Loading Notifications...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
        padding: "20px",
      }}
    >
      <h1>Priority Inbox</h1>
      <h3>Top {topN} Notifications</h3>

      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        notifications.map((notification, index) => (
          <div
            key={notification.id || index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3>
              {notification.title ||
                notification.Title ||
                "Notification"}
            </h3>

            <p>
              {notification.message ||
                notification.Message ||
                "No message available"}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {notification.type ||
                notification.Type ||
                "Unknown"}
            </p>

            <p>
              <strong>Timestamp:</strong>{" "}
              {notification.timestamp ||
                notification.Timestamp ||
                notification.createdAt ||
                "N/A"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Track;