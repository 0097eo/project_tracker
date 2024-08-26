import React, { useState, useEffect } from 'react';
import axios from 'axios';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('cohorts');
  const [cohorts, setCohorts] = useState([]);
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newCohort, setNewCohort] = useState({ name: '', start_date: '', end_date: '', course_type: '' });
  const [newProject, setNewProject] = useState({ name: '', description: '', github_link: '', cohort_id: '', owner_id: '' });

  useEffect(() => {
    fetchCohorts();
    fetchStudents();
    fetchProjects();
  }, []);

  const fetchCohorts = async () => {
    try {
      const response = await axios.get('/cohorts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setCohorts(response.data.cohorts);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/students', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAddCohort = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      await axios.post('/admin/cohorts', newCohort, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      setNewCohort({ name: '', start_date: '', end_date: '', course_type: '' });
      fetchCohorts();
    } catch (error) {
      console.error('Error adding cohort:', error);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post('/admin/projects', newProject, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNewProject({ name: '', description: '', github_link: '', cohort_id: '', owner_id: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`/admin/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleAddStudentToCohort = async (e) => {
    e.preventDefault();
    const studentId = e.target.student.value;
    const cohortId = e.target.cohort.value;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post('/admin/add-student-to-cohort', { student_id: studentId, cohort_id: cohortId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCohorts();
      fetchStudents();
    } catch (error) {
      console.error('Error adding student to cohort:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-content">
        <div className="sidebar">
          <button onClick={() => setActiveTab('cohorts')}>Cohorts</button>
          <button onClick={() => setActiveTab('students')}>Students</button>
          <button onClick={() => setActiveTab('projects')}>Projects</button>
          <button onClick={() => setActiveTab('addCohort')}>Add Cohort</button>
          <button onClick={() => setActiveTab('addProject')}>Add Project</button>
        </div>
        <div className="main-content">
          {activeTab === 'cohorts' && (
            <section>
              <h2>Cohorts</h2>
              <ul>
                {cohorts.map((cohort) => (
                  <li key={cohort.id}>
                    {cohort.name} - {cohort.course_type}
                    <ul>
                      {cohort.students.map((student) => (
                        <li key={student}>{student}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'students' && (
            <section>
              <h2>Add Student to Cohort</h2>
              <form onSubmit={handleAddStudentToCohort}>
                <select name="student">
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.username}</option>
                  ))}
                </select>
                <select name="cohort">
                  <option value="">Select Cohort</option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </select>
                <button type="submit">Add Student to Cohort</button>
              </form>
            </section>
          )}

          {activeTab === 'projects' && (
            <section>
              <h2>Projects</h2>
              <ul>
                {projects.map((project) => (
                  <li key={project.id}>
                    {project.name} - {project.description}
                    <button onClick={() => handleDeleteProject(project.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'addCohort' && (
            <section>
              <h2>Add Cohort</h2>
              <form onSubmit={handleAddCohort}>
                <input
                  type="text"
                  placeholder="Cohort Name"
                  value={newCohort.name}
                  onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={newCohort.start_date}
                  onChange={(e) => setNewCohort({ ...newCohort, start_date: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={newCohort.end_date}
                  onChange={(e) => setNewCohort({ ...newCohort, end_date: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Course Type"
                  value={newCohort.course_type}
                  onChange={(e) => setNewCohort({ ...newCohort, course_type: e.target.value })}
                />
                <button type="submit">Add Cohort</button>
              </form>
            </section>
          )}

          {activeTab === 'addProject' && (
            <section>
              <h2>Add Project</h2>
              <form onSubmit={handleAddProject}>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="GitHub Link"
                  value={newProject.github_link}
                  onChange={(e) => setNewProject({ ...newProject, github_link: e.target.value })}
                />
                <select
                  value={newProject.cohort_id}
                  onChange={(e) => setNewProject({ ...newProject, cohort_id: e.target.value })}
                >
                  <option value="">Select Cohort</option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </select>
                <select
                  value={newProject.owner_id}
                  onChange={(e) => setNewProject({ ...newProject, owner_id: e.target.value })}
                >
                  <option value="">Select Owner</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.username}</option>
                  ))}
                </select>
                <button type="submit">Add Project</button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;