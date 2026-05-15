import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USERS: '@greentrack_users',
  CURRENT_USER: '@greentrack_current_user',
  PROJECTS: '@greentrack_projects',
  JOIN_REQUESTS: '@greentrack_join_requests',
};

// Mock data for first launch
const getDefaultProjects = () => [
  {
    id: '1',
    name: 'Campus Tree Planting',
    description: 'Plant 100 trees around campus to reduce carbon footprint',
    category: 'greening',
    campus: 'Main Campus',
    status: 'active',
    members: [],
    milestones: [],
    updates: [],
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Recycling Initiative',
    description: 'Install recycling bins across all campus buildings',
    category: 'recycling',
    campus: 'Science Campus',
    status: 'active',
    members: [],
    milestones: [],
    updates: [],
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Energy Saving Campaign',
    description: 'Reduce energy consumption by 20% through awareness',
    category: 'energy',
    campus: 'Main Campus',
    status: 'active',
    members: [],
    milestones: [],
    updates: [],
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
  },
];

export const localStorageService = {
  // Initialize app with default data
  initialize: async () => {
    try {
      console.log('Initializing storage...');
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      if (!users) {
        // Create default admin user
        const defaultUsers = [
          {
            id: 'admin1',
            fullName: 'System Admin',
            email: 'admin@greentrack.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
        ];
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        console.log('Default admin user created');
      } else {
        console.log('Users already exist:', users);
      }
      
      const projects = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!projects) {
        await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(getDefaultProjects()));
        console.log('Default projects created');
      }
      
      const requests = await AsyncStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
      if (!requests) {
        await AsyncStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify([]));
        console.log('Empty requests initialized');
      }
      
      console.log('LocalStorage initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
    }
  },

  // Clear all storage (useful for debugging)
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      console.log('All storage cleared');
      return true;
    } catch (error) {
      console.error('Clear error:', error);
      return false;
    }
  },

  // ---------- AUTHENTICATION ----------
  register: async (fullName, email, password) => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Check if user exists
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }
      
      const newUser = {
        id: Date.now().toString(),
        fullName,
        email,
        password,
        role: 'student',
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      console.log('User registered:', newUser);
      return newUser;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      console.log('Users from storage:', usersJson);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      console.log('Login successful, user role before store:', user.role);
      
      // Make sure we store the complete user object including role
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      
      // Verify it was stored correctly
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      console.log('Stored user in AsyncStorage:', storedUser);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    console.log('User logged out');
  },

  getCurrentUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const user = userJson ? JSON.parse(userJson) : null;
      console.log('getCurrentUser - Raw from storage:', userJson);
      console.log('getCurrentUser - Parsed user:', user);
      console.log('getCurrentUser - User role:', user?.role);
      return user;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  },

  makeAdmin: async (email) => {
    try {
      console.log('Making admin for email:', email);
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      let users = usersJson ? JSON.parse(usersJson) : [];
      
      let updatedUser = null;
      users = users.map(u => {
        if (u.email === email) {
          updatedUser = { ...u, role: 'admin' };
          console.log('Updating user from', u.role, 'to admin');
          return updatedUser;
        }
        return u;
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      console.log('Users updated in storage');
      console.log('Updated user object:', updatedUser);
      
      // ALWAYS update current user if it's the same
      const current = await localStorageService.getCurrentUser();
      console.log('Current user before update:', current);
      
      if (current && current.email === email) {
        // Make sure to store the COMPLETE updated user object
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        console.log('Current user updated to admin in storage');
        
        // Verify the update
        const verifyUser = await localStorageService.getCurrentUser();
        console.log('Verified current user after admin update:', verifyUser);
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Make admin error:', error);
      throw error;
    }
  },

  // ---------- PROJECTS ----------
  getProjects: async () => {
    const projectsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
    return projectsJson ? JSON.parse(projectsJson) : [];
  },

  getProjectById: async (id) => {
    const projects = await localStorageService.getProjects();
    return projects.find(p => p.id === id);
  },

  createProject: async (projectData, tasks, image) => {
    try {
      const projects = await localStorageService.getProjects();
      const newProject = {
        ...projectData,
        id: Date.now().toString(),
        status: 'active',
        members: [],
        milestones: tasks || [],
        updates: [],
        createdAt: new Date().toISOString(),
      };
      projects.push(newProject);
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      console.log('Project created:', newProject);
      return newProject;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  stopProject: async (id, reason) => {
    try {
      const projects = await localStorageService.getProjects();
      const updated = projects.map(p => 
        p.id === id ? { ...p, status: 'stopped', stopReason: reason, stoppedAt: new Date().toISOString() } : p
      );
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      console.log('Project stopped:', id);
    } catch (error) {
      console.error('Stop project error:', error);
    }
  },

  // ---------- JOIN REQUESTS ----------
  requestToJoin: async (projectId, userId, userData) => {
    try {
      const requestsJson = await AsyncStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
      const requests = requestsJson ? JSON.parse(requestsJson) : [];
      
      const projects = await localStorageService.getProjects();
      const project = projects.find(p => p.id === projectId);
      
      const existing = requests.find(r => r.projectId === projectId && r.userId === userId && r.status === 'pending');
      if (existing) {
        throw new Error('Request already pending');
      }
      
      const newRequest = {
        id: Date.now().toString(),
        projectId,
        projectName: project.name,
        userId,
        userFullName: userData.fullName,
        userEmail: userData.email,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      
      requests.push(newRequest);
      await AsyncStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
      console.log('Join request created:', newRequest);
      return newRequest;
    } catch (error) {
      console.error('Request to join error:', error);
      throw error;
    }
  },

  getPendingRequests: async () => {
    const requestsJson = await AsyncStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
    const requests = requestsJson ? JSON.parse(requestsJson) : [];
    return requests.filter(r => r.status === 'pending');
  },

  getPendingRequestsCount: async () => {
    const pending = await localStorageService.getPendingRequests();
    return pending.length;
  },

  getAllPendingRequests: async () => {
    const pending = await localStorageService.getPendingRequests();
    // Group by project
    const grouped = {};
    pending.forEach(req => {
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
  },

  approveJoinRequest: async (requestId, projectId, user) => {
    try {
      // Update request status
      const requestsJson = await AsyncStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
      let requests = requestsJson ? JSON.parse(requestsJson) : [];
      requests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r
      );
      await AsyncStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
      
      // Add user to project members
      const projects = await localStorageService.getProjects();
      const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
          const members = p.members || [];
          if (!members.find(m => m.id === user.id)) {
            return { ...p, members: [...members, { ...user, joinedAt: new Date().toISOString() }] };
          }
        }
        return p;
      });
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      console.log('Join request approved:', requestId);
    } catch (error) {
      console.error('Approve request error:', error);
      throw error;
    }
  },

  rejectJoinRequest: async (requestId, reason) => {
    try {
      const requestsJson = await AsyncStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
      let requests = requestsJson ? JSON.parse(requestsJson) : [];
      requests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'rejected', rejectReason: reason, rejectedAt: new Date().toISOString() } : r
      );
      await AsyncStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
      console.log('Join request rejected:', requestId);
    } catch (error) {
      console.error('Reject request error:', error);
    }
  },

  getMyRequestStatus: async (projectId, userId) => {
    const requestsJson = await AsyncStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
    const requests = requestsJson ? JSON.parse(requestsJson) : [];
    return requests.find(r => r.projectId === projectId && r.userId === userId) || null;
  },

  // ---------- USERS ----------
  getUsers: async () => {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  // ---------- UPDATES ----------
  getProjectUpdates: async (projectId) => {
    const project = await localStorageService.getProjectById(projectId);
    return project?.updates || [];
  },

  // ---------- STATS ----------
  getStats: async () => {
    const projects = await localStorageService.getProjects();
    const users = await localStorageService.getUsers();
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalUsers: users.length,
    };
  },
};