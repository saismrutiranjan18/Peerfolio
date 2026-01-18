import React, { useEffect, useState } from "react";
import styles from "./profile.module.css";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { getAboutUser } from "@/Config/Redux/Aciton/AuthAction";
import { useDispatch, useSelector } from "react-redux";
import clientServer, { BASE_URL } from "@/Config";
import { getAllPost } from "@/Config/Redux/Aciton/PostAction";

export default function Profile() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [userProfile, setUserProfile] = useState({});
  const [userPost, setUserPost] = useState([]);

  const [bio, setBio] = useState("");
  const [workExperience, setWorkExperience] = useState([]);
  const [education, setEducation] = useState([]);

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPost());
  }, []);

  useEffect(() => {
    if (authState.user) {
      setUserProfile(authState.user);
      setBio(authState.user?.userId?.bio || "");
      setWorkExperience(authState.user?.postWork || []);
      setEducation(authState.user?.education || []);

      const post = postState.posts.filter(
        (post) => post.userId.userName === authState.user.userId.userName
      );
      setUserPost(post);
    }
  }, [authState.user, postState.posts]);

  const uploadProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append("token", localStorage.getItem("token"));
      if (file) formData.append("profilePicture", file);

      await clientServer.post("/update_profile_picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    } catch (err) {
      alert("Failed to upload profile picture");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await clientServer.post("/profile_update", {
        token: localStorage.getItem("token"),
        bio,
        workExperience,
        education,
      });

      alert(res.data.message);
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile.userId && (
          <div className={styles.banner}>
            <img src="/banner.png" alt="Banner Image" />

            <div className={styles.profilePicContainer}>
              <img
                src={`${BASE_URL}/uploads/${userProfile.userId.profilePicture}`}
                alt="Profile"
                className={styles.profilePic}
              />
              <label className={styles.uploadIcon}>
                <input
                  type="file"
                  onChange={(e) => uploadProfilePicture(e.target.files[0])}
                  className={styles.fileInput}
                />
                ✎
              </label>
            </div>
          </div>
        )}

        <div className={styles.profileContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Profile Info */}
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{userProfile.userId?.name}</h1>
              <p className={styles.profileEmail}>{userProfile.userId?.email}</p>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                className={styles.bioInput}
              />
            </div>

            {/* Work Experience */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Work Experience</h2>
              {workExperience.map((work, i) => (
                <div key={i} className={styles.sectionItem}>
                  <input
                    type="text"
                    value={work.position}
                    placeholder="Position"
                    onChange={(e) => {
                      const updated = workExperience.map((w, idx) =>
                        idx === i ? { ...w, position: e.target.value } : w
                      );
                      setWorkExperience(updated);
                    }}
                    className={styles.inputField}
                  />
                  <input
                    type="text"
                    value={work.company}
                    placeholder="Company"
                    onChange={(e) => {
                      const updated = workExperience.map((w, idx) =>
                        idx === i ? { ...w, company: e.target.value } : w
                      );
                      setWorkExperience(updated);
                    }}
                    className={styles.inputField}
                  />
                  <input
                    type="text"
                    value={work.years}
                    placeholder="Years"
                    onChange={(e) => {
                      const updated = workExperience.map((w, idx) =>
                        idx === i ? { ...w, years: e.target.value } : w
                      );
                      setWorkExperience(updated);
                    }}
                    className={styles.inputField}
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setWorkExperience([
                    ...workExperience,
                    { position: "", company: "", years: "" },
                  ])
                }
                className={styles.addBtn}
              >
                + Add Work
              </button>
            </div>

            {/* Education */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Education</h2>
              {education.map((edu, i) => (
                <div key={i} className={styles.sectionItem}>
                  <input
                    type="text"
                    value={edu.degree}
                    placeholder="Degree"
                    onChange={(e) => {
                      const updated = education.map((ed, idx) =>
                        idx === i ? { ...ed, degree: e.target.value } : ed
                      );
                      setEducation(updated);
                    }}
                    className={styles.inputField}
                  />
                  <input
                    type="text"
                    value={edu.school}
                    placeholder="School"
                    onChange={(e) => {
                      const updated = education.map((ed, idx) =>
                        idx === i ? { ...ed, school: e.target.value } : ed
                      );
                      setEducation(updated);
                    }}
                    className={styles.inputField}
                  />
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    placeholder="Field of Study"
                    onChange={(e) => {
                      const updated = education.map((ed, idx) =>
                        idx === i ? { ...ed, fieldOfStudy: e.target.value } : ed
                      );
                      setEducation(updated);
                    }}
                    className={styles.inputField}
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setEducation([
                    ...education,
                    { degree: "", school: "", fieldOfStudy: "" },
                  ])
                }
                className={styles.addBtn}
              >
                + Add Education
              </button>
            </div>

            <button onClick={handleUpdateProfile} className={styles.updateBtn}>
              Update Profile
            </button>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              {userPost.length > 0 ? (
                userPost
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice()
                  .reverse()
                  .map((post) => (
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