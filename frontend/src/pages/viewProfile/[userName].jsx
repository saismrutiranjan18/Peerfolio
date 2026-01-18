import clientServer, { BASE_URL } from "@/Config";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./viewProfile.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAllPost } from "@/Config/Redux/Aciton/PostAction";
import {
  getAboutUser,
  getConnectionRequest,
  sendConnectionRequest,
} from "@/Config/Redux/Aciton/AuthAction";

export default function ViewProfile({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [userPost, setUserPost] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({}); // per-user status

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getAllPost());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getUserPost = async () => {
    await dispatch(getAllPost());
    await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    await dispatch(
      getConnectionRequest({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    getUserPost();
  }, []);

  useEffect(() => {
    // Filter posts for this profile and sort by newest first
    const sortedPosts = [...postState.posts]
      .filter((p) => p.userId.userName === router.query.userName)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setUserPost(sortedPosts);
  }, [postState.posts, router.query.userName]);

  // Initialize connectionStatus based on authState.connections
  useEffect(() => {
    if (authState.connections?.length > 0) {
      const statusObj = {};
      authState.connections.forEach((conn) => {
        const id = conn.connectionId._id;
        statusObj[id] = conn.status_accepted ? "connected" : "pending";
      });
      setConnectionStatus(statusObj);
    }
  }, [authState.connections]);

  if (!userProfile) return <div>User not found</div>;

  const isOwnProfile =
    String(authState.user?.userId?._id) === String(userProfile.userId._id);

  const handleConnect = async () => {
    try {
      await dispatch(
        sendConnectionRequest({
          token: localStorage.getItem("token"),
          user_id: userProfile.userId._id,
        })
      );
      // Optimistically set pending only for this user
      setConnectionStatus((prev) => ({
        ...prev,
        [userProfile.userId._id]: "pending",
      }));
    } catch (err) {
      console.error("Failed to send connection request:", err);
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {/* Banner */}
        <div className={styles.banner}>
          <img src="\banner.png" alt="Banner Image" />
          <img
            src={`${BASE_URL}/uploads/${userProfile?.userId?.profilePicture}`}
            alt="Profile"
            className={styles.profilePic}
          />
        </div>

        {/* Profile Content */}
        <div className={styles.profileContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Profile Info */}
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>
                {userProfile?.userId?.name}
              </h1>
              <p className={styles.profileEmail}>
                {userProfile?.userId?.email}
              </p>

              {/* Connection / Own profile button */}
              {isOwnProfile ? (
                <button className={styles.openToWorkBtn}>Showcase Me</button>
              ) : connectionStatus[userProfile.userId._id] === "connected" ? (
                <button className={styles.connectedBtn} disabled>
                  Connected
                </button>
              ) : connectionStatus[userProfile.userId._id] === "pending" ? (
                <button className={styles.pendingBtn} disabled>
                  Pending
                </button>
              ) : (
                <button onClick={handleConnect} className={styles.connectBtn}>
                  Connect
                </button>
              )}
            </div>

            {/* Work Experience */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Work Experience</h2>
              {userProfile?.postWork?.length > 0 ? (
                userProfile.postWork.map((work, i) => (
                  <div key={i} className={styles.sectionItem}>
                    <p>
                      <strong>{work.position}</strong> @ {work.company}
                    </p>
                    <p>{work.years}</p>
                  </div>
                ))
              ) : (
                <p>No work experience added.</p>
              )}
            </div>

            {/* Education */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Education</h2>
              {userProfile?.education?.length > 0 ? (
                userProfile.education.map((edu, i) => (
                  <div key={i} className={styles.sectionItem}>
                    <p>
                      <strong>{edu.degree}</strong> - {edu.school}
                    </p>
                    <p>{edu.fieldOfStudy}</p>
                  </div>
                ))
              ) : (
                <p>No education details added.</p>
              )}
            </div>

            {/* Resume */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Resume</h2>
              <button
                onClick={async () => {
                  const response = await clientServer.get(
                    `/user/download_resume?id=${userProfile.userId._id}`
                  );
                  window.open(
                    `${BASE_URL}/uploads/${response.data.message}`,
                    "_blank"
                  );
                }}
                className={styles.resumeBtn}
              >
                📄 Download Resume
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>

              {userPost.length > 0 ? (
                userPost
                .slice().reverse().map((post) => (
                  <div key={post._id} className={styles.activityCard}>
                    {post.media && (
                      <img
                        src={`${BASE_URL}/uploads/${post.media}`}
                        alt="Post Media"
                        className={styles.activityMedia}
                      />
                    )}
                    <div className={styles.activityContent}>
                      <p className={styles.activityBody}>{post.body}</p>
                      <span className={styles.activityDate}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No posts yet.</p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const request = await clientServer.get(
      "/user/get_user_profile_using_username",
      {
        params: {
          userName: context.query.userName,
        },
      }
    );

    return { props: { userProfile: request.data.profile } };
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    return { props: { userProfile: null } };
  }
}