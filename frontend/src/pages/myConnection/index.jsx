import {
  acceptConnectionRequest,
  getMyConnectionRequest,
} from "@/Config/Redux/Aciton/AuthAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./myConnection.module.css";
import { BASE_URL } from "@/Config";
import { useRouter } from "next/router";

export default function MyConnection() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // Fetch connections on load
  useEffect(() => {
    dispatch(getMyConnectionRequest({ token: localStorage.getItem("token") }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(
        getMyConnectionRequest({ token: localStorage.getItem("token") })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Handle Accept Request
  const handleAccept = async (requestId) => {
    await dispatch(
      acceptConnectionRequest({
        token: localStorage.getItem("token"),
        requestId,
        action: "accept",
      })
    );

    // Refresh connections after accept
    dispatch(getMyConnectionRequest({ token: localStorage.getItem("token") }));
  };

  // Separate requests & networks
  const requests =
    authState.connectionRequests?.filter(
      (connection) => connection.status_accepted === null
    ) || [];

  const networks =
    authState.connectionRequests?.filter(
      (connection) => connection.status_accepted !== null
    ) || [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Connection Requests Section */}
          <h1 className={styles.title}>Connection Requests</h1>
          {requests.length === 0 ? (
            <p className={styles.noRequests}>No connection requests yet.</p>
          ) : (
            <div className={styles.grid}>
              {requests.map((req) => (
                <div key={req._id} className={styles.card}>
                  <div
                    className={styles.userInfo}
                    onClick={() => {
                      router.push(`/viewProfile/${req.userId.userName}`);
                    }}
                  >
                    <img
                      src={`${BASE_URL}/uploads/${req.userId.profilePicture}`}
                      alt={req.userId.name}
                      className={styles.avatar}
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />

                    <div className={styles.info}>
                      <h2 className={styles.name}>{req.userId.name}</h2>
                      <p className={styles.username}>@{req.userId.userName}</p>
                      <p className={styles.email}>{req.userId.email}</p>
                    </div>
                  </div>

                  <button
                    className={styles.acceptBtn}
                    onClick={() => handleAccept(req._id)}
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* My Networks Section */}
          <h1 className={styles.title}>My Networks</h1>
          {networks.length === 0 ? (
            <p className={styles.noRequests}>No connections yet.</p>
          ) : (
            <div className={styles.grid}>
              {networks.map((req) => (
                <div key={req._id} className={styles.card}>
                  <div
                    className={styles.userInfo}
                    onClick={() => {
                      router.push(`/viewProfile/${req.userId.userName}`);
                    }}
                  >
                    <img
                      src={`${BASE_URL}/uploads/${req.userId.profilePicture}`}
                      alt={req.userId.name}
                      className={styles.avatar}
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />

                    <div className={styles.info}>
                      <h2 className={styles.name}>{req.userId.name}</h2>
                      <p className={styles.username}>@{req.userId.userName}</p>
                      <p className={styles.email}>{req.userId.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}