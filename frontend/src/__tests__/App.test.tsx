import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Lobbies from "../pages/Lobbies";
import Settings from "../pages/Settings";

const routes = (
	<MemoryRouter initialEntries={["/"]}>
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="lobbies" element={<Lobbies />} />
			<Route path="settings" element={<Settings />} />
		</Routes>
	</MemoryRouter>
);

test('renders Landing component for "/" route', () => {
	render(routes);

	// Check if the Landing component is rendered
	expect(screen.getByText(/Steam SyncUp/i)).toBeTruthy();
});

test('renders no Lobbies component for "lobbies" route with no auth', () => {
	render(routes);

	// Check if the Lobbies component isn't rendered
	expect(screen.queryByText(/lobbies/i)).toBeFalsy();
});

test('renders no Settings component for "/settings" route with no auth', () => {
	render(routes);

	// Check if the Settings component isn't rendered
	expect(screen.queryByText(/settings/i)).toBeFalsy();
});
