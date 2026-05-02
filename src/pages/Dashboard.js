import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);

  const [taskData, setTaskData] = useState({
    title: "",
    projectId: "",
    assignedTo: ""
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔐 protect route
useEffect(() => {
  if (!user) {
    navigate("/");
  }
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
    setProjects(res.data || []);
  } catch (err) {
    if (err.code === "ERR_CANCELED") return;   // ignore abort

    console.log("Project error:", err.response?.data || err.message);

    // optional: fallback to empty
    setProjects([]);
  }
};

const fetchTasks = async () => {
  try {
    const res = await API.get("/tasks");
    setTasks(res.data || []);
  } catch (err) {
    if (err.code === "ERR_CANCELED") return;

    console.log("Task error:", err.response?.data || err.message);

    setTasks([]);
  }
};

const fetchUsers = async () => {
  try {
    const res = await API.get("/users");
    setUsers(res.data || []);
  } catch (err) {
    if (err.code === "ERR_CANCELED") return;

    console.log("User error:", err.response?.data || err.message);

    setUsers([]);
  }
};

  // ➕ create task
 const createTask = async () => {
  try {
    if (!taskData.title || !taskData.projectId || !taskData.assignedTo) {
      return alert("Fill all fields");
    }

    await API.post("/tasks", taskData);

    alert("Task assigned");
    fetchTasks();

  } catch (err) {
    console.log("Create error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Error creating task");
  }
};
  // 🔄 update status
const updateStatus = async (id, status) => {
  try {
    await API.put(`/tasks/${id}`, { status });

    fetchTasks();

  } catch (err) {
    console.log("Update error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Error updating status");
  }
};

  // 🚪 logout
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // 📊 project stats
  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(t => t.projectId?._id === projectId);

    return {
      total: projectTasks.length,
      todo: projectTasks.filter(t => t.status === "todo").length,
      inprogress: projectTasks.filter(t => t.status === "inprogress").length,
      done: projectTasks.filter(t => t.status === "done").length
    };
  };

  // 👤 member stats
  const getProjectMembersStats = (projectId) => {
    const projectTasks = tasks.filter(
      (t) => t.projectId?._id === projectId
    );

    const memberMap = {};

    projectTasks.forEach((t) => {
      const id = t.assignedTo?._id;

      if (!memberMap[id]) {
        memberMap[id] = {
          name: t.assignedTo?.name,
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

      {/* 📊 PROJECT SECTION */}
      {user.role === "admin" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Projects (Click to View Members)</h3>

          {projects.map((p) => {
            const stats = getProjectStats(p._id);
            const members = getProjectMembersStats(p._id);

            return (
              <div
                key={p._id}
                style={{
                  border: "2px solid #333",
                  margin: "10px",
                  padding: "10px",
                  cursor: "pointer"
                }}
                onClick={() =>
                  setSelectedProject(
                    selectedProject === p._id ? null : p._id
                  )
                }
              >
                <h4>{p.title}</h4>
                <p>
                  Todo: {stats.todo} | InProgress: {stats.inprogress} | Done: {stats.done}
                </p>

                {/* 🔥 EXPAND */}
                {selectedProject === p._id && (
                  <div style={{ marginTop: "10px", background: "#f5f5f5", padding: "10px" }}>
                    <h5>Member Status</h5>

                    {members.length === 0 && <p>No members assigned</p>}

                    {members.map((m, i) => (
                      <p key={i}>
                        <b>{m.name}</b> → 
                        Todo: {m.todo} | 
                        InProgress: {m.inprogress} | 
                        Done: {m.done}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ➕ CREATE TASK */}
      {user.role === "admin" && (
        <div style={{ marginTop: "20px" }}>
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
            {users
              .filter((u) => u.role === "member")
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
          </select>

          <button onClick={createTask}>Assign Task</button>
        </div>
      )}

      {/* 📋 TASK LIST */}
      <h3 style={{ marginTop: "20px" }}>Tasks</h3>

      {tasks.map((t) => (
        <div key={t._id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <p><b>{t.title}</b></p>
          <p>Status: {t.status}</p>
          <p>Project: {t.projectId?.title}</p>
          <p>Assigned To: {t.assignedTo?.name}</p>

          {(user.role === "admin" || user._id === t.assignedTo?._id) && (
            <>
              <button onClick={() => updateStatus(t._id, "todo")}>Todo</button>
              <button onClick={() => updateStatus(t._id, "inprogress")}>In Progress</button>
              <button onClick={() => updateStatus(t._id, "done")}>Done</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
