import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { demoCredentials } from "../../data/seed";
import { LoginScreen } from "./LoginScreen";

describe("LoginScreen", () => {
  it("submits the prefilled demo credentials", async () => {
    const onLogin = vi.fn().mockReturnValue(true);
    render(
      <LoginScreen theme="dark" onThemeChange={() => {}} onLogin={onLogin} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /zaloguj/i }));

    expect(onLogin).toHaveBeenCalledWith(
      demoCredentials.email,
      demoCredentials.password,
    );
  });

  it("shows an error when credentials are rejected", async () => {
    const onLogin = vi.fn().mockReturnValue(false);
    render(
      <LoginScreen theme="dark" onThemeChange={() => {}} onLogin={onLogin} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /zaloguj/i }));

    expect(screen.getByText(/błędny email lub hasło/i)).toBeInTheDocument();
  });
});
