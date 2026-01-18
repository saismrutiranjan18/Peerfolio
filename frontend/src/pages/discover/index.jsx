import { getAllUsers } from "@/Config/Redux/Aciton/AuthAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/Config";
import styles from "./discover.module.css";
import { useRouter } from "next/router";

export default function Discover() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!authState.allProfileFetched) {
      dispatch(getAllUsers());
    }
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.discoverContainer}>
          <h2 className={styles.title}>✨ Discover Amazing People</h2>
          <p className={styles.subtitle}>
            Connect with professionals, creators, and innovators around the
            world 🌍
          </p>

          <div className={styles.profileGrid}>
            {authState.allUsers?.map((profile) => (
              <div key={profile._id} className={styles.profileCard}>
                <img
                  src={`${BASE_URL}/uploads/${profile.userId?.profilePicture}`}
                  alt={profile.userId?.name}
                  className={styles.avatar}
                />
                <h3>{profile.userId?.name}</h3>
                <p className={styles.username}>@{profile.userId?.userName}</p>
                <p className={styles.bio}>{profile.bio || "No bio yet..."}</p>
                <button
                  onClick={() => {
                    router.push(`/viewProfile/${profile.userId.userName}`);
                  }}
                  className={styles.viewBtn}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}