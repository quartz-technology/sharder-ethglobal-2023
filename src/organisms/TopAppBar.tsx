import React from "react";
import {AppBar, Box, Divider, Stack, Toolbar, Typography} from "@mui/material";

export default function TopAppBar(): JSX.Element {
    return (
        <Box>
            <AppBar
                position={"fixed"}
                elevation={0}
                color={"transparent"}
                component="nav"
            >
                <Toolbar>
                    <Stack flexGrow={1} alignItems={"center"}>
                        <Typography variant={"h6"} fontWeight={"bold"}>
                            Sharder
                        </Typography>
                    </Stack>
                </Toolbar>
                <Divider />
            </AppBar>
        </Box>
    );
}