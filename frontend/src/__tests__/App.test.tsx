import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import App from "../App";

describe("App component", () => {
  it("renders Landing component for '/' path", () => {
    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      );
    });

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("renders Lobbies component for '/lobbies' path", () => {
    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={["/lobbies"]}>
          <App />
        </MemoryRouter>
      );
    });

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("renders Settings component for '/settings' path", () => {
    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={["/settings"]}>
          <App />
        </MemoryRouter>
      );
    });

    expect(renderer.toJSON()).toMatchSnapshot();
  });
});