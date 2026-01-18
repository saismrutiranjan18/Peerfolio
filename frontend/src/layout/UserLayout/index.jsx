import Navbar from "@/Components/Navbar/Navbar";
import React from "react";

export default function UserLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}