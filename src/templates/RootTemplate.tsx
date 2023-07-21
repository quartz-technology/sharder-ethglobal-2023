import React from "react";
import {Box, Stack, Tab, Tabs} from "@mui/material";
import SplitSecretPanel from "../organisms/SplitSecretPanel/SplitSecretPanel";
import CombineShardsPanel from "../organisms/CombineShardsPanel";
import TabPanel from "../organisms/TabPanel";

export default function RootTemplate(): JSX.Element {
    const panels: JSX.Element[] = [
        SplitSecretPanel(),
        CombineShardsPanel(),
    ];
    const [selectedPanelID, setSelectedPanelID] = React.useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newSelectedPanelID: number) => {
        setSelectedPanelID(newSelectedPanelID);
    };

    return (
        <div
            style={{
                display: "flex",
                flex: 1,
                marginTop: "12px",
                marginBottom: "24px",
                marginRight: "24px",
                marginLeft: "24px",
            }}
        >
            <Stack width={"100%"}>
                <Box sx={{ width: "100%", borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                        variant={"fullWidth"}
                        value={selectedPanelID}
                        onChange={handleChange}
                    >
                        <Tab label="Split secret" />
                        <Tab label="Combine shards" />
                    </Tabs>
                </Box>
                {/* TODO: Context for panels */}
                {panels.map((panel, id) => {
                    return <TabPanel key={id} index={id} value={selectedPanelID} child={panel} />;
                })}
            </Stack>
        </div>
    );
}