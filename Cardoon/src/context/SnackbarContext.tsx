import { Alert, Snackbar } from "@mui/material";
import { createContext, useState } from "react";

export const SnackbarContext = createContext({
  openSnackbarWithMessage: (message: string) => {
    console.log(message);
  },
  handleCloseSnackbar: () => {},
});

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [snackbarStatus, setSnackbarStatus] = useState({
    open: false,
    message: "",
  });

  const openSnackbarWithMessage = (message: string) => {
    setSnackbarStatus({ open: true, message });
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
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarStatus.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
