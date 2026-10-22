import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { BASE_URL } from '@env';

const PortfolioForm = ({ portfolio, onSubmit, onCancel, BASE_URL }) => {
  const [formData, setFormData] = useState({
    id: portfolio?.id || null,
    title: portfolio?.title || '',
    description: portfolio?.description || '',
    major: portfolio?.major || '',
    skill: portfolio?.skill || '',
    image: null, // For file input
  });

  const [imagePreview, setImagePreview] = useState(portfolio?.image ? `${BASE_URL}/storage/${portfolio.image}` : null);

  useEffect(() => {
    if (portfolio) {
      setFormData({
        id: portfolio.id || null,
        title: portfolio.title || '',
        description: portfolio.description || '',
        major: portfolio.major || '',
        skill: portfolio.skill || '',
        image: null,
      });
      setImagePreview(portfolio.image ? `${BASE_URL}/storage/${portfolio.image}` : null);
    } else {
      // Reset form for new portfolio
      setFormData({
        id: null,
        title: '',
        description: '',
        major: '',
        skill: '',
        image: null,
      });
      setImagePreview(null);
    }
  }, [portfolio, BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files.length > 0) {
      setFormData({
        ...formData,
        image: files[0],
      });
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else if (name !== 'image') {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = new FormData();
    dataToSubmit.append('title', formData.title);
    dataToSubmit.append('description', formData.description);
    dataToSubmit.append('major', formData.major);
    dataToSubmit.append('skill', formData.skill);
    if (formData.image) {
      dataToSubmit.append('image', formData.image);
    }
    if (formData.id) {
      // If editing, include ID - this might need adjustment based on your API structure
      // For example, you might need a separate PUT request or append ID differently
      // For now, assuming onSubmit handles whether it's a POST or PUT based on formData.id
      // A common pattern is to pass the ID separately or use a different handler for update
    }
    onSubmit(formData.id ? { ...formData, id: formData.id } : formData); // Pass form data or ID + fields
  };

  return (
    <div className="portfolio-form-container">
      <h2>{portfolio ? 'Ubah Portofolio' : 'Tambah Portofolio'}</h2>
      <form onSubmit={handleSubmit} className="portfolio-form">
        <div className="form-group">
          <label htmlFor="title">Judul Portofolio</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Deskripsi</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="major">Jurusan</label>
          <input
            type="text"
            id="major"
            name="major"
            value={formData.major}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="skill">Skill</label>
          <input
            type="text"
            id="skill"
            name="skill"
            value={formData.skill}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Gambar Portofolio</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
            {...(portfolio ? {} : { required: true })} // Image is required for new portfolios
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Image Preview" />
              <button type="button" onClick={() => {
                setFormData({ ...formData, image: null });
                setImagePreview(null);
              }}>Hapus Gambar</button>
            </div>
          )}
        </div>
        <div className="form-group form-actions">
          <button type="submit" className="smk-btn-primary">
            {portfolio ? 'Simpan Perubahan' : 'Simpan Portofolio'}
          </button>
          <button type="button" onClick={onCancel} className="smk-btn-secondary">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;
