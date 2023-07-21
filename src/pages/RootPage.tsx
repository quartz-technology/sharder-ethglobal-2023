import React from "react";
import RootTemplate from "../templates/RootTemplate";

export default function RootPage(): JSX.Element {
    return (
        <div style={{ display: "flex", flex: 1 }}>
            <RootTemplate />
        </div>
    );
}