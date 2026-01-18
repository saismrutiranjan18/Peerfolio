import React, { useEffect } from "react";
import styles from "./style.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { isTokenValidThere } from "@/Config/Redux/Reducers/AuthReducer";
import { BASE_URL } from "@/Config";
import { getAllUsers } from "@/Config/Redux/Aciton/AuthAction";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/login");
    }

    dispatch(isTokenValidThere());
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [authState.user]);

  return (
    <>
      <div className={styles.dashboardWrapper}>
        {/* Left Sidebar */}
        <aside className={styles.sidebarLeft}>
          <h2 className={styles.logo}>Nexa</h2>
          <nav className={styles.navMenu}>
            <p
              onClick={() => {
                router.push("/dashboard");
              }}
              className={styles.navItem}
            >
              🏠 Dashboard
            </p>
            <p
              onClick={() => {
                router.push("/discover");
              }}
              className={styles.navItem}
            >
              🌍 Discover
            </p>
            <p
              onClick={() => {
                router.push("/myConnection");
              }}
              className={styles.navItem}
            >
              🤝 My Connections
            </p>
            <p className={styles.navItem}>💼 Jobs</p>
            <p className={styles.navItem}>⚙️ Settings</p>
          </nav>
        </aside>

        {/* Main Feed */}
        <main className={styles.mainFeed}>{children}</main>

        {/* Right Sidebar */}
        <aside className={styles.sidebarRight}>
          <h3 className={styles.sidebarTitle}>Top Profiles</h3>

          {authState.allProfileFetched && authState.allUsers.length > 0 ? (
            authState.allUsers.map((profile) => (
              <div
                key={profile._id}
                className={styles.profileCard}
                onClick={() => {
                  router.push(`/viewProfile/${profile.userId.userName}`);
                }}
              >
                <img
                  src={`${BASE_URL}/uploads/${profile.userId.profilePicture}`}
                  alt={profile.userId.name}
                />
                <p>
                  <strong>{profile.userId.name}</strong>
                </p>
                <span>{profile.currentPost || "Member"}</span>
                <small>@{profile.userId.userName}</small>
              </div>
            ))
          ) : (
            <p className={styles.noProfiles}>No profiles found</p>
          )}
        </aside>
      </div>
    </>
  );
}