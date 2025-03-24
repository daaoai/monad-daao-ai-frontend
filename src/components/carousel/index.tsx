'use client';

import React, { ReactNode } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
  children: ReactNode;
  slidesToShowConfig?: {
    laptop: number;
    tablet: number;
    mobile: number;
  };
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-600"
    >
      <ChevronRight size={24} />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-600"
    >
      <ChevronLeft size={24} />
    </button>
  );
};

const Carousel: React.FC<CarouselProps> = ({ children, slidesToShowConfig = { laptop: 3, tablet: 2, mobile: 1 } }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShowConfig.laptop,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024, // Tablets
        settings: {
          slidesToShow: slidesToShowConfig.tablet,
        },
      },
      {
        breakpoint: 640, // Mobile
        settings: {
          slidesToShow: slidesToShowConfig.mobile,
        },
      },
    ],
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 relative">
      <Slider {...settings}>{children}</Slider>
    </div>
  );
};

export default Carousel;
