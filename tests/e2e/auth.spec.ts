import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page is accessible", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveTitle(/MiseKai/);
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  });

  test("login form has required fields", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("forgot password link works", async ({ page }) => {
    await page.goto("/auth/login");

    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
    await expect(
      page.getByRole("heading", { name: /reset your password/i })
    ).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");

    await page.getByLabel(/email/i).fill("invalid@test.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait for error message - depends on Supabase being configured
    // This test will fail if Supabase is not set up
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("forgot password form has email field", async ({ page }) => {
    await page.goto("/auth/forgot-password");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send reset email/i })
    ).toBeVisible();
  });

  test("back to login link on forgot password page", async ({ page }) => {
    await page.goto("/auth/forgot-password");

    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
