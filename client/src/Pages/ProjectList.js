import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const fetchProjects = async (page) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`/projects/all?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data.projects);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCardClick = (project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <h1>Projects</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleCardClick(project)}
            style={{
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '10px',
              width: '200px',
              cursor: 'pointer',
            }}
          >
            <h3>{project.name}</h3>
            <p>{project.description.substring(0, 50)}...</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {selectedProject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              maxWidth: '500px',
            }}
          >
            <h2>{selectedProject.name}</h2>
            <p>
              <strong>Description:</strong> {selectedProject.description}
            </p>
            <p>
              <strong>GitHub Link:</strong>{' '}
              <a
                href={selectedProject.github_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedProject.github_link}
              </a>
            </p>
            <p>
              <strong>Cohort:</strong> {selectedProject.cohort}
            </p>
            <p>
              <strong>Owner:</strong> {selectedProject.owner_name}
            </p>
            <p>
              <strong>Members:</strong> {selectedProject.members.join(', ')}
            </p>
            <p>
              <strong>Created:</strong> {selectedProject.created_at}
            </p>
            <p>
              <strong>Last Updated:</strong> {selectedProject.updated_at}
            </p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
