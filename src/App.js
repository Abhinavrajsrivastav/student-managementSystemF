import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false); // Added for UX

  // 1. CHANGE THIS URL to your actual Render URL
  const API = "https://student-managementsystemb.onrender.com/students";

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setStudents(res.data);
    } catch (err) {
      console.error("Error loading students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) return alert("Please fill in required fields");

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post(API, form);
      }
      setForm({ name: "", email: "", course: "" });
      loadStudents();
    } catch (err) {
      alert("Action failed. The server might be waking up, please try again.");
    }
  };

  const handleEdit = (student) => {
    setEditId(student.id);
    setForm({ name: student.name, email: student.email, course: student.course });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`${API}/${id}`);
        loadStudents();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Student Management Portal</h1>
      </header>

      <div className="main-content">
        <section className="card form-section">
          <h3>{editId ? "Update Student Info" : "Register New Student"}</h3>
          <div className="input-group">
            <input name="name" value={form.name} placeholder="Full Name" onChange={handleChange} />
            <input name="email" value={form.email} placeholder="Email Address" onChange={handleChange} />
            <input name="course" value={form.course} placeholder="Course Name" onChange={handleChange} />
            
            <button className={editId ? "btn-update" : "btn-add"} onClick={handleSubmit}>
              {editId ? "Update Student" : "Add Student"}
            </button>
            
            {editId && (
              <button className="btn-cancel" onClick={() => { setEditId(null); setForm({ name: "", email: "", course: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="card list-section">
          <div className="list-header">
            <h3>Enrolled Students</h3>
            {loading && <span className="loader-text">Connecting to server...</span>}
          </div>
          
          <table className="student-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className={editId === s.id ? "editing-row" : ""}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.course}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(s)}>Edit</button>
                    <button className="btn-delete" onClick={() => deleteStudent(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && students.length === 0 && <p className="empty-msg">No students found.</p>}
        </section>
      </div>
    </div>
  );
}

export default App;