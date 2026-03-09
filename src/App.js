import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { auth, provider, signInWithPopup, signOut } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", departmentId: "" });
  const [newDeptName, setNewDeptName] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const API = "https://student-managementsystemb.onrender.com/"; // UPDATE THIS TO YOUR RENDER URL
  const ADMIN_EMAIL = "abhiraj.srivast254@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    loadData();
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => { unsubscribe(); clearInterval(timer); };
  }, []);

  const loadData = async () => {
    try {
      const [stuRes, deptRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/departments`)
      ]);
      setStudents(stuRes.data);
      setDepartments(deptRes.data);
    } catch (err) { console.error("Sync Error", err); }
  };

  const handleLogin = () => signInWithPopup(auth, provider);
  const handleLogout = () => signOut(auth);

  // --- Student Actions ---
  const handleSubmit = async () => {
    if (!user) return alert("Please login first");
    const payload = { name: form.name, email: form.email, department: { id: parseInt(form.departmentId) }};
    try {
      if (editId) {
        await axios.put(`${API}/students/${editId}`, payload);
        setEditId(null);
      } else {
        await axios.post(`${API}/students`, payload);
      }
      setForm({ name: "", email: "", departmentId: "" });
      loadData();
    } catch (err) { alert("Action failed."); }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Delete record?")) {
      await axios.delete(`${API}/students/${id}`);
      loadData();
    }
  };

  // --- Department Actions ---
  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      await axios.post(`${API}/departments`, { name: newDeptName });
      setNewDeptName("");
      loadData();
    } catch (err) { alert("Failed to add department"); }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const deptCounts = departments.map(d => ({
      name: d.name,
      students: students.filter(s => s.department?.id === d.id).length
    }));
    return { total: students.length, deptCounts };
  }, [students, departments]);

  return (
    <div className="container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">
          <div className="logo-icon">E</div>
          <div><h1>EduManage Pro</h1><span className="system-status">Online • {time}</span></div>
        </div>
        <div className="nav-actions">
          <input className="nav-search" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.displayName}</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="btn-login" onClick={handleLogin}>Login</button>
          )}
        </div>
      </nav>

      {/* DASHBOARD */}
      <div className="dashboard-row">
        <div className="stats-grid-mini">
          <div className="stat-card"><span>Total Students</span><h2>{stats.total}</h2></div>
          <div className="stat-card"><span>Departments</span><h2>{departments.length}</h2></div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.deptCounts}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none'}} />
              <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="main-content">
        {user ? (
          <>
            {/* DEPARTMENT CREATION (Admin Only) */}
            {user.email === ADMIN_EMAIL && (
              <section className="card dept-card">
                <h3>Manage Departments</h3>
                <div className="input-group">
                  <input 
                    placeholder="New Dept Name (e.g. Physics)" 
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                  />
                  <button className="btn-add" onClick={handleAddDepartment}>Add Dept</button>
                </div>
              </section>
            )}

            {/* STUDENT REGISTRATION */}
            <section className="card form-section">
              <h3>{editId ? "Update Record" : "Register Student"}</h3>
              <div className="input-group">
                <input value={form.name} placeholder="Name" onChange={(e) => setForm({...form, name: e.target.value})} />
                <input value={form.email} placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} />
                <select value={form.departmentId} onChange={(e) => setForm({...form, departmentId: e.target.value})}>
                  <option value="">Select Dept</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button className="btn-add" onClick={handleSubmit}>{editId ? "Update" : "Add"}</button>
              </div>
            </section>
          </>
        ) : (
          <div className="card login-prompt">Please login to manage the database.</div>
        )}

        {/* STUDENT TABLE */}
        <section className="card list-section">
          <div className="table-responsive">
            <table className="student-table">
              <thead><tr><th>Name</th><th>Email</th><th>Dept</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td><td>{s.email}</td>
                    <td><span className="dept-tag">{s.department?.name}</span></td>
                    <td style={{textAlign: 'right'}}>
                      {(user?.email === ADMIN_EMAIL || user?.email === s.email) ? (
                        <>
                          <button className="btn-edit" onClick={() => {
                            setEditId(s.id);
                            setForm({name: s.name, email: s.email, departmentId: s.department?.id});
                          }}>Edit</button>
                          <button className="btn-delete" onClick={() => deleteStudent(s.id)}>Delete</button>
                        </>
                      ) : (
                        <span className="read-only">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;