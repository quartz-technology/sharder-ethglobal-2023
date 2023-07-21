import React from "react";
import TopAppBar from "./organisms/TopAppBar";
import {createTheme, CssBaseline, responsiveFontSizes, ThemeProvider} from "@mui/material";

let theme = createTheme({
    palette: {
        mode: "dark",
    },
});

theme = responsiveFontSizes(theme);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div
                id={"app-container"}
                style={{ display: "flex", position: "absolute", top: 0, left: 0, height: "100%", width: "100%", margin: 0 }}
            >
                <TopAppBar />
            </div>
        </ThemeProvider>
    );
}

export default App;
