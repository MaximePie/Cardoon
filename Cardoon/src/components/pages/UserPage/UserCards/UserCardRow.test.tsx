import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Card } from "../../../../types/common";
import UserCardRow from "./UserCardRow";

// Mock du hook useIsMobile
vi.mock("../../../../hooks/useIsMobile", () => ({
  default: vi.fn(),
}));

import useIsMobile from "../../../../hooks/useIsMobile";

describe("UserCardRow", () => {
  const mockCard: Card = {
    _id: "card123",
    question: "Quelle est la capitale de la France ?",
    answer: "Paris",
    interval: 1,
    imageLink: "",
    category: "Géographie",
    createdAt: "2023-10-21T10:00:00Z",
    ownedBy: "user123",
    isInverted: false,
    hasInvertedChild: false,
  };

  const defaultProps = {
    card: mockCard,
    isDeleting: false,
    isEditingCard: false,
    isInverting: false,
    isSelected: false,
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onInvert: vi.fn(),
  };

  let mockProps: typeof defaultProps;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProps = {
      ...defaultProps,
      onSelect: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onInvert: vi.fn(),
    };
    vi.mocked(useIsMobile).mockReturnValue({ isMobile: false });
  });

  describe("Desktop View", () => {
    describe("Basic Rendering", () => {
      it("should render card information and controls", () => {
        render(<UserCardRow {...mockProps} />);

        // Contenu de la carte
        expect(
          screen.getByText("Quelle est la capitale de la France ?")
        ).toBeInTheDocument();
        expect(screen.getByText("Paris")).toBeInTheDocument();

        // Contrôles
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
        expect(
          screen.getByLabelText(/Créer une question inverse/)
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/Modifier la carte/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Supprimer la carte/)).toBeInTheDocument();
      });

      it("should handle selection states", () => {
        const { rerender } = render(<UserCardRow {...mockProps} />);

        let checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();

        rerender(<UserCardRow {...mockProps} isSelected={true} />);
        checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeChecked();
      });
    });

    describe("Edit Functionality", () => {
      it("should enter edit mode and show TextField components", () => {
        render(<UserCardRow {...mockProps} />);

        const editButton = screen.getByLabelText(/Modifier la carte/);
        fireEvent.click(editButton);

        // Vérifier que les TextFields sont présents
        expect(
          screen.getByDisplayValue("Quelle est la capitale de la France ?")
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("Paris")).toBeInTheDocument();

        // Vérifier que le bouton devient un bouton de sauvegarde
        expect(
          screen.getByLabelText(/Sauvegarder la carte/)
        ).toBeInTheDocument();

        // Vérifier que le bouton d'annulation est présent
        expect(screen.getByLabelText(/Annuler l'édition/)).toBeInTheDocument();
      });

      it("should allow editing values and save changes", () => {
        render(<UserCardRow {...mockProps} />);

        // Entrer en mode édition
        fireEvent.click(screen.getByLabelText(/Modifier la carte/));

        // Modifier les valeurs
        const questionInput = screen.getByDisplayValue(
          "Quelle est la capitale de la France ?"
        );
        const answerInput = screen.getByDisplayValue("Paris");

        fireEvent.change(questionInput, {
          target: { value: "Nouvelle question" },
        });
        fireEvent.change(answerInput, {
          target: { value: "Nouvelle réponse" },
        });

        // Sauvegarder
        fireEvent.click(screen.getByLabelText(/Sauvegarder la carte/));

        expect(mockProps.onEdit).toHaveBeenCalledWith({
          ...mockCard,
          question: "Nouvelle question",
          answer: "Nouvelle réponse",
        });
      });

      it("should cancel editing and revert changes", () => {
        render(<UserCardRow {...mockProps} />);

        // Entrer en mode édition
        fireEvent.click(screen.getByLabelText(/Modifier la carte/));

        // Modifier les valeurs
        const questionInput = screen.getByDisplayValue(
          "Quelle est la capitale de la France ?"
        );
        fireEvent.change(questionInput, {
          target: { value: "Changement annulé" },
        });

        // Annuler
        fireEvent.click(screen.getByLabelText(/Annuler l'édition/));

        // Vérifier que les valeurs originales sont restaurées
        expect(
          screen.getByText("Quelle est la capitale de la France ?")
        ).toBeInTheDocument();
        expect(screen.getByText("Paris")).toBeInTheDocument();
        expect(mockProps.onEdit).not.toHaveBeenCalled();
      });

      it("should not save empty values", () => {
        render(<UserCardRow {...mockProps} />);

        // Entrer en mode édition
        fireEvent.click(screen.getByLabelText(/Modifier la carte/));

        // Vider les champs
        const questionInput = screen.getByDisplayValue(
          "Quelle est la capitale de la France ?"
        );
        const answerInput = screen.getByDisplayValue("Paris");

        fireEvent.change(questionInput, { target: { value: "  " } }); // Espaces seulement
        fireEvent.change(answerInput, { target: { value: "" } });

        // Tenter de sauvegarder
        fireEvent.click(screen.getByLabelText(/Sauvegarder la carte/));

        // Ne devrait pas appeler onEdit car les valeurs sont vides
        expect(mockProps.onEdit).not.toHaveBeenCalled();
      });

      it("should disable delete button while editing", () => {
        render(<UserCardRow {...mockProps} />);

        // Entrer en mode édition
        fireEvent.click(screen.getByLabelText(/Modifier la carte/));

        // Le bouton de suppression devrait être désactivé
        expect(screen.getByLabelText(/Supprimer la carte/)).toBeDisabled();
      });
    });

    describe("Invert Functionality", () => {
      it("should render invert button and call onInvert when clicked", () => {
        render(<UserCardRow {...mockProps} />);

        const invertButton = screen.getByLabelText(
          /Créer une question inverse/
        );
        expect(invertButton).toBeInTheDocument();
        expect(invertButton).not.toBeDisabled();

        fireEvent.click(invertButton);
        expect(mockProps.onInvert).toHaveBeenCalledTimes(1);
      });

      it("should disable invert button when card has childCard", () => {
        const childCard: Card = {
          ...mockCard,
          _id: "child123",
          isInverted: true,
          originalCardId: mockCard._id,
        };

        render(<UserCardRow {...mockProps} childCard={childCard} />);

        const invertButton = screen.getByLabelText(
          /Créer une question inverse/
        );
        expect(invertButton).toBeDisabled();
      });

      it("should disable invert button when isInverting is true", () => {
        render(<UserCardRow {...mockProps} isInverting={true} />);

        const invertButton = screen.getByLabelText(
          /Créer une question inverse/
        );
        expect(invertButton).toBeDisabled();
      });
    });

    describe("State Management", () => {
      it("should disable edit and delete buttons when isDeleting is true", () => {
        render(<UserCardRow {...mockProps} isDeleting={true} />);

        // Le bouton d'inversion N'EST PAS désactivé par isDeleting
        expect(
          screen.getByLabelText(/Créer une question inverse/)
        ).not.toBeDisabled();
        // Seuls les boutons d'édition et suppression sont désactivés
        expect(screen.getByLabelText(/Modifier la carte/)).toBeDisabled();
        expect(screen.getByLabelText(/Supprimer la carte/)).toBeDisabled();
      });

      it("should apply loading styles when deleting", () => {
        render(<UserCardRow {...mockProps} isDeleting={true} />);

        const tableRow = screen.getByRole("row");
        expect(tableRow).toHaveStyle({ opacity: "0.7" });
      });

      it("should handle isEditingCard prop correctly", () => {
        render(<UserCardRow {...mockProps} isEditingCard={true} />);

        // En mode desktop, isEditingCard désactive le bouton si pas en mode édition local
        const editButton = screen.getByLabelText(/Modifier la carte/);
        expect(editButton).toBeDisabled();
      });
    });
  });

  describe("Mobile View", () => {
    beforeEach(() => {
      vi.mocked(useIsMobile).mockReturnValue({ isMobile: true });
    });

    describe("Layout and Interaction", () => {
      it("should render mobile layout with proper content", () => {
        render(<UserCardRow {...mockProps} />);

        expect(screen.getByText("Q:")).toBeInTheDocument();
        expect(screen.getByText("A:")).toBeInTheDocument();
        expect(
          screen.getByText("Quelle est la capitale de la France ?")
        ).toBeInTheDocument();
        expect(screen.getByText("Paris")).toBeInTheDocument();

        // Contrôles mobile
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
        expect(
          screen.getByLabelText(/Créer une question inverse/)
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/Modifier la carte/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Supprimer la carte/)).toBeInTheDocument();
      });

      it("should support editing in mobile view", () => {
        render(<UserCardRow {...mockProps} />);

        // Entrer en mode édition
        fireEvent.click(screen.getByLabelText(/Modifier la carte/));

        // Vérifier les TextFields avec labels appropriés
        expect(screen.getByLabelText("Question")).toBeInTheDocument();
        expect(screen.getByLabelText("Réponse")).toBeInTheDocument();
      });

      it("should call handlers correctly in mobile view", () => {
        render(<UserCardRow {...mockProps} />);

        fireEvent.click(screen.getByRole("checkbox"));
        fireEvent.click(screen.getByLabelText(/Créer une question inverse/));
        fireEvent.click(screen.getByLabelText(/Supprimer la carte/));

        expect(mockProps.onSelect).toHaveBeenCalledTimes(1);
        expect(mockProps.onInvert).toHaveBeenCalledTimes(1);
        expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
      });

      it("should disable buttons correctly in mobile view", () => {
        render(
          <UserCardRow {...mockProps} isDeleting={true} isEditingCard={true} />
        );

        const invertButton = screen.getByLabelText(
          /Créer une question inverse/
        );
        const editButton = screen.getByLabelText(/Modifier la carte/);
        const deleteButton = screen.getByLabelText(/Supprimer la carte/);

        // Le bouton d'inversion N'EST PAS désactivé par isDeleting
        expect(invertButton).not.toBeDisabled();
        // Les boutons d'édition et suppression sont désactivés par isDeleting
        expect(editButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe("Edge Cases and Performance", () => {
    it("should handle special characters in content", () => {
      const specialCard = {
        ...mockCard,
        question: "Qu'est-ce que €, £, ¥ & $ ?",
        answer: "Symboles monétaires @#%^&*()",
      };

      render(<UserCardRow {...mockProps} card={specialCard} />);

      expect(
        screen.getByText("Qu'est-ce que €, £, ¥ & $ ?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Symboles monétaires @#%^&*()")
      ).toBeInTheDocument();
    });

    it("should handle empty content gracefully", () => {
      const emptyCard = { ...mockCard, question: "", answer: "" };

      render(<UserCardRow {...mockProps} card={emptyCard} />);

      // Devrait rendre sans erreur même avec du contenu vide
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByLabelText(/Modifier la carte/)).toBeInTheDocument();
    });

    it("should have proper ARIA labels", () => {
      render(<UserCardRow {...mockProps} />);

      expect(
        screen.getByLabelText(
          /Créer une question inverse.*Quelle est la capitale/
        )
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Modifier la carte.*Quelle est la capitale/)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Supprimer la carte.*Quelle est la capitale/)
      ).toBeInTheDocument();
    });

    it("should synchronize edit values when card props change outside edit mode", () => {
      const { rerender } = render(<UserCardRow {...mockProps} />);

      // Changer les props de la carte sans être en mode édition
      const updatedCard = {
        ...mockCard,
        question: "Nouvelle question externe",
        answer: "Nouvelle réponse externe",
      };
      rerender(<UserCardRow {...mockProps} card={updatedCard} />);

      // Les nouvelles valeurs devraient être affichées
      expect(screen.getByText("Nouvelle question externe")).toBeInTheDocument();
      expect(screen.getByText("Nouvelle réponse externe")).toBeInTheDocument();
    });

    it("should handle multiple state combinations with invert functionality", () => {
      const childCard: Card = {
        ...mockCard,
        _id: "child123",
        isInverted: true,
      };

      render(
        <UserCardRow
          {...mockProps}
          isInverting={true}
          isSelected={true}
          childCard={childCard}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      const invertButton = screen.getByLabelText(/Créer une question inverse/);

      expect(checkbox).toBeChecked();
      expect(invertButton).toBeDisabled(); // Désactivé car childCard existe ET isInverting
    });

    it("should maintain invert button state during editing", () => {
      render(<UserCardRow {...mockProps} />);

      // Entrer en mode édition
      fireEvent.click(screen.getByLabelText(/Modifier la carte/));

      // Le bouton d'inversion devrait toujours être disponible pendant l'édition
      const invertButton = screen.getByLabelText(/Créer une question inverse/);
      expect(invertButton).not.toBeDisabled();

      // Mais le bouton de suppression devrait être désactivé
      expect(screen.getByLabelText(/Supprimer la carte/)).toBeDisabled();
    });
  });
});
