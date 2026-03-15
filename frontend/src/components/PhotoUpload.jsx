import { useState, useRef } from 'react'
import client from '../api/client'

export default function PhotoUpload({ 
  currentPhoto, 
  onUpload, 
  size = 'lg',
  name = ''
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentPhoto || null)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-28 h-28 text-3xl',
    xl: 'w-36 h-36 text-4xl'
  }

  // Generate colored initials avatar if no photo
  const getInitials = () => {
    if (!name) return '👤'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleClick = () => fileRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG or WebP image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await client.post('/api/auth/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data?.data?.photo_url
      if (url && onUpload) onUpload(url)
    } catch (err) {
      setError('Upload failed. Please try again.')
      setPreview(currentPhoto || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full overflow-hidden 
             shadow-lg cursor-pointer relative group flex-shrink-0`}
        style={{ border: '4px solid var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={() => setPreview(null)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-white"
               style={{
                 background: 'linear-gradient(135deg, #f5d7cc 0%, #c0392b 100%)'
               }}>
            {getInitials()}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 
                        group-hover:opacity-100 transition-opacity 
                        flex flex-col items-center justify-center gap-1">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent 
                            rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-white text-xl">📷</span>
              <span className="text-white text-xs font-medium">Change Photo</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs text-center max-w-32">{error}</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
