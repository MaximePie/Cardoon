import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImagePaster } from "./ImagePaster";

// Mock navigator.clipboard
const mockClipboardRead = vi.fn();
Object.defineProperty(navigator, "clipboard", {
  writable: true,
  value: {
    read: mockClipboardRead,
  },
});

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn();
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: mockCreateObjectURL,
});

describe("ImagePaster", () => {
  const mockOnUpload = vi.fn();

  const createMockClipboardItem = (type: string = "image/png") => ({
    types: [type],
    getType: vi.fn().mockResolvedValue(new Blob(["mock image data"], { type })),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    mockCreateObjectURL.mockReturnValue("mock-object-url");
  });

  describe("Basic Rendering", () => {
    it("should render with initial placeholder text", () => {
      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      expect(paster).toBeInTheDocument();
      expect(paster).toHaveTextContent(
        "Cliquez ici puis appuyez sur Ctrl+V pour coller une image"
      );
    });

    it("should apply ImagePaster class", () => {
      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      expect(paster).toHaveClass("ImagePaster");
    });
  });

  describe("Image Pasting", () => {
    it("should handle paste event with image", async () => {
      mockClipboardRead.mockResolvedValue([
        createMockClipboardItem("image/png"),
      ]);

      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      await act(async () => {
        await fireEvent.paste(paster!);
      });

      // Wait for async operations
      await vi.waitFor(() => {
        expect(mockClipboardRead).toHaveBeenCalledTimes(1);
        expect(mockOnUpload).toHaveBeenCalledTimes(1);
      });

      // Verify file properties
      const uploadedFile = mockOnUpload.mock.calls[0][0];
      expect(uploadedFile).toBeInstanceOf(File);
      expect(uploadedFile.type).toBe("image/png");
      expect(uploadedFile.name).toMatch(/^pasted-image-\d+\.png$/);
    });

    it("should display preview after successful paste", async () => {
      mockClipboardRead.mockResolvedValue([
        createMockClipboardItem("image/jpeg"),
      ]);

      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      await act(async () => {
        await fireEvent.paste(paster!);
      });

      await vi.waitFor(() => {
        const img = container.querySelector("img");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "mock-object-url");
        expect(img).toHaveAttribute("alt", "Aperçu collé");
      });
    });

    it("should handle different image types", async () => {
      const testCases = [
        { type: "image/png", extension: "png" },
        { type: "image/jpeg", extension: "jpeg" },
        { type: "image/gif", extension: "gif" },
        { type: "image/webp", extension: "webp" },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        mockClipboardRead.mockResolvedValue([
          createMockClipboardItem(testCase.type),
        ]);

        const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
        const paster = container.querySelector(".ImagePaster");

        await act(async () => {
          await fireEvent.paste(paster!);
        });

        await vi.waitFor(() => {
          expect(mockOnUpload).toHaveBeenCalledTimes(1);
          const file = mockOnUpload.mock.calls[0][0];
          expect(file.type).toBe(testCase.type);
          expect(file.name).toContain(`.${testCase.extension}`);
        });
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle clipboard read errors gracefully", async () => {
      mockClipboardRead.mockRejectedValue(new Error("Clipboard access denied"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      await fireEvent.paste(paster!);

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Erreur de collage:",
          expect.any(Error)
        );
        expect(mockOnUpload).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it("should handle empty clipboard gracefully", async () => {
      mockClipboardRead.mockResolvedValue([]);

      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      await fireEvent.paste(paster!);

      await vi.waitFor(() => {
        expect(mockClipboardRead).toHaveBeenCalledTimes(1);
        expect(mockOnUpload).not.toHaveBeenCalled();
      });
    });

    it("should handle non-image clipboard items", async () => {
      mockClipboardRead.mockResolvedValue([
        {
          types: ["text/plain"],
          getType: vi.fn(),
        },
      ]);

      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      await fireEvent.paste(paster!);

      await vi.waitFor(() => {
        expect(mockClipboardRead).toHaveBeenCalledTimes(1);
        expect(mockOnUpload).not.toHaveBeenCalled();
      });
    });
  });

  describe("Reset Functionality", () => {
    it("should reset preview when shouldReset becomes true", async () => {
      // First, paste an image
      mockClipboardRead.mockResolvedValue([
        createMockClipboardItem("image/png"),
      ]);

      const { container, rerender } = render(
        <ImagePaster onUpload={mockOnUpload} shouldReset={false} />
      );
      const paster = container.querySelector(".ImagePaster");

      await act(async () => {
        await fireEvent.paste(paster!);
      });

      // Wait for image to appear
      await vi.waitFor(() => {
        expect(container.querySelector("img")).toBeInTheDocument();
      });

      // Now trigger reset
      act(() => {
        rerender(<ImagePaster onUpload={mockOnUpload} shouldReset={true} />);
      });

      // Preview should be cleared
      expect(container.querySelector("img")).not.toBeInTheDocument();
      expect(container).toHaveTextContent(
        "Cliquez ici puis appuyez sur Ctrl+V pour coller une image"
      );
    });

    it("should not reset when shouldReset is false", async () => {
      mockClipboardRead.mockResolvedValue([
        createMockClipboardItem("image/png"),
      ]);

      const { container, rerender } = render(
        <ImagePaster onUpload={mockOnUpload} shouldReset={false} />
      );
      const paster = container.querySelector(".ImagePaster");

      await act(async () => {
        await fireEvent.paste(paster!);
      });

      await vi.waitFor(() => {
        expect(container.querySelector("img")).toBeInTheDocument();
      });

      // Re-render with shouldReset still false
      act(() => {
        rerender(<ImagePaster onUpload={mockOnUpload} shouldReset={false} />);
      });

      // Image should still be there
      expect(container.querySelector("img")).toBeInTheDocument();
    });

    it("should handle shouldReset prop when undefined", () => {
      expect(() =>
        render(<ImagePaster onUpload={mockOnUpload} />)
      ).not.toThrow();
    });
  });

  describe("File Generation", () => {
    it("should generate unique filenames for multiple pastes", async () => {
      mockClipboardRead.mockResolvedValue([
        createMockClipboardItem("image/png"),
      ]);

      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      // First paste
      await act(async () => {
        await fireEvent.paste(paster!);
      });
      await vi.waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledTimes(1);
      });

      // Second paste
      await act(async () => {
        await fireEvent.paste(paster!);
      });
      await vi.waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledTimes(2);
      });

      const file1 = mockOnUpload.mock.calls[0][0];
      const file2 = mockOnUpload.mock.calls[1][0];

      expect(file1.name).toMatch(/^pasted-image-\d+\.png$/);
      expect(file2.name).toMatch(/^pasted-image-\d+\.png$/);
      expect(file1.name).not.toBe(file2.name); // Ensure filenames are different
    });

    it("should properly handle blob conversion to file", async () => {
      const mockBlob = new Blob(["test data"], { type: "image/png" });
      mockClipboardRead.mockResolvedValue([
        {
          types: ["image/png"],
          getType: vi.fn().mockResolvedValue(mockBlob),
        },
      ]);

      const { container } = render(<ImagePaster onUpload={mockOnUpload} />);
      const paster = container.querySelector(".ImagePaster");

      await act(async () => {
        await fireEvent.paste(paster!);
      });

      await vi.waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledTimes(1);
        const file = mockOnUpload.mock.calls[0][0];
        expect(file).toBeInstanceOf(File);
        expect(file.type).toBe("image/png");
        expect(file.size).toBe(mockBlob.size);
      });
    });
  });

  describe("Component Integration", () => {
    it("should work within a form context", async () => {
      mockClipboardRead.mockResolvedValue([
        createMockClipboardItem("image/png"),
      ]);

      const { container } = render(
        <form>
          <ImagePaster onUpload={mockOnUpload} />
        </form>
      );

      const paster = container.querySelector(".ImagePaster");
      await act(async () => {
        await fireEvent.paste(paster!);
      });

      await vi.waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle multiple instances independently", async () => {
      const mockOnUpload1 = vi.fn();
      const mockOnUpload2 = vi.fn();

      mockClipboardRead.mockResolvedValue([
        createMockClipboardItem("image/png"),
      ]);

      const { container } = render(
        <div>
          <ImagePaster onUpload={mockOnUpload1} />
          <ImagePaster onUpload={mockOnUpload2} />
        </div>
      );

      const pasters = container.querySelectorAll(".ImagePaster");

      // Paste on first instance
      await act(async () => {
        await fireEvent.paste(pasters[0]);
      });

      await vi.waitFor(() => {
        expect(mockOnUpload1).toHaveBeenCalledTimes(1);
        expect(mockOnUpload2).not.toHaveBeenCalled();
      });
    });
  });
});
