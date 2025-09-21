"use client";

import { useEffect, useState } from "react";
import "./petlogix.css";

const SERVER_URL = "/api";

export default function PetlogixPage() {
  const [pets, setPets] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [form, setForm] = useState({
    name: "",
    owner: "",
    address: "",
    contact: "",
    species: "",
    breed: "",
    imageUrl: "",
    imageFile: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPet, setSelectedPet] = useState(null); // For detailed view

  // Fetch pets
  const fetchPets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(SERVER_URL);
      const data = await res.json();
      if (data.success) setPets(data.pets);
      else {
        setMessage(data.message);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Failed to fetch pets");
      setMessageType("error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, imageFile: file, imageUrl: "" });
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setIsLoading(true);

    let imageBase64 = form.imageUrl;

    if (form.imageFile) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(form.imageFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    }

    const payload = {
      name: form.name,
      owner: form.owner,
      address: form.address,
      contact: form.contact,
      species: form.species,
      breed: form.breed,
      imageUrl: imageBase64,
    };

    let res;
    if (editingId) {
      res = await fetch(`${SERVER_URL}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      setEditingId(null);
    } else {
      res = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    setMessage(data.message);
    setMessageType(data.success ? "success" : "error");

    if (data.success) {
      setForm({
        name: "",
        owner: "",
        address: "",
        contact: "",
        species: "",
        breed: "",
        imageUrl: "",
        imageFile: null,
      });
      setImagePreview(null);
      fetchPets();
    }
  } catch (err) {
    setMessage("Failed to submit pet data");
    setMessageType("error");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

// In handleDelete, ensure you're using the correct endpoint:
const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this pet?")) return;

  try {
    setIsLoading(true);

    const res = await fetch(`${SERVER_URL}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }), // send id in body
    });

    const data = await res.json(); // parse JSON response
    setMessage(data.message);
    setMessageType(data.success ? "success" : "error");

    fetchPets(); // refresh list
  } catch (err) {
    setMessage("Failed to delete pet");
    setMessageType("error");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

  const handleEdit = (pet) => {
    setForm({
      ...pet,
      imageFile: null
    });
    setEditingId(pet.id);
    setImagePreview(pet.imageUrl || null);
    // Scroll to form
    document.getElementById("pet-form").scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      owner: "",
      address: "",
      contact: "",
      species: "",
      breed: "",
      imageUrl: "",
      imageFile: null,
    });
    setImagePreview(null);
  };

  // Show pet details
  const showPetDetails = (pet) => {
    setSelectedPet(pet);
  };

  // Close pet details
  const closePetDetails = () => {
    setSelectedPet(null);
  };

  // Filter pets by species and search query
  const filteredPets = (activeTab === "all" 
    ? pets 
    : pets.filter(pet => pet.species.toLowerCase() === activeTab)
  ).filter(pet => 
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="petlogix-modern-container">
      <header className="modern-app-header">
        <div className="modern-header-content">
          <div className="modern-logo">
            <span className="modern-paw-icon">🐾</span>
            <h1>Petlogix</h1>
          </div>
          <p className="modern-tagline">Where every pet's story begins</p>
        </div>
        <div className="modern-header-decoration">
          <div className="modern-decoration-item"></div>
          <div className="modern-decoration-item"></div>
          <div className="modern-decoration-item"></div>
        </div>
        <div className="modern-floating-pets">
          <span className="modern-floating-pet">🐕</span>
          <span className="modern-floating-pet">🐈</span>
          <span className="modern-floating-pet">🐇</span>
          <span className="modern-floating-pet">🐠</span>
        </div>
      </header>

      {message && (
        <div className={`modern-notification ${messageType}`}>
          <div className="modern-notification-content">
            <span className="modern-notification-icon">
              {messageType === "success" ? "✓" : "⚠"}
            </span>
            {message}
          </div>
          <button onClick={() => setMessage(null)} className="modern-close-btn">
            &times;
          </button>
        </div>
      )}

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="modern-modal-overlay" onClick={closePetDetails}>
          <div className="modern-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h2>{selectedPet.name}'s Details</h2>
              <button className="modern-modal-close" onClick={closePetDetails}>
                &times;
              </button>
            </div>
            <div className="modern-modal-body">
              <div className="modern-modal-image">
                {selectedPet.imageUrl ? (
                  <img src={selectedPet.imageUrl} alt={selectedPet.name} />
                ) : (
                  <div className="modern-image-placeholder-large">
                    {selectedPet.species === "dog" ? "🐶" : 
                     selectedPet.species === "cat" ? "🐱" : 
                     selectedPet.species === "bird" ? "🐦" : 
                     selectedPet.species === "rabbit" ? "🐰" : "🐾"}
                  </div>
                )}
              </div>
              <div className="modern-modal-details">
                <div className="modern-modal-detail-row">
                  <span className="modern-modal-label">Owner:</span>
                  <span className="modern-modal-value">{selectedPet.owner}</span>
                </div>
                <div className="modern-modal-detail-row">
                  <span className="modern-modal-label">Species:</span>
                  <span className="modern-modal-value">{selectedPet.species}</span>
                </div>
                <div className="modern-modal-detail-row">
                  <span className="modern-modal-label">Breed:</span>
                  <span className="modern-modal-value">{selectedPet.breed || "Unknown"}</span>
                </div>
                {selectedPet.address && (
                  <div className="modern-modal-detail-row">
                    <span className="modern-modal-label">Address:</span>
                    <span className="modern-modal-value">{selectedPet.address}</span>
                  </div>
                )}
                {selectedPet.contact && (
                  <div className="modern-modal-detail-row">
                    <span className="modern-modal-label">Contact:</span>
                    <span className="modern-modal-value">{selectedPet.contact}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modern-modal-actions">
              <button
                onClick={() => handleEdit(selectedPet)}
                className="modern-edit-btn"
              >
                <span className="modern-btn-icon">✏️</span> Edit
              </button>
              <button
                onClick={() => {
                  closePetDetails();
                  handleDelete(selectedPet.id);
                }}
                className="modern-delete-btn"
              >
                <span className="modern-btn-icon">🗑️</span> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="modern-form-section">
        <div className="modern-section-header">
          <h2>{editingId ? "Edit Pet Details" : "Add a New Family Member"}</h2>
          <p>{editingId ? "Update your pet's information" : "Share your furry friend with the world"}</p>
          <div className="modern-section-divider"></div>
        </div>
        <form
          id="pet-form"
          onSubmit={handleSubmit}
          className="modern-pet-form"
          encType="multipart/form-data"
        >
          <div className="modern-form-grid">
            <div className="modern-input-group">
              <label htmlFor="name">Pet Name *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Luna, Max, Bella"
                required
              />
            </div>
            
            <div className="modern-input-group">
              <label htmlFor="owner">Owner Name *</label>
              <input
                id="owner"
                name="owner"
                value={form.owner}
                onChange={handleChange}
                placeholder="e.g. Sarah Johnson"
                required
              />
            </div>
            
            <div className="modern-input-group">
              <label htmlFor="address">Home Address</label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 123 Old Cabalan"
              />
            </div>
            
            <div className="modern-input-group">
              <label htmlFor="contact">Contact Number</label>
              <input
                id="contact"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="e.g. 0917-123-4567 "
              />
            </div>
            
            <div className="modern-input-group">
              <label htmlFor="species">Species</label>
              <div className="modern-select-wrapper">
                <select
                  id="species"
                  name="species"
                  value={form.species}
                  onChange={handleChange}
                >
                  <option value="">Select a species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="hamster">Hamster</option>
                  <option value="other">Other</option>
                </select>
                <span className="modern-select-arrow">▼</span>
              </div>
            </div>
            
            <div className="modern-input-group">
              <label htmlFor="breed">Breed</label>
              <input
                id="breed"
                name="breed"
                value={form.breed}
                onChange={handleChange}
                placeholder="e.g. Golden Retriever, Siamese"
              />
            </div>
            
            
            <div className="modern-input-group full-width">
              <label htmlFor="imageUpload">Upload a Photo of Your Adorable Pet</label>
              <div className="modern-file-input-container">
                <label htmlFor="imageUpload" className="modern-file-input-label">
                  <span className="modern-file-input-button">Choose File</span>
                  <span className="modern-file-input-text">
                    {form.imageFile ? form.imageFile.name : "No file chosen"}
                  </span>
                </label>
                <input
                  id="imageUpload"
                  name="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="modern-file-input"
                />
              </div>
              {imagePreview && (
                <div className="modern-image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button" 
                    className="modern-remove-image-btn"
                    onClick={() => {
                      setImagePreview(null);
                      setForm({...form, imageFile: null});
                    }}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modern-form-actions">
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="modern-secondary-btn"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="modern-primary-btn"
            >
              {isLoading ? (
                <span className="modern-button-loading">
                  <span className="modern-spinner"></span>
                  {editingId ? "Updating..." : "Adding..."}
                </span>
              ) : editingId ? (
                <>
                  <span className="modern-btn-icon">✓</span>
                  Update Pet
                </>
              ) : (
                <>
                  <span className="modern-btn-icon">+</span>
                  Add Pet
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="modern-pets-section">
        <div className="modern-section-header">
          <h2>Your Furry Family ({pets.length})</h2>
          <p>All your beloved companions in one place</p>
          <div className="modern-section-divider"></div>
        </div>
        
        <div className="modern-controls-row">
          <div className="modern-filter-tabs">
            <button 
              className={activeTab === "all" ? "modern-tab active" : "modern-tab"}
              onClick={() => setActiveTab("all")}
            >
              All Pets
            </button>
            <button 
              className={activeTab === "dog" ? "modern-tab active" : "modern-tab"}
              onClick={() => setActiveTab("dog")}
            >
              Dogs
            </button>
            <button 
              className={activeTab === "cat" ? "modern-tab active" : "modern-tab"}
              onClick={() => setActiveTab("cat")}
            >
              Cats
            </button>
            <button 
              className={activeTab === "other" ? "modern-tab active" : "modern-tab"}
              onClick={() => setActiveTab("other")}
            >
              Others
            </button>
          </div>
          
          <div className="modern-search-container">
            <input
              type="text"
              placeholder="Search pets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modern-search-input"
            />
            <span className="modern-search-icon">🔍</span>
          </div>
        </div>
        
        {isLoading && pets.length === 0 ? (
          <div className="modern-loading">
            <div className="modern-spinner"></div>
            Loading your pets...
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="modern-empty-state">
            <div className="modern-empty-icon">🐶</div>
            <h3>No pets found</h3>
            <p>{activeTab !== "all" ? `You don't have any ${activeTab}s yet.` : "No pets added yet. Start by adding your first pet!"}</p>
            {activeTab !== "all" && (
              <button className="modern-primary-btn" onClick={() => setActiveTab("all")}>
                View All Pets
              </button>
            )}
          </div>
        ) : (
          <div className="modern-pets-grid">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="modern-pet-card" onClick={() => showPetDetails(pet)}>
                <div className="modern-pet-image-container">
                  <div className="modern-pet-image">
                    {pet.imageUrl ? (
                      <img src={pet.imageUrl} alt={pet.name} />
                    ) : (
                      <div className="modern-image-placeholder">
                        {pet.species === "dog" ? "🐶" : 
                         pet.species === "cat" ? "🐱" : 
                         pet.species === "bird" ? "🐦" : 
                         pet.species === "rabbit" ? "🐰" : "🐾"}
                      </div>
                    )}
                  </div>
                  <div className="modern-pet-species-badge">{pet.species || "Pet"}</div>
                  <div className="modern-pet-card-heart">❤️</div>
                </div>
                
                <div className="modern-pet-info">
                  <h3>{pet.name}</h3>
                  <p className="modern-pet-owner">Loved by {pet.owner}</p>
                  
                  <div className="modern-pet-details">
                    {pet.breed && (
                      <span className="modern-detail-tag">{pet.breed}</span>
                    )}
                    {pet.species && (
                      <span className="modern-detail-tag">{pet.species}</span>
                    )}
                  </div>
                  
                  {pet.address && (
                    <p className="modern-pet-address">
                      <span className="modern-icon">📍</span> {pet.address}
                    </p>
                  )}
                  
                  {pet.contact && (
                    <p className="modern-pet-contact">
                      <span className="modern-icon">📞</span> {pet.contact}
                    </p>
                  )}
                </div>
                
                <div className="modern-pet-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(pet);
                    }}
                    className="modern-edit-btn"
                    disabled={isLoading}
                  >
                    <span className="modern-btn-icon">✏️</span> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pet.id);
                    }}
                    className="modern-delete-btn"
                    disabled={isLoading}
                  >
                    <span className="modern-btn-icon">🗑️</span> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="modern-app-footer">
        <p>Made with ❤️ for pet lovers everywhere — celebrating the bond between people and their pets.</p>
        <div className="modern-footer-paws">
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
        </div>
      </footer>
    </div>
  );
}