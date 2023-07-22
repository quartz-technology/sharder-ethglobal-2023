import "./polyfills"
import React from "react";
import {createTheme, CssBaseline, responsiveFontSizes, Stack, ThemeProvider} from "@mui/material";
import TopAppBar from "./organisms/TopAppBar";
import RootPage from "./pages/RootPage";
import {init} from "@airstack/airstack-react";

init(process.env.REACT_APP_AIRSTACK_API_KEY!);

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
                style={{ display: "flex", position: "absolute", top: 0, left: 0, height: "100vh", width: "100vw", margin: 0 }}
            >
                <Stack>
                    <TopAppBar />
                    <RootPage />
                </Stack>
            </div>
        </ThemeProvider>
    );
}

export default App;
