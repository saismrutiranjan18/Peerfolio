import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadUserResume,
  getAllUserProfiles,
  getMyConnectionRequests,
  getUserAndProfile,
  getUserProfileUsingUsername,
  login,
  register,
  sendConnectionRequest,
  updateProfileData,
  uploadProfilePicture,
  userProfileUpdate,
  whatAreMyConnections,
} from "../Controller/UserController.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/update_profile_picture",
  upload.single("profilePicture"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No file received",
        body: req.body,
        keys: Object.keys(req.body),
      });
    }
    next();
  },
  uploadProfilePicture
);
router.post("/register", register);
router.post("/login", login);
router.post("/user_update", userProfileUpdate);
router.get("/get_user_and_profile", getUserAndProfile);
router.post("/profile_update", updateProfileData);
router.get("/user/get_all_user_profiles", getAllUserProfiles);
router.get("/user/download_resume", downloadUserResume);
router.post("/user/send_connection_request", sendConnectionRequest);
router.get("/user/get_connection_request", getMyConnectionRequests);
router.get("/user/user_connection_request", whatAreMyConnections);
router.post("/user/accept_connection_request", acceptConnectionRequest);
router.get(
  "/user/get_user_profile_using_username",
  getUserProfileUsingUsername
);

export default router;