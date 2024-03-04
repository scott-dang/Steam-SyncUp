import React, { useEffect, useRef, useState } from "react";

export interface Card {
	image: string;
	caption: string;
}

const Carousel = ({ cards }) => {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [slides, setSlides] = useState<React.JSX.Element[]>([]);
	const initialRender = useRef(true);

	const transition = () => {
		setSlides(
			cards.map((card: Card, index: number) => {
				let style1 = "";
				let style2 = "";
				switch (index) {
					case (currentSlide - 1) % cards.length:
						style1 =
							"-translate-x-full opacity-0 duration-1000 ease-in-out";
						style2 = "opacity-0 duration-1000 ease-in-out";
						break;
					case currentSlide % cards.length:
						style1 =
							"translate-x-0 opacity-1 duration-1000 ease-in-out";
						style2 = "opacity-1 duration-1000 ease-in-out";
						break;
					case (currentSlide + 1) % cards.length:
						style1 = "translate-x-full opacity-0";
						style2 = "opacity-0";
						break;
					default:
						style1 = "opacity-0";
						style2 = "opacity-0";
						break;
				}
				return (
					<div
						key={index}
						className={`w-full absolute ${style2}`}
						style={{
							backgroundImage: `url(${card.image})`,
							backgroundSize: "cover",
						}}
					>
						<div className="absolute inset-0 backdrop-blur-lg"></div>
						<div
							className="absolute inset-0"
							style={{
								background:
									"radial-gradient(circle, transparent, rgba(0,0,0,1))",
							}}
						></div>
						<div className={style1}>
							<img
								src={card.image}
								className="relative w-1/4 mx-auto mt-10 rounded-lg"
								alt={card.caption}
								style={{ boxShadow: "0 0 10px 5px gray" }}
							/>
							<h1
								className="relative text-3xl text-center text-white mb-10 mt-3"
								style={{
									textShadow:
										"2px 2px black, -2px -2px black, 2px -2px black, -2px 2px black",
								}}
							>
								{card.caption}
							</h1>
						</div>
					</div>
				);
			})
		);
	};

	useEffect(() => {
		// stop the carousel from running twice on mount
		if (initialRender.current) {
			initialRender.current = false;
		} else {
			transition();
			setTimeout(() => setCurrentSlide((s) => s + 1), 3500);
		}
	}, [currentSlide]);

	return (
		<div className="relative">
			<div className="overflow-hidden">{slides}</div>
		</div>
	);
};

export default Carousel;
