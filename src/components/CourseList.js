import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container, Modal, Alert, Spinner } from 'react-bootstrap';
import { courseAPI } from '../services/api';
import { FaEdit, FaTrash, FaFilePdf, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import CourseForm from './CourseForm';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await courseAPI.getAllCourses();
            console.log('API Response:', response.data);
            
            if (response.data && response.data.success) {
                setCourses(response.data.data);
            } else {
                setError('Failed to fetch courses. Invalid response format.');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to fetch courses. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setShowModal(true);
    };

    const handleDelete = (course) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            console.log(`Attempting to delete course ID: ${courseToDelete.id}`);
            console.log(`Sending DELETE request to: /api/courses/${courseToDelete.id}`);
            
            const response = await courseAPI.deleteCourse(courseToDelete.id);
            console.log('Delete response:', response.data);
            
            if (response.data && response.data.success) {
                console.log('Course deleted successfully');
                await fetchCourses();
                setShowDeleteModal(false);
                setCourseToDelete(null);
            } else {
                console.error('Delete failed - invalid response:', response.data);
                setError(response.data?.message || 'Failed to delete course. Invalid response.');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            
            // Detailed error logging
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            if (error.response?.data?.message) {
                setError(`Delete failed: ${error.response.data.message}`);
            } else if (error.response?.status === 419) {
                setError('CSRF token mismatch. Please refresh the page and try again.');
            } else if (error.response) {
                setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                setError('No response from server. Check if Laravel is running.');
            } else {
                setError(`Error: ${error.message}`);
            }
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingCourse(null);
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return null;
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf className="text-danger" />;
        return <FaDownload />;
    };

    const getThumbnailUrl = (thumbnailPath) => {
        if (!thumbnailPath) return null;

        const path = thumbnailPath.replace('courses/', '');
        return `http://localhost:8000/storage/${path}`;
    };

    const getFileName = (filePath) => {
        if (!filePath) return '';
        return filePath.split('/').pop();
    };

    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading courses...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <FaExclamationTriangle className="me-2" />
                    {error}
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="ms-3"
                        onClick={fetchCourses}
                    >
                        Retry
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Course Management</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Add New Course
                </Button>
            </div>

            {courses.length === 0 ? (
                <Alert variant="info">
                    No courses found. Add your first course!
                </Alert>
            ) : (
                <Row>
                    {courses.map((course) => (
                        <Col key={course.id} md={4} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                {course.thumbnail && (
                                    <Card.Img 
                                        variant="top" 
                                        src={getThumbnailUrl(course.thumbnail)} 
                                        alt={course.name}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                        }}
                                    />
                                )}
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{course.name}</Card.Title>
                                    <Card.Text className="flex-grow-1">
                                        {course.description.length > 100 
                                            ? `${course.description.substring(0, 100)}...` 
                                            : course.description}
                                    </Card.Text>
                                    
                                    {course.content_file && (
                                        <div className="mb-3">
                                            <small className="text-muted d-flex align-items-center">
                                                {getFileIcon(course.content_file)}
                                                <span className="ms-2">
                                                    {getFileName(course.content_file)}
                                                </span>
                                            </small>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between mt-auto">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleEdit(course)}
                                        >
                                            <FaEdit /> Edit
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(course)}
                                        >
                                            <FaTrash /> Delete
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <CourseForm
                show={showModal}
                handleClose={handleClose}
                course={editingCourse}
                refreshCourses={fetchCourses}
            />

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the course "{courseToDelete?.name}"?
                    This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CourseList;
