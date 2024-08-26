import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import { IoArrowBack, IoArrowForward} from 'react-icons/io5';


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
  
      <div className="project-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleCardClick(project)}
            className="project-card"
          >
            <h3>{project.name}</h3>
            <p>{project.description.substring(0, 100)}...</p>
            <p>{project.cohort}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1} className='pagination-btn'>
        <IoArrowBack size={24} />
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className='pagination-btn'>
        <IoArrowForward size={24} />
        </button>
      </div>

      {selectedProject && (
        <div className="modal">
          <div className="modal-content">
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
