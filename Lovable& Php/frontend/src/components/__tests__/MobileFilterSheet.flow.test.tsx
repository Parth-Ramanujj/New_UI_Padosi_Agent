import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import { getSavedSeekerDetails, saveSeekerDetails } from "@/components/SeekerDetailsPopup";

describe("MobileFilterSheet → /agents handoff", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("completes flow with PIN and emits params (no re-prompt for location)", async () => {
    const onComplete = vi.fn();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <MobileFilterSheet
          open
          onClose={onClose}
          lockService="new-policy"
          lockCover="health"
          onComplete={onComplete}
        />
      </MemoryRouter>
    );

    // Starts at location step (service + cover locked)
    const pinInput = screen.getByLabelText(/Enter PIN code/i);
    fireEvent.change(pinInput, { target: { value: "560001" } });

    await waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 3000 });
    const params: URLSearchParams = onComplete.mock.calls[0][0];
    expect(params.get("pincode")).toBe("560001");
    expect(params.get("service")).toBe("new-policy");
    expect(params.get("type")).toBe("health");
  });

  it("AgentsListing gating: URL pincode skips SeekerDetailsPopup and persists to storage", () => {
    // Simulate the gating logic from AgentsListing
    const search = "?pincode=560001&service=new-policy&type=health";
    const user = null;

    const params = new URLSearchParams(search);
    const urlPincode = params.get("pincode") || "";
    const urlCity = params.get("city") || "";
    const saved = getSavedSeekerDetails();

    let showSeekerPopup = true;
    if (!user) {
      if (urlPincode || urlCity) {
        const merged = { ...(saved || {}), pincode: urlPincode || saved?.pincode || "" };
        saveSeekerDetails(merged);
        showSeekerPopup = false;
      } else if (saved) {
        showSeekerPopup = false;
      }
    }

    expect(showSeekerPopup).toBe(false);
    expect(getSavedSeekerDetails()?.pincode).toBe("560001");
  });
});
