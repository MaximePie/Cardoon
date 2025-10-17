import { createContext } from "react";

export const SnackbarContext = createContext({
  openSnackbarWithMessage: (
    message: string,
    variant: "success" | "error" = "success"
  ) => {
    console.log(message, variant);
  },
  handleCloseSnackbar: () => {},
});
