import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/Config/Redux/Reducers/AuthReducer";
import { useEffect } from "react";
import { getAboutUser } from "@/Config/Redux/Aciton/AuthAction";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
    }
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        {/* Brand */}
        <div className={styles.mainContainerleft}>
          <h2
            className={styles.brand}
            onClick={() => router.push("/")}
            role="button"
            tabIndex={0}
          >
            <img src="/logo.png" alt="Nexa logo" />
            <span>Nexa</span>
          </h2>
        </div>

        {/* Right side actions */}
        <div className={styles.mainContainerRight}>
          {authState.user ? (
            <div className={styles.actions}>
              <span className={styles.greeting}>
                Hey, <b>{authState.user?.userId?.name}</b>
              </span>

              <button
                className={`${styles.actionBtn} ${styles.profileBtn}`}
                onClick={() => router.push("/profile")}
                type="button"
              >
                <span className={styles.icon} aria-hidden>
                  👤
                </span>
                <span className={styles.label}>Profile</span>
              </button>

              <button
                className={`${styles.actionBtn} ${styles.logoutBtn}`}
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                  dispatch(reset());
                }}
                type="button"
              >
                <span className={styles.icon} aria-hidden>
                  ⎋
                </span>
                <span className={styles.label}>Log out</span>
              </button>
            </div>
          ) : (
            <button
              className={styles.cta}
              onClick={() => router.push("/login")}
              type="button"
            >
              <span className={styles.icon} aria-hidden>
                🚀
              </span>
              <span className={styles.label}>Be a part</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}