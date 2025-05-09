import { Alert, Snackbar } from "@mui/material";
import { createContext, useState } from "react";

export const SnackbarContext = createContext({
  openSnackbarWithMessage: (
    message: string,
    variant: "success" | "error" = "success"
  ) => {
    console.log(message, variant);
  },
  handleCloseSnackbar: () => {},
});

interface snackbarStatus {
  open: boolean;
  message: string;
  variant: "success" | "error";
}

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [snackbarStatus, setSnackbarStatus] = useState<snackbarStatus>({
    open: false,
    message: "",
    variant: "success",
  });

  const openSnackbarWithMessage = (
    message: string = "",
    variant: "success" | "error" = "success"
  ) => {
    setSnackbarStatus({ open: true, message, variant });
  };

  const handleCloseSnackbar = () => {
    setSnackbarStatus({ ...snackbarStatus, open: false });
  };

  return (
    <SnackbarContext.Provider
      value={{ openSnackbarWithMessage, handleCloseSnackbar }}
    >
      {children}
      <Snackbar
        open={snackbarStatus.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ right: "auto" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarStatus.variant || "success"}
        >
          {snackbarStatus.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
