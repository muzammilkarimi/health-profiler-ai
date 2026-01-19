import { useState } from 'react'
import './App.css'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [inputMode, setInputMode] = useState('manual') // 'manual' or 'upload'
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    smoker: false,
    exercise: 'rarely',
    diet: '',
    health_notes: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const data = new FormData()
    data.append('name', formData.name)
    data.append('age', formData.age)
    data.append('smoker', formData.smoker)
    data.append('exercise', formData.exercise)
    data.append('diet', formData.diet)
    data.append('health_notes', formData.health_notes)

    if (inputMode === 'upload' && image) {
      data.append('image', image)
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: data,
      })
      const resultData = await response.json()
      setResult(resultData)
    } catch (error) {
      console.error("Error:", error)
      setResult({ error: "Failed to fetch" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>Health Profiler</h1>
        <p className="subtitle">AI-Powered Medical Report Analysis</p>
      </header>

      <div className="main-content">
        <div className="mode-selector">
          <button
            className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
            onClick={() => setInputMode('manual')}
          >
            Manual Entry
          </button>
          <button
            className={`mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
            onClick={() => setInputMode('upload')}
          >
            Report Upload
          </button>
        </div>

        <div className="layout-grid">
          <div className="form-column">
            <div className="card form-card">
              <form onSubmit={handleSubmit} className="health-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {inputMode === 'manual' ? (
                  <>
                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label htmlFor="age">Age</label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder="25"
                          required
                        />
                      </div>
                      <div className="form-group flex-1 checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="smoker"
                            checked={formData.smoker}
                            onChange={(e) => setFormData(prev => ({ ...prev, smoker: e.target.checked }))}
                          />
                          <span>Smoker?</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="exercise">Exercise Frequency</label>
                      <select
                        id="exercise"
                        name="exercise"
                        value={formData.exercise}
                        onChange={handleInputChange}
                      >
                        <option value="rarely">Rarely</option>
                        <option value="occasionally">Occasionally</option>
                        <option value="regularly">Regularly</option>
                        <option value="athlete">Athlete / Daily</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="diet">Diet Description</label>
                      <input
                        type="text"
                        id="diet"
                        name="diet"
                        value={formData.diet}
                        onChange={handleInputChange}
                        placeholder="e.g., high sugar, balanced, keto"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label htmlFor="image">Upload Health Report / Image</label>
                    <div className="file-upload-wrapper">
                      <div className="drop-zone" onClick={() => document.getElementById('image').click()}>
                        {preview ? (
                          <div className="image-preview">
                            <img src={preview} alt="Report preview" />
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            <p>Click or drag image here</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        required={inputMode === 'upload'}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="health_notes">Additional Medical Notes (Optional)</label>
                  <textarea
                    id="health_notes"
                    name="health_notes"
                    value={formData.health_notes}
                    onChange={handleInputChange}
                    placeholder="Describe any symptoms or specific concerns..."
                    rows="3"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading || (inputMode === 'upload' && !image)}>
                  {loading ? (
                    <span className="loader">Analyzing...</span>
                  ) : (
                    inputMode === 'manual' ? 'Analyze Profile' : 'Analyze Report'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="result-column">
            {result ? (
              <div className="result-container animate-fade-in">
                {result.status === 'ok' ? (
                  <>
                    <div className="card result-card">
                      <h3>Health Analysis (Raw JSON)</h3>
                      <div className="result-content">
                        <pre>
                          {JSON.stringify({
                            risk_level: result.risk_level,
                            factors: result.factors,
                            recommendations: result.recommendations,
                            status: result.status
                          }, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {result.developer_info && (
                      <div className="card dev-card animate-fade-in">
                        <h3>Developer Results (Raw JSON)</h3>
                        <div className="result-content">
                          <pre>{JSON.stringify(result.developer_info, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="card error-card">
                    <h3>Analysis Failed</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="result-placeholder">
                <div className="placeholder-content">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
                  </svg>
                  <p>Results will appear here after analysis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
