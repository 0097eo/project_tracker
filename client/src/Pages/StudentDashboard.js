import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Utils/AuthContext';


const ProjectCard = ({ project, onClick }) => (
  <div className="project-card" onClick={() => onClick(project)}>
    <h3>{project.name}</h3>
    <p>{project.description.substring(0, 100)}...</p>
  </div>
);

const ProjectDetails = ({ project, onClose }) => (
  <div className="project-details">
    <h2>{project.name}</h2>
    <p>{project.description}</p>
    <a href={project.github_link} target="_blank" rel="noopener noreferrer">GitHub</a>
    <p>Members: {project.members.join(', ')}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('allProjects');
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', github_link: '' });
  const [selectedProject, setSelectedProject] = useState(null);
  const [newMember, setNewMember] = useState('');
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);

  const handleProjectClick = (project) => {
    setSelectedProjectDetails(project);
  };

  const closeProjectDetails = () => {
    setSelectedProjectDetails(null);
  };

  const renderProjects = (projectList) => (
    <div className="project-list">
      {projectList.map(project => (
        <ProjectCard key={project.id} project={project} onClick={handleProjectClick} />
      ))}
    </div>
  );

  useEffect(() => {
    if (user) {
      fetchProjects(1);
      fetchStudents();
    }
  }, [user]);

  const fetchProjects = async (page) => {
    try {
      const response = await axios.get(`/projects/all?page=${page}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setProjects(response.data.projects);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching projects:', error);
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/projects', newProject, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setNewProject({ name: '', description: '', github_link: '' });
      fetchProjects(1);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProject || !newMember) return;
    try {
      await axios.put(`/projects/${selectedProject.id}`, {
        member_usernames: [newMember]
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setNewMember('');
      fetchProjects(currentPage);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const userProjects = projects.filter(project => project.members.includes(user?.username));

  return (
    <div className="student-dashboard">
      <h1>Welcome, {user?.username}!</h1>
      <div className="sidebar">
        <button onClick={() => setActiveTab('allProjects')}>All Projects</button>
        <button onClick={() => setActiveTab('myProjects')}>My Projects</button>
        <button onClick={() => setActiveTab('addProject')}>Add Project</button>
        <button onClick={() => setActiveTab('addMember')}>Add Group Member</button>
      </div>
      <div className="content">
        {selectedProjectDetails ? (
          <ProjectDetails project={selectedProjectDetails} onClose={closeProjectDetails} />
        ) : (
          <>
            {activeTab === 'allProjects' && (
              <div>
                <h2>All Projects</h2>
                {renderProjects(projects)}
                <div>
                  <button onClick={() => fetchProjects(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button onClick={() => fetchProjects(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </div>
              </div>
            )}
            {activeTab === 'myProjects' && (
              <div>
                <h2>My Projects</h2>
                {renderProjects(userProjects)}
              </div>
            )}
            {activeTab === 'addProject' && (
              <div>
                <h2>Add New Project</h2>
                <form onSubmit={handleCreateProject}>
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Project Description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    required
                  />
                  <input
                    type="url"
                    placeholder="GitHub Link"
                    value={newProject.github_link}
                    onChange={(e) => setNewProject({...newProject, github_link: e.target.value})}
                    required
                  />
                  <button type="submit">Create Project</button>
                </form>
              </div>
            )}
            {activeTab === 'addMember' && (
              <div>
                <h2>Add Group Member</h2>
                <select onChange={(e) => setSelectedProject(projects.find(p => p.id === parseInt(e.target.value)))}>
                  <option value="">Select a project</option>
                  {userProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                {selectedProject && (
                  <form onSubmit={handleAddMember}>
                    <select
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      required
                    >
                      <option value="">Select a student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.username}>{student.username}</option>
                      ))}
                    </select>
                    <button type="submit">Add Member</button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
