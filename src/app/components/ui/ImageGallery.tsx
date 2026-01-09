// components/ui/ImageGallery.tsx
"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2, Info } from "lucide-react";
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
  const [touchStartX, setTouchStartX] = useState(0);

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
      const prevIndex =
        (selectedImage.index - 1 + images.length) % images.length;
      setSelectedImage({ image: images[prevIndex], index: prevIndex });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  return (
    <>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            {/* Image Container */}
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
              <Image
                src={img.url}
                alt="Post image"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onClick={() => openModal(img, index)}
                priority={index < 3}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                  <Maximize2 className="w-4 h-4 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Image Info */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                  {img.description && img.description.length > 40
                    ? `${img.description.slice(0, 40)}...`
                    : img.description || "Untitled Image"}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>

              {img.description && (
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3">
                  {img.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="w-3 h-3 mr-1" />
                  <span>Click to view</span>
                </div>
                <button
                  onClick={() => openModal(img, index)}
                  className="text-[#5865F2] hover:text-[#4854e0] font-medium text-sm transition-colors"
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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-5xl mx-auto"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-lg flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">
                          {selectedImage?.image.description || "Image Preview"}
                        </Dialog.Title>
                        {images.length > 1 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Image {selectedImage && selectedImage.index + 1} of{" "}
                            {images.length}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Image Container */}
                  <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[600px] bg-gradient-to-br from-gray-50 to-gray-100">
                    {selectedImage && (
                      <Image
                        src={selectedImage.image.url}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className="w-full h-full object-contain p-4 sm:p-8"
                        priority
                      />
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={goToPrevious}
                          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                        </button>
                        <button
                          onClick={goToNext}
                          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Mobile Navigation Dots */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              setSelectedImage({ image: images[index], index })
                            }
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === selectedImage?.index
                                ? "bg-[#5865F2] scale-125"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedImage?.image.description && (
                    <div className="p-4 sm:p-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-[#5865F2]" />
                        <h4 className="font-semibold text-gray-900">
                          Description
                        </h4>
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4">
                        {selectedImage.image.description}
                      </p>
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
