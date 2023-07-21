import React from "react";

interface TabPanelProps {
    child: JSX.Element;
    index: number;
    value: number;
}

export default function TabPanel(props: TabPanelProps) {
    const { child, value, index } = props;

    return (
        <>
            {value === index &&
                <div
                    style={{ display: "flex", flex: 1, paddingTop: "12px" }}
                    role="tabpanel"
                >
                    {value === index && (
                        child
                    )}
                </div>
            }
        </>
    );
}