import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "@/Config/Redux/Aciton/AuthAction";
import { emptyMessage } from "@/Config/Redux/Reducers/AuthReducer";

export default function LoginComponent() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);

  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [isSignup]);

  useEffect(() => {
    if (authState.message === "Registration successful") {
      setEmail("");
      setPassword("");
      setUserName("");
      setName("");
      setIsSignup(false);
    }
  }, [authState.message]);

  const dispatch = useDispatch();

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("register");
    dispatch(registerUser({ email, password, userName, name }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("login");
    dispatch(loginUser({ email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* Left side (branding / background) */}
          <div className={styles.cardContainerLeft}>
            <h1>
              Welcome to <span>Nexa</span>
            </h1>
            <p>
              A true social media experience where real stories matter. Build
              genuine connections without exaggeration 🚀
            </p>
          </div>

          {/* Right side (form) */}
          <div className={styles.cardContainerRight}>
            <h2>{isSignup ? "Create Account" : "Sign In"}</h2>
            <p style={{ color: authState.isError ? "red" : "green" }}>
              <div style={{ marginBottom: "2rem" }}>
                <p> {authState.message}</p>
              </div>
            </p>
            <form>
              {isSignup && (
                <>
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    type="text"
                    placeholder="Username"
                  />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Full Name"
                  />
                </>
              )}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
              />

              <button
                type="submit"
                onClick={(e) => {
                  if (isSignup) {
                    handleRegister(e);
                  } else {
                    handleLogin(e);
                  }
                }}
              >
                {isSignup ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <p className={styles.switchText}>
              {isSignup ? (
                <>
                  Already have an account?
                  <span onClick={() => setIsSignup(false)}>Sign In</span>
                </>
              ) : (
                <>
                  Don’t have an account?
                  <span onClick={() => setIsSignup(true)}>Sign Up</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}