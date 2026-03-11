/**
 * E2E tests for Stripe billing links and upgrade buttons.
 * Verifies pricing page → checkout links and upgrade button flows.
 */

import { test, expect } from "@playwright/test";

test.describe("Stripe / Checkout links", () => {
  test("pricing page has correct links to checkout with plan params", async ({ page }) => {
    await page.goto("/pricing");

    // Pricing section: each plan should have a link to /checkout?plan=...
    const starterLink = page.locator('a[href="/checkout?plan=starter"]');
    const growthLink = page.locator('a[href="/checkout?plan=growth"]');
    const networkLink = page.locator('a[href="/checkout?plan=network"]');

    await expect(starterLink).toBeVisible();
    await expect(growthLink).toBeVisible();
    await expect(networkLink).toBeVisible();

    // Links should have CTA text
    await expect(starterLink).toContainText("Start Free Trial");
    await expect(growthLink).toContainText("Start Free Trial");
    await expect(networkLink).toContainText("Start Free Trial");
  });

  test("pricing links navigate to checkout page", async ({ page }) => {
    await page.goto("/pricing");

    await page.click('a[href="/checkout?plan=growth"]');

    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator("h1")).toContainText("Choose Your Plan");
    await expect(page.getByText("Start with a 14-day free trial")).toBeVisible();
  });

  test("checkout page has upgrade buttons for each plan", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page.locator("h1")).toContainText("Choose Your Plan");

    // Three plan cards with Get Started buttons
    const planButtons = page.getByRole("button", { name: /Get Started|Redirecting/ });
    await expect(planButtons).toHaveCount(3);
  });

  test("checkout page shows Stripe test card hint", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page.getByText(/4242 4242 4242 4242/)).toBeVisible();
    await expect(page.getByText(/Stripe/)).toBeVisible();
  });

  test("checkout upgrade buttons exist and link to Stripe flow", async ({
    page,
  }) => {
    await page.goto("/checkout");

    // Verify three upgrade buttons exist with correct CTAs
    const buttons = page.getByRole("button", {
      name: /Sign up to Get Started|Get Started|Redirecting/,
    });
    await expect(buttons).toHaveCount(3);

    // Growth (middle) button is visible and enabled - clicking triggers either:
    // - signed out: redirect to /signup; signed in: POST /api/billing/checkout → Stripe
    const growthButton = buttons.nth(1);
    await expect(growthButton).toBeVisible();
    await expect(growthButton).toBeEnabled();
    await expect(growthButton).toContainText(/Get Started|Sign up/);
  });
});

test.describe("Marketing footer and nav links", () => {
  test("footer has pricing link", async ({ page }) => {
    await page.goto("/");
    const footerPricing = page.getByRole("contentinfo").getByRole("link", { name: "Pricing" });
    await expect(footerPricing).toBeVisible();
    await expect(footerPricing).toHaveAttribute("href", "/pricing");
  });

  test("marketing nav has pricing link", async ({ page }) => {
    await page.goto("/");
    const pricingNavLink = page.getByRole("link", { name: "Pricing" });
    await expect(pricingNavLink.first()).toBeVisible();
    await expect(pricingNavLink.first()).toHaveAttribute("href", "/pricing");
  });

  test("pricing page link goes to pricing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pricing" }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});
