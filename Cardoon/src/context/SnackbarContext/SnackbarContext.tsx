import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";
import { SnackbarContext } from "./SnackbarContext";
interface snackbarStatus {
  open: boolean;
  message: string;
  variant: "success" | "error";
}

export const SnackbarContextProvider = ({
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
