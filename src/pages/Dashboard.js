import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [taskData, setTaskData] = useState({
    title: "",
    projectId: "",
    assignedTo: ""
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔐 protect route
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // 📊 load data
  useEffect(() => {
    if (!user) return;

    fetchProjects();
    fetchTasks();
    fetchUsers();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.log("Project error:", err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.log("Task error:", err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.log("User error:", err.message);
    }
  };

  // 🔥 CREATE TASK
  const createTask = async () => {
    try {
      if (!taskData.title || !taskData.projectId || !taskData.assignedTo) {
        return alert("Fill all fields");
      }

      await API.post("/tasks", taskData);

      alert("Task created");
      setTaskData({ title: "", projectId: "", assignedTo: "" });
      fetchTasks();

    } catch (err) {
      alert(err.response?.data?.message || "Error creating task");
    }
  };

  // 🔄 UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // 🔥 FIXED STATS (IMPORTANT)
  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(
      (t) =>
        t.projectId === projectId ||
        t.projectId?._id === projectId
    );

    return {
      todo: projectTasks.filter(t => t.status === "todo").length,
      inprogress: projectTasks.filter(t => t.status === "inprogress").length,
      done: projectTasks.filter(t => t.status === "done").length
    };
  };

  // 🔥 MEMBER STATS
  const getProjectMembersStats = (projectId) => {
    const projectTasks = tasks.filter(
      (t) =>
        t.projectId === projectId ||
        t.projectId?._id === projectId
    );

    const memberMap = {};

    projectTasks.forEach((t) => {
      const id = t.assignedTo?._id || t.assignedTo;

      if (!memberMap[id]) {
        memberMap[id] = {
          name: t.assignedTo?.name || "Member",
          todo: 0,
          inprogress: 0,
          done: 0
        };
      }

      memberMap[id][t.status]++;
    });

    return Object.values(memberMap);
  };

  if (!user) return null;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {/* ================= ADMIN VIEW ================= */}
      {user.role === "admin" && (
        <>
          <h3>Projects (Click to View Members)</h3>

          {projects.map((p) => {
            const stats = getProjectStats(p._id);
            const members = getProjectMembersStats(p._id);

            return (
              <div key={p._id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
                <h4>{p.title}</h4>

                <p>
                  Todo: {stats.todo} | InProgress: {stats.inprogress} | Done: {stats.done}
                </p>

                {/* 👇 MEMBER STATUS */}
                {members.map((m, i) => (
                  <div key={i} style={{ marginLeft: "20px" }}>
                    {m.name} → Todo: {m.todo} | InProgress: {m.inprogress} | Done: {m.done}
                  </div>
                ))}
              </div>
            );
          })}

          {/* CREATE TASK */}
          <h3>Create Task</h3>

          <input
            placeholder="Task Title"
            value={taskData.title}
            onChange={(e) =>
              setTaskData({ ...taskData, title: e.target.value })
            }
          />

          <select
            value={taskData.projectId}
            onChange={(e) =>
              setTaskData({ ...taskData, projectId: e.target.value })
            }
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            value={taskData.assignedTo}
            onChange={(e) =>
              setTaskData({ ...taskData, assignedTo: e.target.value })
            }
          >
            <option value="">Assign Member</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <button onClick={createTask}>Assign Task</button>
        </>
      )}

      {/* ================= TASK LIST ================= */}
      <h3>Tasks</h3>

      {tasks.map((t) => (
        <div key={t._id} style={{ border: "1px solid gray", padding: 10, margin: 10 }}>
          <p><b>{t.title}</b></p>
          <p>Status: {t.status}</p>

          {/* 🔥 FIXED DISPLAY */}
          <p>Project: {t.projectId?.title || "Unknown"}</p>
          <p>Assigned To: {t.assignedTo?.name || "Member"}</p>

          <button onClick={() => updateStatus(t._id, "todo")}>Todo</button>
          <button onClick={() => updateStatus(t._id, "inprogress")}>In Progress</button>
          <button onClick={() => updateStatus(t._id, "done")}>Done</button>
        </div>
      ))}
    </div>
  );
}
