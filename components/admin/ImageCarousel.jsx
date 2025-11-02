"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ImageCarousel({ images, onImageClick, showControls = true, className = "" }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showFullscreen, setShowFullscreen] = React.useState(false)
  const [fullscreenIndex, setFullscreenIndex] = React.useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-muted rounded-lg ${className}`}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index) => {
    setCurrentIndex(index)
  }

  const openFullscreen = (index) => {
    setFullscreenIndex(index)
    setShowFullscreen(true)
  }

  const closeFullscreen = () => {
    setShowFullscreen(false)
  }

  const goToPreviousFullscreen = () => {
    setFullscreenIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNextFullscreen = () => {
    setFullscreenIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Keyboard navigation for fullscreen
  React.useEffect(() => {
    if (!showFullscreen) return

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setFullscreenIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setFullscreenIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showFullscreen, images.length])

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Image Display */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="h-full w-full object-cover cursor-pointer"
            onClick={() => onImageClick ? onImageClick(currentIndex) : openFullscreen(currentIndex)}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          
          {/* Navigation Arrows */}
          {showControls && images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 relative aspect-square w-20 overflow-hidden rounded-md border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-transparent hover:border-muted-foreground/50'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeFullscreen}
        >
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={images[fullscreenIndex]}
              alt={`Fullscreen image ${fullscreenIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPreviousFullscreen()
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNextFullscreen()
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded">
                  {fullscreenIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

