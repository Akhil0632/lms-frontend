import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { courseAPI } from '../services/api';

const CourseForm = ({ show, handleClose, course, refreshCourses }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        thumbnail: null,
        content_file: null
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                name: course.name || '',
                description: course.description || '',
                thumbnail: null,
                content_file: null
            });
        } else {
            resetForm();
        }
    }, [course]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            thumbnail: null,
            content_file: null
        });
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        
        if (formData.thumbnail) {
            data.append('thumbnail', formData.thumbnail);
        }
        
        if (formData.content_file) {
            data.append('content_file', formData.content_file);
        }

        try {
            if (course) {
                await courseAPI.updateCourse(course.id, data);
            } else {
                await courseAPI.createCourse(data);
            }
            
            refreshCourses();
            handleClose();
            resetForm();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'An error occurred. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{course ? 'Edit Course' : 'Add New Course'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {errors.general && (
                        <Alert variant="danger">{errors.general}</Alert>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Course Name *</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            isInvalid={!!errors.name}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.[0]}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            isInvalid={!!errors.description}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.[0]}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Thumbnail Image</Form.Label>
                        <Form.Control
                            type="file"
                            name="thumbnail"
                            accept="image/*"
                            onChange={handleFileChange}
                            isInvalid={!!errors.thumbnail}
                        />
                        <Form.Text className="text-muted">
                            Recommended size: 400x300px. Max size: 2MB
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                            {errors.thumbnail?.[0]}
                        </Form.Control.Feedback>
                        
                        {course?.thumbnail && !formData.thumbnail && (
                            <div className="mt-2">
                                <small>Current thumbnail:</small>
                                <img 
                                    src={`http://localhost:8000/storage/${course.thumbnail}`} 
                                    alt="Current thumbnail" 
                                    style={{ width: '100px', height: 'auto', display: 'block' }}
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Content File (PDF, DOC, PPT, TXT)</Form.Label>
                        <Form.Control
                            type="file"
                            name="content_file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                            onChange={handleFileChange}
                            isInvalid={!!errors.content_file}
                        />
                        <Form.Text className="text-muted">
                            Max size: 5MB
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                            {errors.content_file?.[0]}
                        </Form.Control.Feedback>
                        
                        {course?.content_file && !formData.content_file && (
                            <div className="mt-2">
                                <small>Current file: {course.content_file.split('/').pop()}</small>
                            </div>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (course ? 'Update Course' : 'Create Course')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CourseForm;