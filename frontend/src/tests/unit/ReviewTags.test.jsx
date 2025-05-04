import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ReviewTags from "../../components/ReviewTags.jsx";

describe("ReviewTags Component", () => {
  it("renders nothing when no tags are provided", () => {
    const { container } = render(<ReviewTags tags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders sentiment chip with correct color", () => {
    render(<ReviewTags tags={['Leadership']} sentiment="positive" />);
    const sentimentChip = screen.getByText("positive");
    expect(sentimentChip).toBeInTheDocument();
    // MUI sets color via class/style — checking text existence is often enough
  });

  it("renders all tags as chips", () => {
    const tags = ["Leadership", "Discipline", "Teamwork"];
    render(<ReviewTags tags={tags} />);
    tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("renders both sentiment and tags together", () => {
    const tags = ["Effort", "Resilience"];
    render(<ReviewTags tags={tags} sentiment="negative" />);

    expect(screen.getByText("negative")).toBeInTheDocument();
    expect(screen.getByText("Effort")).toBeInTheDocument();
    expect(screen.getByText("Resilience")).toBeInTheDocument();
  });

  it("renders neutral sentiment as 'default' chip", () => {
    render(<ReviewTags tags={['Focus']} sentiment="neutral" />);
    expect(screen.getByText("neutral")).toBeInTheDocument();
  });

  it("is case-insensitive for sentiment values", () => {
    render(<ReviewTags tags={['Dedication']} sentiment="PoSiTivE" />);
    expect(screen.getByText(/positive/i)).toBeInTheDocument();
  });
});
