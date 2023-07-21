import React from "react";
import {
    Button,
    Fade,
    Paper
} from "@mui/material";

export default function CombineShardsPanel(): JSX.Element {
    return (
        <Fade in={true} style={{ transitionDelay: "200ms" }}>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", marginTop: "12px" }}>
                <Paper sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", flex: 1 }} >
                        {/*  TODO add Drag n Drop box  */}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", margin: "12px"}}>
                        <Button>Submit</Button>
                    </div>
                </Paper>
            </div>
        </Fade>
    );
}