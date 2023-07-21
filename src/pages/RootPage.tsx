import React from "react";
import RootTemplate from "../templates/RootTemplate";
import {SharderContextProvider} from "../hooks/context/SharderContext";

export default function RootPage(): JSX.Element {
    return (
        <div style={{ display: "flex", flex: 1 }}>
            <SharderContextProvider>
                <RootTemplate />
            </SharderContextProvider>
        </div>
    );
}