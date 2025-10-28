import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import Profile from "../models/ProfileModel.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import connectionRequest from "../models/ConnectionModel.js";

export const convertUserDataToPdf = async (userData) => {
  const doc = new PDFDocument();

  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);

  doc.pipe(stream);

  try {
    if (userData.userId.profilePicture) {
      const imagePath = path.join("uploads", userData.userId.profilePicture);
      const convertedPath = path.join(
        "uploads",
        "converted_" + Date.now() + ".png"
      );

      // Convert any format to PNG
      await sharp(imagePath).png().toFile(convertedPath);

      doc.image(convertedPath, { align: "center", width: 100 });
    }
  } catch (err) {
    console.error("Image error:", err.message);
  }
  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`User Name: ${userData.userId.userName}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);

  doc.fontSize(14).text("Past Work: ");
  userData.postWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company Name: ${work.company}`);
    doc.fontSize(14).text(`Position: ${work.position}`);
    doc.fontSize(14).text(`Years: ${work.years}`);
  });

  doc.end();

  return outputPath;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, userName } = req.body;

    if (!name || !email || !userName || !password) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User Already Exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();

    return res.status(200).json({ message: "User Registered Successfull!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are Required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || !req.file) {
      return res.status(400).json({ message: "Token and file are required" });
    }
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    user.profilePicture = req.file.filename;

    await user.save();

    return res
      .status(200)
      .json({ message: "Profile Picture Updated Successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const userProfileUpdate = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const { email, userName } = newUserData;

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.sttaus(400).json({ message: "User already exists" });
      }
    }

    Object.assign(user, newUserData);

    await user.save();

    return res.json({ message: "User Updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email userName profilePicture"
    );

    return res.json(userProfile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
export const updateProfileData = async (req, res) => {
  try {
    const { token, bio, workExperience, education } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    let userProfile = await Profile.findOne({ userId: user._id });
    if (!userProfile) {
      // If profile doesn’t exist yet, create one
      userProfile = new Profile({ userId: user._id });
    }

    // ✅ Update profile fields
    if (bio !== undefined) userProfile.bio = bio;
    if (workExperience !== undefined) userProfile.postWork = workExperience; // map frontend → schema
    if (education !== undefined) userProfile.education = education;

    await userProfile.save();

    return res.json({ message: "Profile Updated!" });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getAllUserProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name userName email profilePicture"
    );

    return res.json(profiles);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const downloadUserResume = async (req, res) => {
  try {
    const user_id = req.query.id;
    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name userName email profilePicture"
    );

    let outputPath = await convertUserDataToPdf(userProfile);

    return res.json({ message: outputPath });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const { token, connectionId } = req.body;

    if (!token || !connectionId) {
      return res
        .status(400)
        .json({ message: "User ID and Connection ID are required" });
    }

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const targetUser = await User.findById(connectionId);

    if (!targetUser) {
      return res.status(404).json({ message: "Target User Not Found!" });
    }

    const existingConnection = await connectionRequest.findOne({
      userId: user._id,
      connectionId: connectionId,
    });

    if (existingConnection) {
      return res
        .status(400)
        .json({ message: "Connection request already sent" });
    }

    const connection = new connectionRequest({
      userId: user._id,
      connectionId: connectionId,
    });

    await connection.save();

    return res
      .status(200)
      .json({ message: "Connection request sent successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyConnectionRequests = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const connectionRequests = await connectionRequest
      .find({
        userId: user._id,
      })
      .populate("connectionId", "name userName email profilePicture");

    return res.json(connectionRequests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }
    const connections = await connectionRequest
      .find({
        connectionId: user._id,
      })
      .populate("userId", "name userName email profilePicture");

    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { token, requestId, action_type } = req.body;

    if (!token || !requestId || !action_type) {
      return res
        .status(400)
        .json({ message: "Token and Connection ID are required" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const connection = await connectionRequest.findOne({
      _id: requestId,
    });
    if (!connection) {
      return res.status(404).json({ message: "Connection Request Not Found!" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }
    await connection.save();

    return res.json({ message: "Connection Request Accepted!" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUserProfileUsingUsername = async (req, res) => {
  try {
    const { userName } = req.query;

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name userName email profilePicture"
    );

    return res.json({ profile: userProfile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};