import React, { useEffect, useState } from "react";
import axios from "axios";

const PRIORITY_ORDER = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_REAL_TOKEN_HERE";

function Track({ topN = 10 }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://4.224.186.213/evaluation-service/notifications",
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
          }
        );

        console.log("API Response:", response.data);

        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data?.notifications) {
          data = response.data.notifications;
        }

        data.sort((a, b) => {
          const priorityA =
            PRIORITY_ORDER[a.type || a.Type] || 0;
          const priorityB =
            PRIORITY_ORDER[b.type || b.Type] || 0;

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
        console.error("Error:", err);

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

  if (loading) return <h2>Loading Notifications...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "20px" }}>
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
            }}
          >
            <h3>
              {notification.title ||
                notification.Title ||
                "Notification"}
            </h3>

            <p>{notification.message || notification.Message}</p>

            <p>
              <strong>Type:</strong>{" "}
              {notification.type || notification.Type}
            </p>

            <p>
              <strong>Timestamp:</strong>{" "}
              {notification.timestamp ||
                notification.Timestamp ||
                notification.createdAt}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Track;