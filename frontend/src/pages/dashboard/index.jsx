import { getAboutUser, getAllUsers } from "@/Config/Redux/Aciton/AuthAction";
import {
  getAllPost,
  createPost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
} from "@/Config/Redux/Aciton/PostAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./dashboard.module.css";
import { FaTrashAlt, FaImage } from "react-icons/fa";
import { BASE_URL } from "@/Config";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [postText, setPostText] = useState("");
  const [media, setMedia] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  const [activeComment, setActiveComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Polling: fetch posts every 5 seconds
  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      dispatch(getAllUsers());
    }

    const interval = setInterval(() => {
      dispatch(getAllPost());
    }, 3000);

    return () => clearInterval(interval); // cleanup on unmount
  }, [authState.isTokenThere]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postText && !media) return;

    setIsPosting(true);
    try {
      await dispatch(createPost({ file: media, body: postText })).unwrap();
      setPostText("");
      setMedia(null);

      await dispatch(getAllPost());
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (postId) => {
    await dispatch(deletePost(postId));
    await dispatch(getAllPost());
  };

  const sortedPosts = [...postState.posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <UserLayout>
      <DashboardLayout>
        {/* Create Post Box */}
        <div className={styles.createPostBox}>
          <img
            src={`${BASE_URL}/uploads/${authState.user?.userId?.profilePicture}`}
            alt="Profile"
            className={styles.avatar}
          />
          <form onSubmit={handlePostSubmit} className={styles.postForm}>
            <textarea
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <div className={styles.postActions}>
              <label className={styles.uploadLabel}>
                <FaImage /> Add Media
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setMedia(e.target.files[0])}
                  hidden
                />
              </label>
              <button type="submit" disabled={isPosting}>
                {isPosting ? "Uploading..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className={styles.postsFeed}>
          {sortedPosts
            .slice()
            .reverse()
            .map((post) => (
              <div key={post._id} className={styles.postCard}>
                {/* Post Header */}
                <div className={styles.postHeader}>
                  <div
                    onClick={() => {
                      router.push(`/viewProfile/${post.userId.userName}`);
                    }}
                    className={styles.userInfo}
                  >
                    <img
                      src={`${BASE_URL}/uploads/${post.userId?.profilePicture}`}
                      alt="User"
                      className={styles.avatarSmall}
                    />
                    <div>
                      <strong>{post.userId?.name}</strong>
                      <p>@{post.userId?.userName}</p>
                    </div>
                  </div>

                  {post.userId?._id === authState.user?.userId?._id && (
                    <FaTrashAlt
                      className={styles.deleteIcon}
                      onClick={() => handleDelete(post._id)}
                    />
                  )}
                </div>

                {/* Post Body */}
                <div className={styles.postBody}>
                  <p className={styles.postBodyText}>{post.body}</p>
                  {post.media && (
                    <img
                      src={`${BASE_URL}/uploads/${post.media}`}
                      alt="Post Media"
                      className={styles.postMedia}
                    />
                  )}

                  {/* Post Footer (Actions) */}
                  <div className={styles.postFooter}>
                    {/* Like Button */}
                    <div
                      className={`${styles.actionBtn} ${
                        post.likes?.includes(authState.user?.userId?._id)
                          ? styles.liked
                          : ""
                      }`}
                      onClick={() =>
                        dispatch(
                          toggleLike({
                            postId: post._id,
                            token: localStorage.getItem("token"),
                          })
                        )
                      }
                    >
                      {post.likes?.includes(authState.user?.userId?._id)
                        ? "❤️ Liked"
                        : "🤍 Like"}
                    </div>

                    {/* Comment Button */}
                    <div
                      className={styles.actionBtn}
                      onClick={() => {
                        if (activeComment === post._id) {
                          setActiveComment(null);
                        } else {
                          setActiveComment(post._id);
                          dispatch(getComments({ postId: post._id }));
                        }
                      }}
                    >
                      💬 Comment
                    </div>

                    {/* Share Button */}
                    <div
                      className={styles.actionBtn}
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/post/${post._id}`;
                        const tweetText = encodeURIComponent(
                          "Check out this post!"
                        );
                        window.open(
                          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                            shareUrl
                          )}&text=${tweetText}`,
                          "_blank"
                        );
                      }}
                    >
                      🔗 Share
                    </div>
                  </div>

                  {/* Comment Box */}
                  {activeComment === post._id && (
                    <div className={styles.commentBox}>
                      <div className={styles.commentInputWrapper}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (commentText.trim()) {
                              dispatch(
                                addComment({
                                  postId: post._id,
                                  commentBody: commentText,
                                })
                              );
                              setCommentText("");
                            }
                          }}
                        >
                          Post
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className={styles.commentsList}>
                        {[...(postState.commentsByPost[post._id] || [])]
                          .slice()
                          .reverse()
                          .map((c, i) => (
                            <div key={i} className={styles.commentItem}>
                              <img
                                src={`${BASE_URL}/uploads/${c.userId?.profilePicture}`}
                                alt="User"
                                className={styles.commentAvatar}
                              />
                              <div className={styles.commentContent}>
                                <strong>{c.userId?.name}</strong>
                                <p>{c.body}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}