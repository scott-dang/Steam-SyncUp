import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Lobbies from "../pages/Lobbies";
import Information from "../pages/Information";

const routes = (
	<MemoryRouter initialEntries={["/"]}>
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="lobbies" element={<Lobbies />} />
			<Route path="Information" element={<Information />} />
		</Routes>
	</MemoryRouter>
);

test('renders Landing component for "/" route', () => {
	render(routes);

	// Check if the Landing component is rendered
	expect(screen.getAllByText(/Steam SyncUp/i)).toBeTruthy();
});

test('renders no Lobbies component for "lobbies" route with no auth', () => {
	render(routes);

	// Check if the Lobbies component isn't rendered
	expect(screen.getAllByText(/lobbies/i)).toHaveLength(1);
});

test('renders no Information component for "/Information" route with no auth', () => {
	render(routes);

	// Check if the Information component isn't rendered
	expect(screen.getAllByText(/Information/i)).toHaveLength(1);
});
