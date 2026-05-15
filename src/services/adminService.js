import { db } from "../../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  arrayUnion,
  addDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

// helper functions
const getProjects = async () => {
  const snap = await getDocs(collection(db, "projects"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const getUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const adminService = {
  // ---------------- PROJECTS ----------------
  getProjects,

  getProjectById: async (id) => {
    const snap = await getDoc(doc(db, "projects", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  createProject: async (projectData, tasks, image) => {
    try {
      const projectWithTasks = {
        ...projectData,
        tasks: tasks || [],
        status: "active",
        members: [],
        milestones: [],
        updates: [],
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, "projects"), projectWithTasks);
      return { id: docRef.id, ...projectWithTasks };
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  stopProject: async (id, reason) => {
    return await updateDoc(doc(db, "projects", id), {
      status: "stopped",
      stopReason: reason,
      stoppedAt: new Date().toISOString(),
    });
  },

  // ---------------- JOIN REQUESTS (NEW APPROVAL SYSTEM) ----------------
  
  // Student requests to join a project
  requestToJoinProject: async (projectId, userId, userData) => {
    try {
      // Check if already a member
      const project = await adminService.getProjectById(projectId);
      if (project.members?.some(m => m.id === userId)) {
        throw new Error("You're already a member of this project");
      }
      
      // Check if request already exists
      const requestsQuery = query(
        collection(db, "joinRequests"),
        where("projectId", "==", projectId),
        where("userId", "==", userId),
        where("status", "==", "pending")
      );
      const existing = await getDocs(requestsQuery);
      if (!existing.empty) {
        throw new Error("You already have a pending request for this project");
      }
      
      // Create join request
      const request = {
        projectId,
        projectName: project.name,
        userId,
        userFullName: userData.fullName,
        userEmail: userData.email,
        status: "pending",
        requestedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, "joinRequests"), request);
      return { id: docRef.id, ...request };
    } catch (error) {
      console.error("Error requesting to join:", error);
      throw error;
    }
  },

  // Get pending requests for a specific project
  getPendingRequests: async (projectId) => {
    try {
      const q = query(
        collection(db, "joinRequests"),
        where("projectId", "==", projectId),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting pending requests:", error);
      return [];
    }
  },

  // Get all pending requests across all projects (for admin dashboard)
  getAllPendingRequests: async () => {
    try {
      const q = query(
        collection(db, "joinRequests"),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Group by project for easier display
      const grouped = {};
      requests.forEach(req => {
        if (!grouped[req.projectId]) {
          grouped[req.projectId] = {
            projectId: req.projectId,
            projectName: req.projectName,
            requests: [],
          };
        }
        grouped[req.projectId].requests.push(req);
      });
      
      return Object.values(grouped);
    } catch (error) {
      console.error("Error getting all pending requests:", error);
      return [];
    }
  },

  // Get pending requests count (for badge on admin dashboard)
  getPendingRequestsCount: async () => {
    try {
      const q = query(
        collection(db, "joinRequests"),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting pending requests count:", error);
      return 0;
    }
  },

  // Admin approves join request
  approveJoinRequest: async (requestId, projectId, user) => {
    try {
      // Update request status
      const requestRef = doc(db, "joinRequests", requestId);
      await updateDoc(requestRef, {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });
      
      // Add user to project members
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const currentMembers = projectSnap.data().members || [];
        await updateDoc(projectRef, {
          members: [...currentMembers, {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            joinedAt: new Date().toISOString(),
          }],
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error approving request:", error);
      throw error;
    }
  },

  // Admin rejects join request
  rejectJoinRequest: async (requestId, reason = "Not approved") => {
    try {
      const requestRef = doc(db, "joinRequests", requestId);
      await updateDoc(requestRef, {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        rejectReason: reason,
      });
      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      throw error;
    }
  },

  // Get student's request status for a project
  getMyRequestStatus: async (projectId, userId) => {
    try {
      const q = query(
        collection(db, "joinRequests"),
        where("projectId", "==", projectId),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const request = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      return request;
    } catch (error) {
      console.error("Error getting request status:", error);
      return null;
    }
  },

  // ---------------- ADMIN REGISTRATION ----------------
  
  createAdminAccount: async (email, password, fullName, adminCode) => {
    // Verify admin creation code (security measure)
    const VALID_ADMIN_CODE = "GREEN2024"; // Change this to something secure
    
    if (adminCode !== VALID_ADMIN_CODE) {
      throw new Error("Invalid admin code");
    }
    
    try {
      // Check if any admin already exists
      const usersSnapshot = await getDocs(collection(db, "users"));
      const adminExists = usersSnapshot.docs.some(doc => doc.data().role === "admin");
      
      if (adminExists) {
        throw new Error("Admin already exists. Only one admin can be created via registration.");
      }
      
      // Create Firebase Auth user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with admin role
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        fullName,
        email,
        role: "admin",
        createdAt: new Date().toISOString(),
        createdViaCode: true,
      });
      
      return userCred.user;
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  },

  // Check if any admin exists
  doesAdminExist: async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      return usersSnapshot.docs.some(doc => doc.data().role === "admin");
    } catch (error) {
      console.error("Error checking admin existence:", error);
      return false;
    }
  },

  // ---------------- USERS ----------------
  getUsers,

  // ---------------- JOIN PROJECT (LEGACY - KEPT FOR BACKWARDS COMPATIBILITY) ----------------
  joinProject: async (projectId, user) => {
    const projectRef = doc(db, "projects", projectId);
    const snap = await getDoc(projectRef);

    if (!snap.exists()) throw new Error("Project not found");

    const data = snap.data();
    const members = data.members || [];

    const alreadyJoined = members.find((m) => m.id === user.id);
    if (alreadyJoined) return;

    await updateDoc(projectRef, {
      members: arrayUnion({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        joinedAt: new Date().toISOString(),
      }),
    });
  },

  // ---------------- STATS ----------------
  getStats: async () => {
    const projects = await getProjects();
    const users = await getUsers();

    return {
      activeProjects: projects.filter((p) => p.status === "active").length,
      totalProjects: projects.length,
      totalUsers: users.length,
    };
  },

  // ---------------- PROJECT USERS ----------------
  getProjectUsers: async (projectId) => {
    const q = query(
      collection(db, "projectUsers"),
      where("projectId", "==", projectId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // ---------------- UPDATES ----------------
  getProjectUpdates: async (projectId) => {
    const q = query(
      collection(db, "updates"),
      where("projectId", "==", projectId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};