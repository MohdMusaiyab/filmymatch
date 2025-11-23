// components/ui/ImageGallery.tsx
"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

interface ImageType {
  id: string;
  url: string;
  description?: string | null;
}

interface ImageGalleryProps {
  images: ImageType[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<{
    image: ImageType;
    index: number;
  } | null>(null);

  const openModal = (image: ImageType, index: number) => {
    setSelectedImage({ image, index });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const goToNext = () => {
    if (selectedImage && images.length > 0) {
      const nextIndex = (selectedImage.index + 1) % images.length;
      setSelectedImage({ image: images[nextIndex], index: nextIndex });
    }
  };

  const goToPrevious = () => {
    if (selectedImage && images.length > 0) {
      const prevIndex = (selectedImage.index - 1 + images.length) % images.length;
      setSelectedImage({ image: images[prevIndex], index: prevIndex });
    }
  };

  // Handle swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchDown = e.touches[0].clientX;
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touchUp = moveEvent.touches[0].clientX;
      if (touchDown - touchUp > 50) {
        goToNext();
      }
      if (touchDown - touchUp < -50) {
        goToPrevious();
      }
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', handleTouchMove);
    }, { once: true });
  };

  return (
    <>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            {/* Image Container */}
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
              <Image
                src={img.url}
                alt="Post image"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => openModal(img, index)}
                priority={index < 3}
              />
            </div>

            {/* Image Info */}
            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base line-clamp-1">
                {img.description && img.description.length > 40
                  ? `${img.description.slice(0, 40)}...`
                  : img.description || "Untitled Image"}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                {img.description || "No description available for this image."}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => openModal(img, index)}
                  className="bg-[#5865F2] text-white hover:bg-[#4854e0] focus:ring-[#5865F2] text-xs sm:text-sm  font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Transition.Root show={!!selectedImage} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel 
                  className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-4xl mx-auto"
                  onTouchStart={handleTouchStart}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                    <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1 pr-2">
                      {selectedImage?.image.description || "Image Preview"}
                    </Dialog.Title>
                    <button
                      onClick={closeModal}
                      className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Image */}
                  <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-100">
                    {selectedImage && (
                      <Image
                        src={selectedImage.image.url}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="w-full h-full object-contain"
                        priority
                      />
                    )}
                  </div>

                  {/* Navigation Arrows - Hidden on mobile, show on hover for desktop */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="hidden sm:block absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                      </button>
                      <button
                        onClick={goToNext}
                        className="hidden sm:block absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Mobile Navigation Dots */}
                  {images.length > 1 && (
                    <div className="sm:hidden flex justify-center space-x-2 py-4">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === selectedImage?.index 
                              ? 'bg-blue-600' 
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {selectedImage?.image.description && (
                    <div className="p-4 sm:p-6 border-t border-gray-200">
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {selectedImage.image.description}
                      </p>
                    </div>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-xs sm:text-sm rounded-full">
                      {selectedImage && `${selectedImage.index + 1} / ${images.length}`}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};